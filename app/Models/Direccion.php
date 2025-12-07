<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Direccion extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'direcciones';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'full_address',
        'latitud',
        'longitud',
        'codigo_postal',
        'nombre_via',
        'numero',
        'piso',
        'puerta',
        'bloque',
        'escalera',
    ];
}
