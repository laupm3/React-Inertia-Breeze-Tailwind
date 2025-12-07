<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoEmpleado extends Model
{
    /** @use HasFactory<\Database\Factories\TipoEmpleadoFactory> */
    use HasFactory;

    /**
     * Get all employees for the type of employee.
     */
    public function empleados()
    {
        return $this->hasMany(Empleado::class);
    }
}
