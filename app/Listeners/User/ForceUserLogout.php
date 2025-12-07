<?php

namespace App\Listeners\User;

use App\Events\User\UserBanned;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Listener para forzar el cierre de sesión de un usuario en todos sus dispositivos.
 * Esta es una acción de seguridad crítica y se ejecuta de forma síncrona (inmediata).
 * NO debe implementar ShouldQueue.
 */
class ForceUserLogout
{
    /**
     * Handle the event.
     *
     * @param  \App\Events\User\UserBanned  $event
     * @return void
     */
    public function handle(UserBanned $event): void
    {
        $user = $event->user;

        try {
            // 1. Invalidar todas las sesiones web.
            // Se mantiene la buena práctica de revisar el driver de sesión.
            if (config('session.driver') === 'database') {
                $deletedSessions = DB::table('sessions')
                    ->where('user_id', $user->id)
                    ->delete();

                if ($deletedSessions > 0) {
                    Log::info("Se forzó el cierre de {$deletedSessions} sesiones web para el usuario baneado.", [
                        'user_id' => $user->id,
                    ]);
                }
            }
            // Aquí se podría añadir lógica para otros drivers como 'redis' si fuera necesario.

            // 2. Revocar todos los tokens de API (Sanctum).
            // Este es el nuevo paso de seguridad crítico.
            $deletedTokens = $user->tokens()->delete();
            if ($deletedTokens > 0) {
                Log::info("Se revocaron {$deletedTokens} tokens de API para el usuario baneado.", [
                    'user_id' => $user->id,
                ]);
            }
        } catch (\Exception $e) {
            Log::critical('Falló una acción de seguridad crítica: forzar el cierre de sesión de un usuario baneado.', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
