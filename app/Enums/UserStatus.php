<?php

namespace App\Enums;

enum UserStatus: int
{
    case INACTIVE = 0;
    case ACTIVE = 1;
    case SUSPENDED = 2;
    case PENDING = 3;
    case BANNED = 4;

    public function label(): string
    {
        return match($this) {
            self::INACTIVE => 'Inactivo',
            self::ACTIVE => 'Activo',
            self::SUSPENDED => 'Suspendido',
            self::PENDING => 'Pendiente',
            self::BANNED => 'Bloqueado',
        };
    }
}
