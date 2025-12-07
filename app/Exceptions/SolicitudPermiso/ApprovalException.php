<?php

namespace App\Exceptions\SolicitudPermiso;

use Exception;

/**
 * Excepción personalizada para errores de aprobación de solicitudes de permiso
 */
class ApprovalException extends Exception
{
    public static function insufficientPermissions(): self
    {
        return new self('El usuario no tiene permisos para este tipo de aprobación.');
    }

    public static function duplicateApproval(): self
    {
        return new self('Ya existe una aprobación de este tipo para esta solicitud.');
    }

    public static function invalidApprovalType(): self
    {
        return new self('Tipo de aprobación no válido.');
    }

    public static function selfApprovalNotAllowed(): self
    {
        return new self('No puede aprobar su propia solicitud de permiso.');
    }

    public static function approvalNotFound(): self
    {
        return new self('Aprobación no encontrada.');
    }
}
