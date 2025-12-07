<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brevo_history extends Model
{
    protected $fillable = [
        'destinatario',
        'remitente',
        'template_id',
        'fecha',
        'hora',
    ];
}
