<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Junges\TrackableJobs\TrackableJob;
use Throwable;

class CreateNotificationRecord extends TrackableJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $senderId;
    protected $receiverId;
    protected $notifiableModel;
    protected $modelId;
    protected $actionModel;
    protected $title;
    protected $content;
    protected $data;

    /**
     * Create a new job instance.
     */
    public function __construct(
        int $senderId,
        int $receiverId,
        string $notifiableModel,
        int $modelId,
        string $actionModel,
        string $title,
        string $content,
        array $data
    ) {
        $this->senderId = $senderId;
        $this->receiverId = $receiverId;
        $this->notifiableModel = $notifiableModel;
        $this->modelId = $modelId;
        $this->actionModel = $actionModel;
        $this->title = $title;
        $this->content = $content;
        $this->data = $data;

        parent::__construct();
    }


    /**
     * Establece el ID del modelo que se está notificando.
     */
    public function trackableKey(): ?string
    {
        return (string) $this->modelId;
    }

    /**
     * Establece el tipo de modelo que se está notificando.
     */
    public function trackableType(): ?string
    {
        return $this->notifiableModel;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Obtener el usuario remitente para el log
        $sender = User::find($this->senderId);
        
        Log::info("🔄 Iniciando creación de registro de notificación", [
            'sender_name' => $sender?->name ?? 'Unknown',
            'receiver_id' => $this->receiverId,
            'notifiable_model' => $this->notifiableModel,
            'model_id' => $this->modelId,
        ]);

        // Crear el registro de notificación en la base de datos
        $notification = Notification::create([
            'sender_id' => $this->senderId,
            'receiver_id' => $this->receiverId,
            'notifiable_model' => $this->notifiableModel,
            'model_id' => $this->modelId,
            'action_model' => $this->actionModel,
            'title' => $this->title,
            'content' => $this->content,
            'data' => $this->data,
            'sent_at' => now(),
        ]);

        Log::info("✅ Registro de notificación programada creado correctamente", [
            'notification_id' => $notification->id,
            'receiver_id' => $this->receiverId,
            'notifiable_model' => $this->notifiableModel,
            'model_id' => $this->modelId,
            'action_model' => $this->actionModel,
            'sent_at' => $notification->sent_at->toISOString(),
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::error("❌ Job falló: CreateNotificationRecord", [
            'receiver_id' => $this->receiverId,
            'notifiable_model' => $this->notifiableModel,
            'model_id' => $this->modelId,
            'action_model' => $this->actionModel,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
} 