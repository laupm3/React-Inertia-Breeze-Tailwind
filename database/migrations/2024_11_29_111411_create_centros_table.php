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
        Schema::create('centros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->nullOnDelete();
            $table->foreignId('responsable_id')->constrained('users');
            $table->foreignId('coordinador_id')->constrained('users');
            $table->foreignId('estado_id')->constrained('estado_centros');
            $table->foreignId('direccion_id')->constrained('direcciones');
            $table->string('nombre');
            $table->string('email');
            $table->string('telefono');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('centros', function (Blueprint $table) {
            $table->dropForeign(['empresa_id']);
            $table->dropForeign(['responsable_id']);
            $table->dropForeign(['coordinador_id']);
            $table->dropForeign(['estado_id']);
            $table->dropForeign(['direccion_id']);
        });
        Schema::dropIfExists('centros');
        Schema::enableForeignKeyConstraints();
    }
};
