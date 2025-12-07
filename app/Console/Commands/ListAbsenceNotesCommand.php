<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Horario;
use App\Models\AbsenceNote;

class ListAbsenceNotesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'absence-notes:list {horario_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Lista las notas de ausencia asociadas a los horarios';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $horarioId = $this->argument('horario_id');

        if ($horarioId) {
            $horario = Horario::find($horarioId);

            if (!$horario) {
                $this->error("No se encontró el horario con ID {$horarioId}");
                return;
            }

            $notes = AbsenceNote::where('horario_id', $horarioId)->get();

            if ($notes->isEmpty()) {
                $this->info("No hay notas de ausencia asociadas al horario con ID {$horarioId}");
            } else {
                $this->info("Notas de ausencia asociadas al horario con ID {$horarioId}:");
                $this->table(['ID', 'Status', 'Reason'], $notes->toArray());
            }
        } else {
            $notes = AbsenceNote::all();

            if ($notes->isEmpty()) {
                $this->info("No hay notas de ausencia en la base de datos.");
            } else {
                $this->info("Todas las notas de ausencia:");
                $this->table(['ID', 'Horario ID', 'Status', 'Reason'], $notes->toArray());
            }
        }
    }
}
