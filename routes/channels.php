<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
| En este caso, el canal 'notifications' se utiliza para enviar notificaciones a los usuarios.
*/

// Autorizar el canal privado para el usuario
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return $user->id === (int) $id;
});

/**
 * Canal privado para emitir todas las actualizaciones de datos del dashboard.
 * Solo los administradores pueden escuchar los eventos de este canal.
 */
Broadcast::channel('dashboard', function (User $user) {
    return $user->hasAnyRole(['Administrator', 'Super Admin']);
});

/**
 * Canal de presencia para toda la aplicación.
 * El frontend lo usará para mantener un contador de usuarios conectados en tiempo real.
 */
Broadcast::channel('presence-app', function (User $user) {
    if ($user) {
        // Solo necesitamos confirmar que el usuario está autenticado.
        // Devolver un array (incluso con datos mínimos) lo convierte en un canal de presencia.
        return ['id' => $user->id];
    }
    return null;
});

