<?php

namespace App\Enums;

use App\Models\User;
use App\Services\IncidentPermissionService;

/**
 * Enum IncidentStatus
 *
 * Define los estados posibles de una incidencia en el sistema.
 * Cada estado representa una fase específica en el ciclo de vida de la incidencia,
 * permitiendo un seguimiento claro y la aplicación de lógica de negocio asociada.
 *
 * @method string label() Retorna una etiqueta legible para el estado, útil para la interfaz de usuario.
 * @method bool isFinal() Determina si el estado es considerado final (ej. resuelto, cancelado).
 * @method bool isActive() Determina si la incidencia en este estado aún requiere acción.
 * @method bool isResolved() Determina si la incidencia está específicamente en estado resuelto.
 * @method ?self getNextState() Sugiere el siguiente estado lógico en un flujo de trabajo típico.
 * @method static array<string, string> options() Retorna un array de opciones para selects de formulario.
 * @method string color() Retorna un color asociado al estado para la UI.
 * @method bool canAdvance() Determina si hay un siguiente estado lógico definido.
 */
enum IncidentStatus: string
{
/** @var string La incidencia ha sido registrada y está pendiente de revisión inicial. */
    case PENDING_REVIEW = 'pending_review';

/** @var string La incidencia está siendo investigada o se están tomando acciones para resolverla. */
    case IN_PROGRESS = 'in_progress';

/** @var string La incidencia ha sido resuelta satisfactoriamente. */
    case RESOLVED = 'resolved';

/** @var string La incidencia ha sido cancelada y no se tomarán más acciones. */
    case CANCELLED = 'cancelled';

    /**
     * Obtiene la etiqueta legible para el estado.
     *
     * @return string Etiqueta legible para humanos.
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING_REVIEW => 'En Revisión',
            self::IN_PROGRESS => 'En Progreso',
            self::RESOLVED => 'Resuelto',
            self::CANCELLED => 'Cancelado',
        };
    }

    /**
     * Determina si es un estado final.
     * Los estados finales son aquellos que concluyen el ciclo de vida de la incidencia.
     *
     * @return bool `true` si es un estado final, `false` en caso contrario.
     */
    public function isFinal(): bool
    {
        return in_array($this, [
            self::RESOLVED,
            self::CANCELLED
        ]);
    }

    /**
     * Obtiene todos los estados como un array para selects.
     * Útil para generar opciones en formularios de la interfaz de usuario.
     *
     * @return array<string, string> Array asociativo ['value' => 'Label'].
     */
    public static function options(): array
    {
        return collect(self::cases())->mapWithKeys(fn($case) => [
            $case->value => $case->label()
        ])->all();
    }

    /**
     * Determina si la incidencia en este estado se considera activa (es decir, requiere atención o puede progresar).
     * Una incidencia está activa si no está en un estado final.
     *
     * @return bool `true` si la incidencia está activa, `false` en caso contrario.
     */
    /* public function isActive(): bool
    {
        return !$this->isFinal();
    } */

    /**
     * Determina si la incidencia en este estado aún requiere acción.
     */
    public function isActive(): bool
    {
        return in_array($this, [self::PENDING_REVIEW, self::IN_PROGRESS]);
    }

    /**
     * Permite cambiar el estado de una incidencia según el rol del usuario.
     *
     * @param string $action Acción que se desea realizar (resolve, cancel, assign).
     * @param User $user Usuario que realiza la acción.
     * @param IncidentPermissionService $permissionService Servicio de permisos.
     * @return IncidentStatus|null Nuevo estado o null si la acción no es válida.
     */
    public function handleAction(string $action, User $user, IncidentPermissionService $permissionService): ?self
    {
        return match ($action) {
            'resolve' => $this->canResolve($user, $permissionService) ? self::RESOLVED : null,
            'cancel' => $this->canCancel($user, $permissionService) ? self::CANCELLED : null,
            'assign' => $this->canAssign($user, $permissionService) ? self::IN_PROGRESS : null,
            default => null,
        };
    }

    /**
     * Determina si la incidencia está específicamente en estado resuelto.
     *
     * @return bool `true` si la incidencia está resuelta, `false` en caso contrario.
     */
    public function isResolved(): bool
    {
        return $this === self::RESOLVED;
    }

    /**
     * Obtiene el siguiente estado recomendado en un flujo de trabajo típico.
     * Esto puede guiar la lógica de negocio o las acciones disponibles en la UI.
     *
     * @return self|null El siguiente estado recomendado o `null` si no hay un siguiente estado definido (ej. estados finales).
     */
    public function getNextState(): ?self
    {
        return match ($this) {
            self::PENDING_REVIEW => self::IN_PROGRESS,
            self::IN_PROGRESS => self::RESOLVED,
            self::RESOLVED, self::CANCELLED => null, // No hay siguiente estado desde un estado final
        };
    }

    /**
     * Determina si se puede avanzar al siguiente estado lógico.
     *
     * @return bool `true` si hay un siguiente estado definido, `false` en caso contrario.
     */
    public function canAdvance(): bool
    {
        return $this->getNextState() !== null;
    }

    /**
     * Verifica si el usuario puede resolver la incidencia.
     *
     * @param User $user Usuario que realiza la acción.
     * @param PermissionService $permissionService Servicio de permisos.
     * @return bool `true` si el usuario tiene permiso, `false` en caso contrario.
     */
    public function canResolve(User $user, IncidentPermissionService $permissionService): bool
    {
        return $permissionService->hasPermission($user, 'resolve_incident') && $this === self::IN_PROGRESS;
    }

    /**
     * Verifica si el usuario puede cancelar la incidencia.
     *
     * @param User $user Usuario que realiza la acción.
     * @param PermissionService $permissionService Servicio de permisos.
     * @return bool `true` si el usuario tiene permiso, `false` en caso contrario.
     */
    public function canCancel(User $user, IncidentPermissionService $permissionService): bool
    {
        return $permissionService->hasPermission($user, 'cancel_incident') && !$this->isFinal();
    }

    /**
     * Verifica si el usuario puede asignar la incidencia.
     *
     * @param User $user Usuario que realiza la acción.
     * @param IncidentPermissionService $permissionService Servicio de permisos.
     * @return bool `true` si el usuario tiene permiso, `false` en caso contrario.
     */
    public function canAssign(User $user, IncidentPermissionService $permissionService): bool
    {
        // Asegúrate de pasar el tercer argumento requerido por hasPermission (ajusta el valor según tu lógica)
        return $permissionService->hasPermission($user, 'assign_incident', $this) && $this === self::PENDING_REVIEW;
    }

    /**
     * Obtiene el color asociado al estado para la interfaz de usuario.
     * Ayuda a diferenciar visualmente los estados en listas o badges.
     *
     * @return string Código de color (ej. hexadecimal).
     */
    public function color(): string
    {
        // Los colores son representativos, ajústalos a tu paleta de diseño
        return match ($this) {
            self::PENDING_REVIEW => '#FFB74D', // Naranja claro (Bootstrap warning)
            self::IN_PROGRESS => '#64B5F6',    // Azul claro (Bootstrap info)
            self::RESOLVED => '#81C784',       // Verde claro (Bootstrap success)
            self::CANCELLED => '#E57373',      // Rojo claro (Bootstrap danger)
        };
    }
}
