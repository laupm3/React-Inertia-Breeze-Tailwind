<?php

namespace App\Services\AbsenceNote;

use App\Models\Horario;
use App\Models\AbsenceNote;
use App\Enums\AbsenceNoteStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Services\Dashboard\DashboardService;

class AbsenceNoteService
{
    public function __construct() {}

    public function getNotes(array $filters): LengthAwarePaginator
    {
        // Lógica de filtrado irá aquí
        return AbsenceNote::with('horario.contrato.empleado.user')->latest()->paginate(15);
    }

    public function createNote(array $data): AbsenceNote
    {
        // Aseguramos que el estado inicial siempre sea 'pendiente'.
        // Esto es más robusto que depender del valor por defecto de la DB.
        $data['status'] = AbsenceNoteStatus::PENDING;

        // Al crear la nota, el trait se encargará de disparar el evento.
        return AbsenceNote::create($data);
    }

    public function updateNoteStatus(AbsenceNote $note, array $data): AbsenceNote
    {
        // Al actualizar la nota, el trait se encargará de disparar el evento.
        $note->update($data);

        return $note;
    }
}
