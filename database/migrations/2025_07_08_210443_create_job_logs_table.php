<?php

use App\Enums\JobStatus;
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
        if (!Schema::hasTable('job_logs')) {
            Schema::create('job_logs', function (Blueprint $table) {
                $table->id();
                $table->string('job_name'); // Nombre de la clase del job
                $table->string('job_id')->nullable(); // ID del job en la cola de Laravel
                $table->string('status')->default(JobStatus::PENDING->value);
                $table->nullableMorphs('source'); // source_type y source_id para saber qué modelo lo disparó
                $table->text('payload')->nullable(); // Información adicional del job
                $table->text('error_message')->nullable(); // Mensaje de error si falla
                $table->text('error_trace')->nullable(); // Stack trace del error
                $table->timestamp('started_at')->nullable();
                $table->timestamp('finished_at')->nullable();
                $table->integer('execution_time')->nullable(); // Tiempo de ejecución en segundos
                $table->timestamps();
            });
        }

        // Agregar índices si no existen
        Schema::table('job_logs', function (Blueprint $table) {
            if (!Schema::hasIndex('job_logs', 'job_logs_status_index')) {
                $table->index(['status'], 'job_logs_status_index');
            }
            if (!Schema::hasIndex('job_logs', 'job_logs_source_type_source_id_index')) {
                $table->index(['source_type', 'source_id'], 'job_logs_source_type_source_id_index');
            }
            if (!Schema::hasIndex('job_logs', 'job_logs_created_at_index')) {
                $table->index(['created_at'], 'job_logs_created_at_index');
            }
            if (!Schema::hasIndex('job_logs', 'job_logs_job_name_index')) {
                $table->index(['job_name'], 'job_logs_job_name_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_logs');
    }
};
