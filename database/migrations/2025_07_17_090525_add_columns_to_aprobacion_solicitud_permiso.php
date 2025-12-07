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
        Schema::table('aprobacion_solicitud_permisos', function (Blueprint $table) {
            $table->boolean('is_automatic')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aprobacion_solicitud_permisos', function (Blueprint $table) {
            $table->dropColumn(['is_automatic', 'source_approval_type', 'automatic_reason']);
        });
    }
};
