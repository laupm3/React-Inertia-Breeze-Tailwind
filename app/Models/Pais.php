<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pais extends Model
{
    use HasFactory;

    protected $table = 'paises';

    protected $fillable = ['nombre', 'iso'];

    /**
     * The communities that belong to the country.
     */
    public function comunidades()
    {
        return $this->hasMany(Comunidad::class);
    }
}
