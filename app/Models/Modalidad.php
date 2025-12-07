<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Modalidad extends Model
{
    /** @use HasFactory<\Database\Factories\ModalidadFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description'
    ];

    protected $table = 'modalidades';

    /**
     * Get all of the jornadaTurnos for the Modalidad
     */
    public function jornadaTurnos(): HasMany
    {
        return $this->hasMany(JornadaTurno::class);
    }
}
