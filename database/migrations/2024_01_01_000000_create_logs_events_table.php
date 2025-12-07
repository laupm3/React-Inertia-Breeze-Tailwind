<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logs_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); 
            $table->string('model_type'); 
            $table->unsignedBigInteger('model_id');
            $table->json('model_data')->nullable();
            $table->json('changes')->nullable(); 
            $table->json('original')->nullable();
            $table->string('user_id')->nullable(); 
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['model_type', 'model_id']);
            $table->index(['event_type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs_events');
    }
}; 