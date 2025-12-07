<?php

namespace App\Services\Contrato;

use App\Events\Contrato\ContratoActualizado;
use App\Events\Contrato\ContratoCreado;
use App\Events\Contrato\ContratoEliminado;
use App\Models\Contrato;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ContratoService
{
    /**
     * Obtiene todos los contratos con sus relaciones para el listado.
     */
    public function getAllContratos(): Collection
    {
        return Contrato::with(Contrato::RELATIONSHIPS)
            ->withCount('anexos')
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * Obtiene un contrato específico con todas sus relaciones.
     */
    public function getContrato(Contrato $contrato): Contrato
    {
        return $contrato->load(Contrato::RELATIONSHIPS);
    }

    /**
     * Crea un nuevo contrato.
     *
     * @throws Exception
     */
    public function createContrato(array $data): Contrato
    {
        return DB::transaction(function () use ($data) {
            $contrato = Contrato::create($data);

            if (!$contrato) {
                throw new Exception('No se ha podido crear el contrato.');
            }

            event(new ContratoCreado($contrato));

            return $contrato->load(Contrato::RELATIONSHIPS);
        });
    }

    /**
     * Actualiza un contrato existente.
     *
     * @throws Exception
     */
    public function updateContrato(Contrato $contrato, array $data): Contrato
    {
        return DB::transaction(function () use ($contrato, $data) {
            $originalData = $contrato->getOriginal();
            $updateResult = $contrato->update($data);

            if (!$updateResult) {
                throw new Exception('Error al actualizar el contrato.');
            }

            event(new ContratoActualizado($contrato, $originalData));

            return $contrato->load(Contrato::RELATIONSHIPS);
        });
    }

    /**
     * Elimina un contrato.
     *
     * @throws Exception
     */
    public function deleteContrato(Contrato $contrato): bool
    {
        return DB::transaction(function () use ($contrato) {
            $deleteResult = $contrato->delete();

            if (!$deleteResult) {
                throw new Exception('No se ha podido eliminar el contrato.');
            }

            event(new ContratoEliminado($contrato));

            return true;
        });
    }
}
