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
        Schema::create('folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('nivel_acceso_id')->constrained('niveles_acceso')->cascadeOnDelete();
            $table->foreignId('nivel_seguridad_id')->constrained('niveles_seguridad')->cascadeOnDelete();
            $table->foreignId('tipo_fichero_id')->constrained('tipo_ficheros')->cascadeOnDelete();

            // Campos específicos de archivos
            $table->string('hash')->unique();
            $table->string('name');
            $table->string('path', 512);
            $table->string('extension', 10)->nullable(); // Extensión directa para archivos
            $table->integer('size')->default(0);
            $table->string('description')->nullable();

            // Campos de control
            $table->boolean('is_erasable')->default(false);
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_sharable')->default(false);

            // Campos para nestedset
            $table->nestedSet(); // Esto añade _lft, _rgt y parent_id

            // Campos de tiempo
            $table->timestamps();
            $table->softDeletes();

            // Relación polimórfica para archivos adjuntos
            $table->nullableMorphs('fileable');

            // Índices para optimización
            $table->index(['_lft', '_rgt']);
            $table->index('extension'); // Índice para búsquedas rápidas por extensión
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('folders');
    }
};
