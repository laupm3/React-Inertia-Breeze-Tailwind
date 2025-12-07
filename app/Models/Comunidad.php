<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comunidad extends Model
{
    /** @use HasFactory<\Database\Factories\ComunidadFactory> */
    use HasFactory;

    protected $table = 'comunidades';

    /**
     * The country to which the community belongs.
     */
    public function pais()
    {
        return $this->belongsTo(Pais::class);
    }

    /**
     * The provinces that belong to the community.
     */
    public function provincias()
    {
        return $this->hasMany(Provincia::class);
    }
}
