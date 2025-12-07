<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoFichero extends Model
{
    /** @use HasFactory<\Database\Factories\TipoFicheroFactory> */
    use HasFactory;

    protected $table = 'tipo_ficheros';

    protected $fillable = ['nombre', 'descripcion'];

    /**
     * Get all of the ficheros for the TipoFichero
     */
    public function ficheros()
    {
        return $this->hasMany(File::class);
    }
}
