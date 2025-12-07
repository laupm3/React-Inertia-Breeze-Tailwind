<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EventoUser extends Pivot
{
    /** @use HasFactory<\Database\Factories\EventoUserFactory> */
    use HasFactory;

    protected $table = 'evento_user';

    protected $fillable = [
        'evento_id',
        'user_id'
    ];

    public function evento()
    {
        return $this->belongsTo(Evento::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
