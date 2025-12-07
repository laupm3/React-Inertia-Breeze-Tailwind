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
        Schema::create('incident_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained('incidents')->cascadeOnDelete();

            // Campos para los detalles
            $table->integer('quantity')->nullable();
            $table->text('notes')->nullable();

            // Polimorfismo para relacionar con cualquier modelo
            $table->string('relatedDetail_type')->nullable();
            $table->unsignedBigInteger('relatedDetail_id')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['incident_id']);
            $table->index(['relatedDetail_type', 'relatedDetail_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incident_details');
    }
};
