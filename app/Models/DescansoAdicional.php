<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DescansoAdicional extends Model
{
    /** @use HasFactory<\Database\Factories\DescansoAdicionalFactory> */
    use HasFactory;

    protected $table = 'descansos_adicionales';

    // Constantes para tipos de descanso
    const TIPO_OBLIGATORIO = 'obligatorio';
    const TIPO_ADICIONAL = 'adicional';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'horario_id',
        'tipo_descanso',
        'descanso_inicio',
        'descanso_fin',
        'latitud_inicio',
        'longitud_inicio',
        'latitud_fin',
        'longitud_fin',
        'ip_address_inicio',
        'ip_address_fin',
        'user_agent_inicio',
        'user_agent_fin'
    ];

    protected $casts = [
        'descanso_inicio' => 'datetime',
        'descanso_fin' => 'datetime'
    ];

    /**
     * Get the horario that owns the DescansoAdicional
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function horario(): BelongsTo
    {
        return $this->belongsTo(Horario::class);
    }

    /**
     * Verifica si existe un descanso obligatorio activo para el horario
     */
    public static function tieneDescansoObligatorioActivo(Horario $horario): bool
    {
        return static::where('horario_id', $horario->id)
            ->where('tipo_descanso', self::TIPO_OBLIGATORIO)
            ->whereNull('descanso_fin')
            ->exists();
    }

    /**
     * Verifica si ya se tomó el descanso obligatorio en el día
     */
    public static function descansoObligatorioTomadoHoy(Horario $horario): bool
    {
        return static::where('horario_id', $horario->id)
            ->where('tipo_descanso', self::TIPO_OBLIGATORIO)
            ->whereDate('descanso_inicio', now()->toDateString())
            ->exists();
    }

    /**
     * Obtiene el descanso activo actual (si existe)
     */
    public static function obtenerDescansoActivo(Horario $horario)
    {
        return static::where('horario_id', $horario->id)
            ->whereNull('descanso_fin')
            ->first();
    }

    /**
     * Calcula la duración del descanso en minutos
     */
    public function getDuracionEnMinutos(): int
    {
        if (!$this->descanso_fin) {
            return 0;
        }

        return $this->descanso_inicio->diffInMinutes($this->descanso_fin);
    }
}
