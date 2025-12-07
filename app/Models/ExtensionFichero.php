<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExtensionFichero extends Model
{
    protected $table = 'extension_ficheros';

    protected $fillable = [
        'extension',
        'nombre',
        'descripcion',
    ];
}
