<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transforma el recurso de notificación en un array.
     * 
     * Este método convierte el modelo Notification en un formato
     * estructurado para ser enviado como respuesta JSON al frontend.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sender' => $this->whenLoaded(
                'sender',
                fn() => new UserResource($this->sender),
                null
            ),
            'receiver' => $this->whenLoaded(
                'receiver',
                fn() => new UserResource($this->receiver),
                null
            ),
            'action' => $this->action,
            'title' => $this->title,
            'content' => $this->content,
            'data' => $this->data,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at,
            'sent_at' => $this->sent_at->toISOString(),
            'received_at' => $this->received_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'action_model' => $this->action_model,
        ];
    }
}
