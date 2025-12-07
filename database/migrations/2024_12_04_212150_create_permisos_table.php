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
        Schema::create('permisos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('permiso_categoria')->cascadeOnDelete();
            $table->string('nombre')->index();
            $table->string('nombre_oficial');
            $table->string('descripcion');
            $table->text('descripcion_oficial');
            $table->boolean('retribuido');
            $table->boolean('yearly_limited')->default(false);
            $table->unsignedBigInteger('duracion')->nullable(); // Duración en milisegundos
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permisos');
    }
};
