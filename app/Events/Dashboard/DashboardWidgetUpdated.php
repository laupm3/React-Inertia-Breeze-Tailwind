<?php

namespace App\Events\Dashboard;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DashboardWidgetUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El nombre del widget que debe ser actualizado.
     * Ejemplo: 'employees_by_department', 'pending_vacations', etc.
     *
     * @var string
     */
    public string $widgetName;

    /**
     * Los nuevos datos para el widget.
     *
     * @var array
     */
    public array $widgetData;

    /**
     * Create a new event instance.
     *
     * @param string $widgetName El identificador único del widget que se ha actualizado.
     * @param array $widgetData Los nuevos datos para el widget.
     */
    public function __construct(string $widgetName, array $widgetData)
    {
        $this->widgetName = $widgetName;
        $this->widgetData = $widgetData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * Este método define que el evento se enviará a nuestro canal privado 'dashboard'.
     * Solo los usuarios autorizados (administradores) en routes/channels.php podrán recibirlo.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('dashboard'),
        ];
    }

    /**
     * The name of the event's broadcast.
     *
     * Le damos un nombre limpio al evento para que el frontend pueda escucharlo fácilmente.
     * En Laravel Echo, escucharían: .listen('.dashboard.widget.updated', ...)
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'widget.updated';
    }

    /**
     * Get the data to broadcast.
     *
     * Define el payload exacto que recibirá el frontend.
     * Recibirán un objeto JSON como: { "widgetName": "employees_by_department", "widgetData": {...} }
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'widgetName' => $this->widgetName,
            'widgetData' => $this->widgetData,
        ];
    }
}
