<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class LogsEvent extends Model
{
    protected $fillable = [
        'event_type',
        'model_type',
        'model_id',
        'model_data',
        'changes',
        'original',
        'user_id',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'model_data' => 'array',
        'changes' => 'array',
        'original' => 'array',
    ];

    /**
     * Relación polimórfica con el modelo que generó el evento
     */
    public function eventable(): MorphTo
    {
        return $this->morphTo('model');
    }

    /**
     * Scope para filtrar por tipo de evento
     */
    public function scopeOfType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    /**
     * Scope para filtrar por modelo
     */
    public function scopeForModel($query, string $modelType)
    {
        return $query->where('model_type', $modelType);
    }
} 