<?php

namespace App\Events\Calendario;

use App\Models\Evento;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class EventoCalendarioCreado implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    protected $eventoId;
    protected $eventoData;
    protected $channels;

    /**
     * Create a new event instance.
     */
    public function __construct(Evento $evento)
    {
        $this->eventoId = $evento->id;
        
        // Cargar relaciones necesarias
        $evento->load(['tipoEvento', 'users']);

        // Preparar los canales de broadcast
        $this->channels = $evento->users->map(function($user) {
            return new PrivateChannel('App.Models.User.' . $user->id);
        })->toArray();

        // Preparar datos del evento
        $this->eventoData = [
            'id' => $evento->id,
            'title' => $evento->nombre,
            'start' => $evento->fecha_inicio ? Carbon::parse($evento->fecha_inicio)->format('Y-m-d H:i:s') : null,
            'end' => $evento->fecha_fin ? Carbon::parse($evento->fecha_fin)->format('Y-m-d H:i:s') : null,
            'tipo' => $evento->tipoEvento->nombre ?? 'Sin tipo',
            'descripcion' => $evento->descripcion,
            'color' => $evento->tipoEvento->color ?? '#3788d8',
            'participantes' => $evento->users->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name
                ];
            })->toArray()
        ];

        Log::info('🎯 Construyendo EventoCalendarioCreado', [
            'evento_id' => $this->eventoId,
            'datos' => $this->eventoData
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        Log::info('🎯 Entrando a broadcastOn');
        return $this->channels;
    }

    /**
     * Nombre del evento para el broadcast
     */
    public function broadcastAs(): string
    {
        return 'calendar.evento.created';
    }

    /**
     * Datos a enviar en el broadcast
     */
    public function broadcastWith(): array
    {
        Log::info('🎯 Entrando a broadcastWith');
        return ['evento' => $this->eventoData];
    }
} 