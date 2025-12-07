<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoDocumento extends Model
{
    /** @use HasFactory<\Database\Factories\TipoDocumentoFactory> */
    use HasFactory;

    /**
     * Get the employees for the document type.
     */
    public function empleados()
    {
        return $this->hasMany(Empleado::class);
    }
}
