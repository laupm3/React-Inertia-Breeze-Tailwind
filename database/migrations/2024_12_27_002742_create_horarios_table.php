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
        Schema::create('horarios', function (Blueprint $table) {
            // Valores propios del horario
            $table->id();
            $table->foreignId('contrato_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('anexo_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('estado_horario_id')->constrained('estado_horarios')->cascadeOnDelete();
            $table->foreignId('modalidad_id')->constrained('modalidades')->cascadeOnDelete();
            $table->foreignId('turno_id')->constrained('turnos')->cascadeOnDelete();
            $table->foreignId('solicitud_permiso_id')->nullable()->constrained('solicitud_permisos')->noActionOnDelete();

            $table->dateTime('horario_inicio');
            $table->dateTime('horario_fin');
            $table->dateTime('descanso_inicio')->nullable();
            $table->dateTime('descanso_fin')->nullable();

            // Estado del fichaje
            $table->enum('estado_fichaje', [
                'sin_iniciar',    // No se ha iniciado el fichaje
                'en_curso',       // Fichaje iniciado y activo
                'en_pausa',       // En descanso
                'descanso_obligatorio', // Descanso obligatorio
                'finalizado'      // Fichaje completado
            ])->default('sin_iniciar');

            // Valores propios del fichaje
            $table->dateTime('fichaje_entrada')->nullable();
            $table->dateTime('fichaje_salida')->nullable();

            // Coordenadas de entrada
            $table->decimal('latitud_entrada', 10, 7)->nullable();
            $table->decimal('longitud_entrada', 10, 7)->nullable();
            
            // Coordenadas de salida
            $table->decimal('latitud_salida', 10, 7)->nullable();
            $table->decimal('longitud_salida', 10, 7)->nullable();

            // IPs de entrada y salida
            $table->ipAddress('ip_address_entrada')->nullable();
            $table->ipAddress('ip_address_salida')->nullable();

            // User agents
            $table->string('user_agent_entrada')->nullable();
            $table->string('user_agent_salida')->nullable();

           /*  // Descansos en formato JSON
            $table->json('descansos')->nullable(); */

            $table->string('observaciones')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('horarios');
    }
};