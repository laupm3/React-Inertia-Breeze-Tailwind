<?php

namespace App\Enums;

enum ProjectType: string
{
    case RRHH = 'rrhh';
    case INVENTORY = 'inventory';

    public function label(): string
    {
        return match ($this) {
            self::RRHH => 'Recursos Humanos',
            self::INVENTORY => 'Inventario',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::RRHH => 'Sistema de gestión de recursos humanos',
            self::INVENTORY => 'Sistema de gestión de inventario',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::RRHH => '#3B82F6',      // Azul
            self::INVENTORY => '#10B981', // Verde
        };
    }

    public static function options(): array
    {
        return collect(self::cases())->mapWithKeys(fn($case) => [
            $case->value => $case->label()
        ])->all();
    }
} 