<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class AuthGoogleController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google. Update the user information if it already exists and log the user in
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Verify if the user already exists
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                return redirect('/login')->dangerBanner('The google account is not registered in our system.');
            }

            // Verificar si el usuario está baneado
            if ($user->status === \App\Enums\UserStatus::BANNED) {
                return redirect('/login')->dangerBanner('Tu cuenta ha sido baneada. Por favor, contacta al administrador.');
            }

            $user->forceFill([
                'google_id' => $googleUser->getId()
            ])->save();

            Auth::login($user);

            return redirect('dashboard');
        } catch (\Exception $e) {
            // Manejo de errores si falla la autenticación con Google
            return redirect('/login')->warningBanner('Error authenticating with Google.');
        }
    }
}
