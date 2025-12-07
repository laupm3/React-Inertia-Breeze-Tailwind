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
        // Solo crear la tabla si no existe
        if (!Schema::hasTable('solicitud_permisos')) {
            Schema::create('solicitud_permisos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('empleado_id')->constrained('empleados')->cascadeOnDelete();
                $table->foreignId('permiso_id')->constrained('permisos')->cascadeOnDelete();
                $table->foreignId('estado_id')->constrained('estado_solicitud_permisos')->cascadeOnDelete();

                $table->dateTime('fecha_inicio');
                $table->dateTime('fecha_fin')->nullable();
                $table->text('motivo')->nullable();
                $table->boolean('recuperable')->default(false);
                $table->dateTime('seen_at')->nullable();

                $table->timestamps();
                $table->softDeletes();

                $table->index('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        if (Schema::hasTable('solicitud_permisos')) {
            Schema::table('solicitud_permisos', function (Blueprint $table) {
                if (Schema::hasColumn('solicitud_permisos', 'empleado_id')) {
                    $table->dropForeign(['empleado_id']);
                }
                if (Schema::hasColumn('solicitud_permisos', 'permiso_id')) {
                    $table->dropForeign(['permiso_id']);
                }
                if (Schema::hasColumn('solicitud_permisos', 'estado_id')) {
                    $table->dropForeign(['estado_id']);
                }
            });
            Schema::dropIfExists('solicitud_permisos');
        }
        Schema::enableForeignKeyConstraints();
    }
};
