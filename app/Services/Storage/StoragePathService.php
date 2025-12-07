<?php

namespace App\Services\Storage;

use App\Models\SolicitudPermiso;

/**
 * Servicio para generar rutas de almacenamiento de archivos
 * 
 * Este servicio centraliza la lógica de generación de rutas para diferentes
 * tipos de documentos y entidades del sistema.
 */
class StoragePathService
{
    private const BASE_HR_PATH = 'hr/Empleados';
    private const VACACIONES_PATH = 'Trabajo/Vacaciones';
    private const PERMISOS_PATH = 'Trabajo/Permisos';
    private const MAX_FOLDER_NAME_LENGTH = 20;

    /**
     * Genera la ruta de almacenamiento para una solicitud de permiso
     * 
     * IMPORTANTE: Este método requiere que las relaciones 'empleado' y 'permiso' 
     * estén precargadas en el modelo para evitar consultas N+1.
     * 
     * @param SolicitudPermiso $solicitudPermiso Modelo con relaciones 'empleado' y 'permiso' cargadas
     * @return string Ruta relativa para almacenar archivos de la solicitud
     * @throws \InvalidArgumentException Si las relaciones requeridas no están cargadas
     */
    public function getSolicitudPermisoStoragePath(SolicitudPermiso $solicitudPermiso): string
    {
        // Validar que las relaciones necesarias estén cargadas
        $this->ensureRequiredRelationsLoaded($solicitudPermiso, ['empleado', 'permiso']);

        $empleado = $solicitudPermiso->empleado;
        $permiso = $solicitudPermiso->permiso;

        // Sanitizar nombres para evitar problemas en el sistema de archivos
        $permisoNombre = $this->sanitizeForPath($permiso->nombre);
        $empleadoNif = $this->sanitizeForPath($empleado->nif);

        // Generar nombre descriptivo de carpeta
        $carpetaNombre = $this->generateSolicitudFolderName($solicitudPermiso);

        return match ($permisoNombre) {
            'Vacaciones' => self::BASE_HR_PATH . "/{$empleadoNif}/" . self::VACACIONES_PATH . "/{$carpetaNombre}",
            default => self::BASE_HR_PATH . "/{$empleadoNif}/" . self::PERMISOS_PATH . "/{$permisoNombre}/{$carpetaNombre}"
        };
    }

    /**
     * Valida que las relaciones requeridas estén cargadas
     * 
     * @param SolicitudPermiso $solicitudPermiso
     * @param array $requiredRelations
     * @throws \InvalidArgumentException
     */
    private function ensureRequiredRelationsLoaded(SolicitudPermiso $solicitudPermiso, array $requiredRelations): void
    {
        foreach ($requiredRelations as $relation) {
            if (!$solicitudPermiso->relationLoaded($relation)) {
                throw new \InvalidArgumentException(
                    "La relación '{$relation}' debe estar precargada en SolicitudPermiso para generar la ruta de almacenamiento. " .
                        "Use SolicitudPermiso::with(['" . implode("', '", $requiredRelations) . "']) o cargue las relaciones antes de llamar este método."
                );
            }
        }
    }

    /**
     * Genera un nombre descriptivo para la carpeta de una solicitud
     * 
     * @param SolicitudPermiso $solicitudPermiso
     * @return string Nombre descriptivo sanitizado
     */
    private function generateSolicitudFolderName(SolicitudPermiso $solicitudPermiso): string
    {
        // Ya validamos que 'permiso' está cargado en el método padre

        // Obtener fecha de creación en formato legible
        $fecha = $solicitudPermiso->created_at->format('Y-m-d');

        // Obtener nombre del permiso (versión corta si es muy largo)
        $permisoNombre = $this->truncateForFilename($solicitudPermiso->permiso->nombre, self::MAX_FOLDER_NAME_LENGTH);
        $permisoNombre = $this->sanitizeForPath($permisoNombre);

        // Construir nombre: fecha_tipo_id
        $folderName = "{$fecha}_{$permisoNombre}_{$solicitudPermiso->id}";

        return $folderName;
    }

    /**
     * Trunca un texto para uso en nombres de archivo manteniendo legibilidad
     * 
     * @param string $text Texto a truncar
     * @param int $maxLength Longitud máxima
     * @return string Texto truncado
     */
    private function truncateForFilename(string $text, int $maxLength = 25): string
    {
        if (strlen($text) <= $maxLength) {
            return $text;
        }

        // Truncar en espacio más cercano para mantener palabras completas
        $truncated = substr($text, 0, $maxLength);
        $lastSpace = strrpos($truncated, ' ');

        if ($lastSpace !== false && $lastSpace > $maxLength * 0.7) {
            $truncated = substr($truncated, 0, $lastSpace);
        }

        return $truncated;
    }

    /**
     * Sanitiza cadenas para uso en rutas de archivos
     * 
     * Remueve o reemplaza caracteres que pueden causar problemas
     * en diferentes sistemas de archivos.
     * 
     * @param string $input Cadena a sanitizar
     * @return string Cadena sanitizada
     */
    private function sanitizeForPath(string $input): string
    {
        // Reemplazar espacios por guiones bajos
        $sanitized = str_replace(' ', '_', $input);

        // Remover caracteres problemáticos para sistemas de archivos
        $sanitized = preg_replace('/[^\w\-_\.]/', '_', $sanitized);

        // Remover múltiples guiones bajos consecutivos
        $sanitized = preg_replace('/_+/', '_', $sanitized);

        // Remover guiones bajos al inicio y final
        return trim($sanitized, '_');
    }
}
