<?php

namespace App\Services\Anexo;

use App\Events\Anexo\AnexoActualizado;
use App\Events\Anexo\AnexoCreado;
use App\Events\Anexo\AnexoEliminado;
use App\Models\Anexo;
use Exception;
use Illuminate\Support\Facades\DB;

class AnexoService
{
    /**
     * Crea un nuevo anexo para un contrato.
     *
     * @throws Exception
     */
    public function createAnexo(array $data): Anexo
    {
        return DB::transaction(function () use ($data) {
            $anexo = Anexo::create($data);

            if (!$anexo) {
                throw new Exception('No se ha podido crear el anexo.');
            }

            event(new AnexoCreado($anexo));

            return $anexo->load(['jornada']);
        });
    }

    /**
     * Actualiza un anexo existente.
     *
     * @throws Exception
     */
    public function updateAnexo(Anexo $anexo, array $data): Anexo
    {
        return DB::transaction(function () use ($anexo, $data) {
            if (!$anexo->update($data)) {
                throw new Exception('No se pudo actualizar el anexo.');
            }

            event(new AnexoActualizado($anexo));

            return $anexo->load(['jornada']);
        });
    }

    /**
     * Elimina un anexo.
     *
     * @throws Exception
     */
    public function deleteAnexo(Anexo $anexo): bool
    {
        return DB::transaction(function () use ($anexo) {
            if (!$anexo->delete()) {
                throw new Exception('No se pudo eliminar el anexo.');
            }

            event(new AnexoEliminado($anexo));

            return true;
        });
    }
}
