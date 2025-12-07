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
        Schema::create('aprobacion_solicitud_permisos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_permiso_id')->constrained('solicitud_permisos')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->noActionOnDelete();
            $table->enum('tipo_aprobacion', ['manager', 'hr', 'direction']);
            $table->boolean('aprobado');
            $table->text('observacion')->nullable();
            $table->timestamps();

            // Impedir múltiples aprobaciones del mismo tipo para una solicitud
            $table->unique(['solicitud_permiso_id', 'tipo_aprobacion'], 'unique_aprobacion_tipo');
        });
    }

    /** 
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aprobacion_solicitud_permisos');
    }
};
