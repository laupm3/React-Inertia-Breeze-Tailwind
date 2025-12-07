<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Enums\UserStatus;

class CheckBannedUser
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            $user->refresh(); // Refrescar desde la base de datos
            
            if ($user->status === UserStatus::BANNED->value || $user->status == 4) {
                $message = 'Tu cuenta ha sido suspendida. Por favor, contacta con un administrador.';
                
                // Limpiar caché del usuario
                Cache::forget("user-state-{$user->id}");
                
                // Forzar logout
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                if ($request->wantsJson() || $request->header('X-Inertia')) {
                    return redirect('/login')->with('banned_message', $message);
                }

                return redirect('/login')->with('banned_message', $message);
            }
        }

        return $next($request);
    }
}