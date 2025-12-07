<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('empleados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tipo_empleado_id')->constrained('tipo_empleados');
            $table->foreignId('genero_id')->constrained('generos');
            $table->foreignId('estado_id')->constrained('estado_empleados');
            $table->foreignId('tipo_documento_id')->constrained('tipo_documentos');
            $table->foreignId('direccion_id')->constrained('direcciones')->cascadeOnDelete();
            $table->string('nombre');
            $table->string('primer_apellido');
            $table->string('segundo_apellido')->nullable();
            $table->string('nif')->unique();
            $table->date('caducidad_nif')->nullable();
            $table->string('email')->unique();
            $table->string('email_secundario')->nullable();
            $table->string('telefono');
            $table->string('telefono_personal_movil')->nullable();
            $table->string('telefono_personal_fijo')->nullable();
            $table->string('extension_centrex')->nullable();
            $table->date('fecha_nacimiento');
            $table->date('seniority_date')->nullable();
            $table->string('niss')->unique();
            $table->string('contacto_emergencia')->nullable();
            $table->string('telefono_emergencia')->nullable();
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
        Schema::table('empleados', function (Blueprint $table) {
            $table->dropForeign(['tipo_empleado_id']);
            $table->dropForeign(['genero_id']);
            $table->dropForeign(['estado_id']);
            $table->dropForeign(['tipo_documento_id']);
            $table->dropForeign(['direccion_id']);
        });
        Schema::dropIfExists('empleados');
        Schema::enableForeignKeyConstraints();
    }
};
