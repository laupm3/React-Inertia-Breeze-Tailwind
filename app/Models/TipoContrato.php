<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoContrato extends Model
{
    /** @use HasFactory<\Database\Factories\TipoContratoFactory> */
    use HasFactory;

    /**
     * Get the contracts for the contract type.
     */
    public function contratos()
    {
        return $this->hasMany(Contrato::class);
    }
}
