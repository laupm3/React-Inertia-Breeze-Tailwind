<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('notifications');

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();            
            // Campos para relación polimórfica
            $table->string('notifiable_model'); // Tipo del modelo relacionado
            $table->unsignedBigInteger('model_id'); // ID del modelo relacionado
            
            // Acción realizada
            $table->string('action_model'); // 'created', 'updated', 'deleted', etc.            
            $table->string('title');
            $table->text('content');
            $table->json('data')->nullable(); // Para datos adicionales específicos            
            // Estados y timestamps
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Índice para la relación polimórfica
            $table->index(['notifiable_model', 'model_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
