<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictDemoMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $demoEmail = 'invitado@empresa.com';

        if ($request->user() && $request->user()->email === $demoEmail) {
            if ($request->isMethod('post') || $request->isMethod('put') || $request->isMethod('patch') || $request->isMethod('delete')) {
                
                // Allow login and logout
                if ($request->routeIs('login') || $request->routeIs('logout')) {
                    return $next($request);
                }

                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Modo lectura activado: No se permite modificar datos en la versión demo.',
                    ], 403);
                }

                return back()->with('error', 'Modo lectura activado: No se permite modificar datos en la versión demo.');
            }
        }

        return $next($request);
    }
}
