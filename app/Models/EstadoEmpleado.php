<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoEmpleado extends Model
{
    /** @use HasFactory<\Database\Factories\EstadoEmpleadoFactory> */
    use HasFactory;

    /**
     * Get the employees for the status.
     */
    public function empleados()
    {
        return $this->hasMany(Empleado::class);
    }
}
