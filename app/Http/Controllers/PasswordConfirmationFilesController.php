<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cookie;

class PasswordConfirmationFilesController extends Controller
{
    /**
     * Devuelve el estado de la confirmación de contraseña:
     * - confirmedUntil: timestamp (en milisegundos) hasta que la confirmación es válida o 0 si no está confirmada.
     * - attempts: número de intentos fallidos acumulados.
     * - locked: booleano que indica si el usuario está bloqueado.
     * - lockTime: tiempo restante (en segundos) del bloqueo.
     */
    public function status(Request $request)
    {
        // Recuperar el valor de la cookie confirmedUntil (almacenado como timestamp en milisegundos).
        $confirmedUntil = 0;
        if ($request->hasCookie('confirmedUntil')) {
            $confirmedUntil = (int) $request->cookie('confirmedUntil');
        }

        // Recuperar datos de intentos y bloqueo desde la sesión.
        $attempts = session('password_attempts', 0);
        $locked   = session('password_locked', false);
        $lockTime = 0;
        if ($locked) {
            $lockEnd = session('password_lock_end', 0);
            $now     = now()->timestamp; // tiempo actual en segundos.
            if ($lockEnd > $now) {
                $lockTime = $lockEnd - $now;
            } else {
                // El bloqueo ha expirado: reiniciamos el estado de bloqueo y el contador de intentos.
                session()->forget(['password_locked', 'password_lock_end', 'password_attempts']);
                $locked   = false;
                $attempts = 0;
            }
        }

        return response()->json([
            'confirmedUntil' => $confirmedUntil,
            'attempts'       => $attempts,
            'locked'         => $locked,
            'lockTime'       => $lockTime,
        ]);
    }

    /**
     * Recibe la contraseña a confirmar.
     *
     * En caso de éxito:
     * - Se establece la cookie HttpOnly “confirmedUntil” con vigencia de 1 minuto.
     * - Se borran los intentos y bloqueos de la sesión.
     *
     * En caso de error:
     * - Se incrementa el contador de intentos.
     * - Al llegar a 3 intentos fallidos, se activa un bloqueo de 15 segundos.
     */
    public function confirm(Request $request)
    {
        // Si existe una marca de bloqueo, primero comprobamos si ya expiró.
        $lockEnd = session('password_lock_end', 0);
        if ($lockEnd && now()->timestamp >= $lockEnd) {
            session()->forget(['password_locked', 'password_lock_end', 'password_attempts']);
        }
        
        // Si el usuario está (todavía) bloqueado, devolvemos el estado actual sin procesar el intento.
        if (session('password_locked', false)) {
            $lockEnd = session('password_lock_end', 0);
            $lockTime = max($lockEnd - now()->timestamp, 0);
            return response()->json([
                'attempts' => session('password_attempts', 0),
                'locked'   => true,
                'lockTime' => $lockTime,
            ], 423); // 423 Locked
        }

        $request->validate([
            'password' => 'required|string',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 403);
        }

        if (Hash::check($request->password, $user->password)) {
            // Contraseña correcta.
            $confirmationDurationSeconds = 60; // 1 minuto de vigencia
            $confirmedUntilTimestamp = Carbon::now()
                                            ->addSeconds($confirmationDurationSeconds)
                                            ->timestamp * 1000;
            // Limpiamos los datos de intentos y bloqueo.
            session()->forget(['password_attempts', 'password_locked', 'password_lock_end']);
            // Crear la cookie HttpOnly "confirmedUntil" con duración de 1 minuto.
            $cookie = cookie(
                'confirmedUntil',
                $confirmedUntilTimestamp,
                1,      // duración en minutos
                null,
                null,
                false,  // secure (modificar si se usa HTTPS)
                true    // httpOnly
            );

            return response()->json(['message' => 'Password confirmed'])
                ->withCookie($cookie);
        } else {
            // Contraseña incorrecta: se incrementa el contador de intentos.
            $attempts = session('password_attempts', 0) + 1;
            session(['password_attempts' => $attempts]);

            if ($attempts >= 3) {
                // Se alcanzaron 3 intentos: se activa un bloqueo por 15 segundos.
                $lockDurationSeconds = 15;
                session(['password_locked' => true]);
                session(['password_lock_end' => now()->timestamp + $lockDurationSeconds]);
                return response()->json([
                    'attempts' => $attempts,
                    'locked'   => true,
                    'lockTime' => $lockDurationSeconds,
                ], 423);
            } else {
                return response()->json([
                    'attempts' => $attempts,
                    'locked'   => false,
                    'lockTime' => 0,
                ], 422);
            }
        }
    }
}
