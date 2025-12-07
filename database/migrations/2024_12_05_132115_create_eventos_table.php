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
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tipo_evento_id')->constrained('tipo_eventos');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('team_id')->nullable()->constrained('teams');
            $table->foreignId('departamento_id')->nullable()->constrained('departamentos');
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->json('description');
            $table->date('fecha');
            $table->string('hora');
            $table->string('color');
            $table->string('type');
            $table->json('participants');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('eventos', function (Blueprint $table) {
            $table->dropForeign(['tipo_evento_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['team_id']);
            $table->dropForeign(['departamento_id']);
        });
        Schema::dropIfExists('eventos');
        Schema::enableForeignKeyConstraints();

        Schema::dropIfExists('events');
    }
};
