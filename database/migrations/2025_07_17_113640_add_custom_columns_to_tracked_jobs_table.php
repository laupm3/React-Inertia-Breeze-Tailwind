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
        $table_name = config('trackable-jobs.tables.tracked_jobs', 'tracked_jobs');

        Schema::table($table_name, function (Blueprint $table) {
            // Autor del job (usuario que lo ejecutó)
            $table->foreignId('user_id')->nullable()->constrained('users')->after('name');
            
            // Datos antes y después de la ejecución
            $table->json('pre_data')->nullable()->after('user_id');
            $table->json('post_data')->nullable()->after('pre_data');
            
            // Índices para mejorar el rendimiento
            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $table_name = config('trackable-jobs.tables.tracked_jobs', 'tracked_jobs');

        Schema::table($table_name, function (Blueprint $table) {
            // Eliminar índices
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['status', 'created_at']);
            
            // Eliminar columnas
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'pre_data', 'post_data']);
        });
    }
};
