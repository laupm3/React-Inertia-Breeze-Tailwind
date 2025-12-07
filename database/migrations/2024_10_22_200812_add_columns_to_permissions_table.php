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
        $tableNames = config('permission.table_names');
        $tableName = $tableNames['permissions'];

        Schema::table($tableName, function (Blueprint $table) use ($tableName) {
            // Solo agregar la columna description si no existe
            if (!Schema::hasColumn($tableName, 'description')) {
                $table->text('description')->nullable()->after('name');
            }

            // Solo agregar la columna title si no existe
            if (!Schema::hasColumn($tableName, 'title')) {
                $table->string('title')->unique()->after('name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');
        $tableName = $tableNames['permissions'];

        Schema::table($tableName, function (Blueprint $table) use ($tableName) {
            // Verificar si las columnas existen antes de eliminarlas
            if (Schema::hasColumn($tableName, 'module_id')) {
                Schema::disableForeignKeyConstraints();
                $table->dropForeign(['module_id']);
                $table->dropColumn('module_id');
                Schema::enableForeignKeyConstraints();
            }

            if (Schema::hasColumn($tableName, 'description')) {
                $table->dropColumn('description');
            }

            if (Schema::hasColumn($tableName, 'title')) {
                $table->dropColumn('title');
            }
        });
    }
};
