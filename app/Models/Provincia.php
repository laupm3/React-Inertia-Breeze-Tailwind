<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Provincia extends Model
{
    /** @use HasFactory<\Database\Factories\ProvinciaFactory> */
    use HasFactory;

    /**
     * The community to which the province belongs.
     */
    public function comunidad()
    {
        return $this->belongsTo(Comunidad::class);
    }

    /**
     * The municipalities that belong to the province.
     */
    public function municipios()
    {
        return $this->hasMany(Municipio::class);
    }

    /**
     * The addresses that belong to the province.
     */
    public function direcciones()
    {
        return $this->hasManyThrough(Direccion::class, Municipio::class);
    }
}
