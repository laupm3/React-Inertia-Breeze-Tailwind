<?php

namespace App\Http\Controllers\API\v1\Admin;

use App\Models\AbsenceNote;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use App\Services\AbsenceNote\AbsenceNoteService;
use App\Http\Resources\AbsenceNoteResource;
use App\Http\Requests\Admin\AbsenceNote\AbsenceNoteIndexRequest;
use App\Http\Requests\Admin\AbsenceNote\AbsenceNoteStoreRequest;
use App\Http\Requests\Admin\AbsenceNote\AbsenceNoteUpdateRequest;
use App\Http\Requests\Admin\AbsenceNote\AbsenceNoteDestroyRequest;

class AbsenceNoteController extends Controller
{
    public function __construct(protected AbsenceNoteService $absenceNoteService) {}

    public function index(AbsenceNoteIndexRequest $request)
    {
        $notes = $this->absenceNoteService->getNotes($request->validated());
        return AbsenceNoteResource::collection($notes);
    }

    public function store(AbsenceNoteStoreRequest $request)
    {
        $note = $this->absenceNoteService->createNote($request->validated());
        $note->load('horario.contrato.empleado.user');

        return response()->json([
            'absence_note' => new AbsenceNoteResource($note)
        ], Response::HTTP_CREATED);
    }

    public function show(AbsenceNote $absenceNote)
    {
        $absenceNote->load(AbsenceNote::RELATIONSHIPS);

        return response()->json([
            'absence_note' => new AbsenceNoteResource($absenceNote)
        ]);
    }

    public function update(AbsenceNoteUpdateRequest $request, AbsenceNote $absenceNote)
    {
        $note = $this->absenceNoteService->updateNoteStatus($absenceNote, $request->validated());
        return response()->json([
            'absence_note' => new AbsenceNoteResource($note)
        ]);
    }

    public function destroy(AbsenceNoteDestroyRequest $request, AbsenceNote $absenceNote)
    {
        $absenceNote->delete();
        return response()->noContent();
    }
}
