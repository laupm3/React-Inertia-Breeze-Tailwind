<?php

namespace App\Enums;

/**
 * Enum representing the types of approval for work permit requests
 * 
 * This enum defines the different types of approval that can be applied to work permit requests.
 * 
 * Each type corresponds to a specific role in the approval process:
 * - MANAGER: Approval by a manager
 * - HR: Approval by the Human Resources department
 * - DIRECTION: Approval by the direction or management team
 */
enum TipoAprobacion: string
{
    case MANAGER = 'manager';
    case HR = 'hr';
    case DIRECTION = 'direction';

    /**
     * Get the permission name associated with the approval type
     * @return string|null
     */
    public function getPermissionName(): string|null
    {
        return match ($this) {
            self::MANAGER => 'canManageManagerWorkPermitRequests',
            self::HR => 'canManageHrWorkPermitRequests',
            self::DIRECTION => 'canManageDirectionWorkPermitRequests',
            default => null,
        };
    }

    /**
     * Get the display name for the approval type
     * @return string|null
     */
    public function getDisplayName(): string
    {
        return match ($this) {
            self::MANAGER => 'Manager de departamento',
            self::HR => 'Recursos Humanos',
            self::DIRECTION => 'Dirección',
            default => null,
        };
    }

    /**
     * Get the list of all approval types
     * @return array<TipoAprobacion>
     */
    public static function getAllValues(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get the names of all approval types
     * @return array<string>
     */
    public static function getPermissionNames(): array
    {
        return array_map(fn($type) => $type->name, self::getAllValues());
    }

    /**
     * Get the order of the approval type
     */
    public function getOrder(): int
    {
        return match ($this) {
            self::MANAGER => 1,
            self::HR => 2,
            self::DIRECTION => 3,
        };
    }

    /**
     * Get the ordered list of approval cases
     * 
     * This method returns the cases of the TipoAprobacion enum sorted by their order.
     * 
     * @return array<TipoAprobacion>
     */
    public static function getOrderedCases(): array
    {
        $cases = self::cases();
        usort($cases, fn($a, $b) => $a->getOrder() <=> $b->getOrder());
        return $cases;
    }

    /**
     * Get the list of required approvals
     * 
     * This method returns all the cases of the TipoAprobacion enum,
     * which represent the required approvals for work permit requests. 
     * 
     * @return array<TipoAprobacion>
     */
    public static function getApprovals(): array
    {
        return self::cases();
    }

    /**
     * Verifica si este tipo puede aprobar automáticamente otros tipos
     * 
     * @param TipoAprobacion $other Tipo de aprobación a comparar
     * @return bool
     */
    public function canAutoApprove(TipoAprobacion $other): bool
    {
        return $this->getOrder() > $other->getOrder();
    }

    /**
     * Obtiene los tipos que este nivel puede aprobar automáticamente
     * 
     * @return array<TipoAprobacion>
     */
    public function getAutoApprovableTypes(): array
    {
        return array_filter(
            array: self::cases(),
            callback: fn($type) => $this->canAutoApprove($type)
        );
    }

    /**
     * Obtiene los niveles inferiores en la jerarquía
     * 
     * This method returns all approval types that are lower in the hierarchy than the current type.
     * 
     * @return array<TipoAprobacion>
     */
    public function getLowerHierarchyLevels(): array
    {
        $allLevels = self::getOrderedCases();
        $currentOrder = $this->getOrder();

        return array_filter($allLevels, function ($level) use ($currentOrder) {
            return $level->getOrder() < $currentOrder;
        });
    }
}
