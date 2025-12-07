<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\IncidentStatus;
use App\Enums\PriorityLevel;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique()->nullable();
            $table->string('title');
            $table->text('description')->nullable();

            // Relaciones principales
            $table->foreignId('reported_by_id')->constrained('users');
            $table->foreignId('assigned_to_id')->nullable()->constrained('users');
            $table->foreignId('resolved_by_id')->nullable()->constrained('users');

            // Relación con subcategoría
            $table->foreignId('tipo_incidencia_id')->constrained('tipo_incidencias');

            // Polimorfismo principal - el modelo que tiene la incidencia
            $table->nullableMorphs('incidentable');

            // Polimorfismo secundario - modelo relacionado (opcional)
            $table->nullableMorphs('related_model');

            // Campos de estado y prioridad
            $table->enum('status', array_column(IncidentStatus::cases(), 'value'))
                  ->default(IncidentStatus::PENDING_REVIEW->value);
            $table->enum('priority', array_column(PriorityLevel::cases(), 'value'))
                  ->default(PriorityLevel::MEDIUM->value);

            // Campos de tiempo
            $table->dateTime('reported_at');
            $table->dateTime('assigned_at')->nullable();
            $table->dateTime('resolved_at')->nullable();
            $table->dateTime('due_date')->nullable();

            // Campos adicionales para flexibilidad
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices para optimización (sin duplicar los que Laravel crea automáticamente)
            $table->index(['tipo_incidencia_id', 'status']);
            $table->index(['status', 'priority']);
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
