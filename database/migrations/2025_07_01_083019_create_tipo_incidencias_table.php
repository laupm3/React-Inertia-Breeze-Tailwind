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
        Schema::create('tipo_incidencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('code')->unique(); // Código único para identificar la subcategoría
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0); // Para ordenar las subcategorías

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['module_id', 'is_active']);
            $table->index('code');
            $table->unique(['module_id', 'name']); // Una subcategoría por nombre dentro de un módulo
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipo_incidencias');
    }
};