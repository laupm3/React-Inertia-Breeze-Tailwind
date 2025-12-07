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
        Schema::create('descansos_adicionales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('horario_id')->constrained()->cascadeOnDelete();
            
            $table->enum('tipo_descanso', [
                'obligatorio',
                'adicional'
            ])->default('adicional');
            
            $table->dateTime('descanso_inicio');
            $table->dateTime('descanso_fin')->nullable();
            
            // Coordenadas de inicio
            $table->decimal('latitud_inicio', 10, 8);
            $table->decimal('longitud_inicio', 11, 8);
            
            // Coordenadas de fin
            $table->decimal('latitud_fin', 10, 8)->nullable();
            $table->decimal('longitud_fin', 11, 8)->nullable();
            
            // IPs
            $table->ipAddress('ip_address_inicio');
            $table->ipAddress('ip_address_fin')->nullable();
            
            // User agents
            $table->string('user_agent_inicio');
            $table->string('user_agent_fin')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('descansos_adicionales');
    }
};
