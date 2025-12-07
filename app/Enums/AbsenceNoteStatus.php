<?php

namespace App\Enums;

enum AbsenceNoteStatus: string
{
    case PENDING = 'pendiente';
    case APPROVED = 'aprobado';
    case REJECTED = 'rechazado';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pendiente',
            self::APPROVED => 'Aprobado',
            self::REJECTED => 'Rechazado',
        };
    }
}
