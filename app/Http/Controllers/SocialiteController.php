<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{

    /**
     * Redirect the user to the provider authentication page
     * 
     * @param string $provider The provider to redirect to
     */
    public function redirectToProvider($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    /**
     * This method will handle the callback from the provider after authentication
     * 
     * @param string $provider The provider to handle the callback for
     * @param \Illuminate\Http\Request $request The current request
     * 
     * @return \Illuminate\Http\RedirectResponse Redirects the user to the profile page / home page
     */
    public function handleProviderCallback($provider, Request $request)
    {
        try {
            if ($provider) {

                $userSocialite = Socialite::driver($provider)->user();

                $user = $request->user();

                $user->forceFill([
                    $provider => $userSocialite->getId()
                ])->save();

                return redirect('user/profile')->banner('Your account has been linked.');
            }
        } catch (\Throwable $th) {

            return redirect('/')->warningBanner('Error authenticating with ' . $provider . '.');
        }
    }
}
