<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Language extends Model
{
    use HasFactory;
    use SoftDeletes;

    // Con fillable, especificamos los campos que pueden ser asignados masivamente.
    protected $fillable = [
        'name',
        'locale',
        'region',
        'cultural_configuration',
        'is_default',
        'is_active',
    ];
}
