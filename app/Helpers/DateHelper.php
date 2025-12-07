<?php

namespace App\Helpers;

use Carbon\Carbon;

/**
 * Clase de utilidades para el manejo de fechas en el sistema
 *
 * Proporciona métodos para estandarizar el formato de fecha usado en la API
 * y en las validaciones del sistema.
 */
class DateHelper
{
    /**
     * Formato ISO 8601 extendido con milisegundos y zona Z.
     * Este es el formato esperado para todas las fechas en la API.
     * Ejemplo: 2025-06-23T10:15:30.123Z
     *
     * @var string
     */
    public const API_DATE_FORMAT = 'Y-m-d\TH:i:s.v\Z';

    /**
     * Convierte una fecha dada al formato estándar de la API.
     *
     * @param Carbon|string|null $date Fecha a convertir
     * @return string Fecha formateada según el estándar de la API
     */
    public static function toApiFormat($date = null): string
    {
        if (is_null($date)) {
            $date = Carbon::now();
        } elseif (!($date instanceof Carbon)) {
            $date = Carbon::parse($date);
        }

        return $date->format(self::API_DATE_FORMAT);
    }

    /**
     * Parsea una fecha en formato API a un objeto Carbon.
     *
     * @param string $dateString Fecha en formato API
     * @return Carbon Objeto Carbon con la fecha parseada
     */
    public static function fromApiFormat(string $dateString): Carbon
    {
        return Carbon::createFromFormat(self::API_DATE_FORMAT, $dateString);
    }

    /**
     * Verifica si una cadena tiene el formato de fecha API válido.
     *
     * @param string $dateString Fecha a validar
     * @return bool true si el formato es válido, false en caso contrario
     */
    public static function isValidApiFormat(string $dateString): bool
    {
        try {
            self::fromApiFormat($dateString);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
