<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    /** @use HasFactory<\Database\Factories\NotificationFactory> */
    use HasFactory, SoftDeletes;

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'notifiable_model',  
        'model_id',         
        'action_model',      
        'title',
        'content',
        'data',             
        'is_read',
        'read_at',
        'sent_at',
        'received_at'
    ];

    // Conversión de tipos para los atributos
    protected $casts = [
        'data' => 'array',      // Convierte JSON a array
        'is_read' => 'boolean', // Convierte 0/1 a false/true
        'read_at' => 'datetime',
        'sent_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    /**
     * Obtiene el modelo relacionado.
     * Ya no es una relación polimórfica, pero podemos simular un comportamiento similar.
     */
    public function getRelatedModel()
    {
        if (!$this->notifiable_model || !$this->model_id) {
            return null;
        }

        $modelClass = $this->notifiable_model;
        return $modelClass::find($this->model_id);
    }

    /**
     * Relación con el usuario que envió la notificación.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Relación con el usuario que recibe la notificación.
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Marca la notificación como leída.
     */
    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * Marca la notificación como recibida.
     */
    public function markAsReceived(): void
    {
        $this->update([
            'received_at' => now(),
        ]);
    }

    /**
     * Scope para filtrar solo notificaciones no leídas.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope para filtrar solo notificaciones leídas.
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope para filtrar por acción específica.
     * Ejemplo: Notification::ofAction('created')->get()
     */
    public function scopeOfAction($query, $action)
    {
        return $query->where('action_model', $action);
    }

    /**
     * Scope para filtrar por tipo de modelo.
     * Ejemplo: Notification::forModel(Contrato::class)->get()
     */
    public function scopeForModel($query, $modelType)
    {
        return $query->where('notifiable_model', $modelType);
    }

    /**
     * Scope para filtrar por instancia específica de un modelo.
     * Ejemplo: Notification::forInstance($contrato)->get()
     */
    public function scopeForInstance($query, $model)
    {
        return $query->where('notifiable_model', get_class($model))
                     ->where('model_id', $model->id);
    }

    /**
     * Scope para filtrar por remitente.
     */
    public function scopeFromSender($query, $sender)
    {
        if (is_numeric($sender)) {
            return $query->where('sender_id', $sender);
        }
        return $query->where('sender_id', $sender->id);
    }

    /**
     * Scope para filtrar por destinatario.
     */
    public function scopeToReceiver($query, $receiver)
    {
        if (is_numeric($receiver)) {
            return $query->where('receiver_id', $receiver);
        }
        return $query->where('receiver_id', $receiver->id);
    }

    /**
     * Scope para filtrar notificaciones enviadas.
     */
    public function scopeSent($query)
    {
        return $query->whereNotNull('sent_at');
    }

    /**
     * Scope para filtrar notificaciones no enviadas.
     */
    public function scopeNotSent($query)
    {
        return $query->whereNull('sent_at');
    }

    /**
     * Scope para filtrar notificaciones recibidas.
     */
    public function scopeReceived($query)
    {
        return $query->whereNotNull('received_at');
    }

    /**
     * Scope para filtrar notificaciones no recibidas.
     */
    public function scopeNotReceived($query)
    {
        return $query->whereNull('received_at');
    }

    /**
     * Scope para filtrar notificaciones entre un remitente y un destinatario.
     */
    public function scopeBetween($query, $sender, $receiver)
    {
        return $query->fromSender($sender)->toReceiver($receiver);
    }

    /**
     * Scope para filtrar notificaciones enviadas entre un remitente y un destinatario.
     */
    public function scopeSentBetween($query, $sender, $receiver)
    {
        return $query->between($sender, $receiver)->sent();
    }

    /**
     * Scope para filtrar notificaciones no enviadas entre un remitente y un destinatario.
     */
    public function scopeNotSentBetween($query, $sender, $receiver)
    {
        return $query->between($sender, $receiver)->notSent();
    }

    /**
     * Scope para filtrar notificaciones recibidas entre un remitente y un destinatario.
     */
    public function scopeReceivedBetween($query, $sender, $receiver)
    {
        return $query->between($sender, $receiver)->received();
    }

    /**
     * Scope para filtrar notificaciones no recibidas entre un remitente y un destinatario.
     */
    public function scopeNotReceivedBetween($query, $sender, $receiver)
    {
        return $query->between($sender, $receiver)->notReceived();
    }
}
