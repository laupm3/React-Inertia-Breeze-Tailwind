<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BrevoTemplate extends Model
{
    protected $fillable = [
        'template_id',
        'name',
    ];
/* 
    public function getTemplateIdAttribute($value)
    {
        return $value;
    } */
    
}
