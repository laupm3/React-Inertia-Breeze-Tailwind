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
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('empleados')->index();
            $table->foreignId('departamento_id')->constrained();
            $table->foreignId('centro_id')->constrained();
            $table->foreignId('asignacion_id')->constrained('asignaciones')->restrictOnDelete();
            $table->foreignId('tipo_contrato_id')->constrained('tipo_contratos');
            $table->foreignId('empresa_id')->constrained('empresas');
            $table->foreignId('jornada_id')->constrained('jornadas');
            $table->string('n_expediente')->unique();
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin')->nullable();
            $table->boolean('es_computable')->default(false);
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
        Schema::table('contratos', function (Blueprint $table) {
            $table->dropForeign(['empleado_id']);
            $table->dropForeign(['departamento_id']);
            $table->dropForeign(['centro_id']);
            $table->dropForeign(['asignacion_id']);
            $table->dropForeign(['tipo_contrato_id']);
            $table->dropForeign(['empresa_id']);
        });
        Schema::dropIfExists('contratos');
        Schema::enableForeignKeyConstraints();
    }
};
