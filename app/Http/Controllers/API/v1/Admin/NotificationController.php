<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\NotificationResource;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Muestra un listado de todas las notificaciones.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $notifications = Notification::with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(status: Response::HTTP_OK, data: [
            'notifications' => NotificationResource::collection($notifications)->values()
        ]);
    }

    /**
     * Marca una notificación específica como leída, actualizando el registro
     * 
     * @param \Illuminate\Http\Request $request
     * @param Notification $notification
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->receiver_id !== Auth::user()->id) {
            return response()->json(status: Response::HTTP_FORBIDDEN);
        }

        // si la notificación no tiene como null read_at, no se actualiza el read_at y se marca como leída
        Log::info('Notification read_at: ' . $notification->read_at);
        if ($notification->read_at) {
            $notification->update([
                'is_read' => true,
            ]);
           
        }else{
            $notification->update([
                'is_read' => true,
                'read_at' => now()
            ]);
        }

        $notification->load(['sender', 'receiver']);

        return response()->json(status: Response::HTTP_OK, data: [
            'success' => true,
            'notification' => new NotificationResource($notification)
        ]);
    }

    /**
     * Marca una notificación específica como no leída.
     * 
     * @param \Illuminate\Http\Request $request
     * @param Notification $notification
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsUnread(Request $request, Notification $notification)
    {
        if ($notification->receiver_id !== Auth::user()->id) {
            return response()->json(status: Response::HTTP_FORBIDDEN);
        }

        // Actualiza solo el estado de la notificación a no leída
        // pero mantiene el read_at original si existe
        $notification->update([
            'is_read' => false,
            // No modificamos read_at, así se mantiene el registro de la primera lectura
        ]);

        $notification->load(['sender', 'receiver']);

        return response()->json(status: Response::HTTP_OK, data: [
            'success' => true,
            'notification' => new NotificationResource($notification)
        ]);
    }

    /**
     * Marca todas las notificaciones del usuario autenticado como leídas.
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead(Request $request)
    {
        // Actualiza todas las notificaciones no leídas del usuario
        Log::info('Marking all notifications as read');

        // Obtener todas las notificaciones no leídas del usuario
        $unreadNotifications = Notification::where('receiver_id', Auth::user()->id)
            ->where('is_read', false)
            ->get();
        
        // Actualizar cada notificación respetando el read_at original
        foreach ($unreadNotifications as $notification) {
            // Si ya tiene read_at, solo actualizamos is_read
            if ($notification->read_at) {
                $notification->update([
                    'is_read' => true,
                ]);
            } else {
                // Si no tiene read_at, lo establecemos ahora
                $notification->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);
            }
        }

        return response()->json(status: Response::HTTP_OK, data: [
            'success' => true
        ]);
    }

    /**
     * Obtiene el número de notificaciones no leídas del usuario autenticado.
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUnreadCount(Request $request)
    {
        // Cuenta las notificaciones no leídas del usuario
        $count = Notification::where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json(status: Response::HTTP_OK, data: [
            'count' => $count
        ]);
    }

    /**
     * Obtiene los tipos únicos de notificaciones disponibles.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getNotificationTypes()
    {
        $types = Notification::select('notifiable_model')
            ->distinct()
            ->whereNotNull('notifiable_model')
            ->pluck('notifiable_model')
            ->map(function ($type) {
                return [
                    'value' => $type,
                    'label' => class_basename($type) // Esto convertirá "App\Models\Centro" en "Centro"
                ];
            });

        return response()->json([
            'types' => $types
        ]);
    }

    /**
     * Obtiene los tipos de acciones disponibles en las notificaciones.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getActionTypes()
    {
        $actions = Notification::select('action_model')
            ->distinct()
            ->whereNotNull('action_model')
            ->pluck('action_model')
            ->map(function ($action) {
                return [
                    'value' => $action,
                    // Convertimos 'created', 'updated', etc. en formato más legible
                    'label' => ucfirst($action) // 'created' -> 'Created'
                ];
            });

        return response()->json([
            'actions' => $actions
        ]);
    }

    /**
     * Obtiene la lista de remitentes únicos de las notificaciones.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSenders()
    {
        $senders = Notification::join('users', 'notifications.sender_id', '=', 'users.id')
            ->select('users.id', 'users.name')
            ->distinct()
            ->whereNotNull('sender_id')
            ->get()
            ->map(function ($user) {
                return [
                    'value' => (string) $user->id, // Convertimos a string para consistencia
                    'label' => $user->name
                ];
            });

        return response()->json([
            'senders' => $senders
        ]);
    }
}
