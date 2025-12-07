import { Input } from "@/Components/ui/input";
import { CalendarDays, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Calendar } from "@/Components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { Button } from "@/Components/ui/button";

/**
 * Componente para el campo de número de documento con fecha de caducidad
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.documentNumber - Número de documento actual
 * @param {Date|string} props.expirationDate - Fecha de caducidad actual
 * @param {Function} props.onDocumentNumberChange - Callback para cambios en el número de documento
 * @param {Function} props.onExpirationDateChange - Callback para cambios en la fecha de caducidad
 * @param {Function} props.onDocumentNumberBlur - Callback para cuando el campo pierde el foco
 * @param {Object} props.errors - Objeto con errores de validación
 * @param {boolean} props.required - Si el campo es obligatorio
 * @param {boolean} props.showCalendar - Si se debe mostrar el botón de calendario
 * @param {string} props.className - Clases CSS adicionales
 */
export default function DocumentField({
  documentNumber = '',
  expirationDate = null,
  onDocumentNumberChange,
  onExpirationDateChange,
  onDocumentNumberBlur,
  errors = {},
  required = false,
  showCalendar = true,
  className = ''
}) {
  const [localExpirationDate, setLocalExpirationDate] = useState(null);

  // Sincronizar la fecha de caducidad con el prop externo
  useEffect(() => {
    if (expirationDate) {
      const date = expirationDate instanceof Date ? expirationDate : new Date(expirationDate);
      setLocalExpirationDate(date);
    } else {
      setLocalExpirationDate(null);
    }
  }, [expirationDate]);

  const handleExpirationDateChange = (date) => {
    setLocalExpirationDate(date);
    if (onExpirationDateChange) {
      onExpirationDateChange(date);
    }
  };

  // Función para verificar si el documento está caducado
  const isDocumentExpired = () => {
    if (!localExpirationDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    const expirationDate = new Date(localExpirationDate);
    expirationDate.setHours(0, 0, 0, 0);
    return expirationDate < today;
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label del campo */}
      <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
        Número de documento
        {required && <span className="text-custom-orange"> *</span>}
      </span>

      {/* Input principal con icono de calendario */}
      <div className="relative">
        <Input
          placeholder="Añadir número de documento"
          className={`rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi border-none ${showCalendar ? 'pr-32' : 'pr-4'} h-10`}
          value={documentNumber}
          onChange={(e) => onDocumentNumberChange?.(e.target.value)}
          onBlur={onDocumentNumberBlur}
        />
        {/* <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-custom-gray-semiDark dark:text-custom-gray-dark" /> */}
        
        {/* Información de fecha dentro del input */}
        {showCalendar && localExpirationDate && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <span className={`text-xs ${isDocumentExpired() ? 'text-red-500' : 'text-custom-orange'} font-medium`}>
              {localExpirationDate.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              })}
            </span>
            {isDocumentExpired() && (
              <span className="text-red-500 text-xs">⚠️</span>
            )}
          </div>
        )}
        
        {/* Botón del calendario */}
        {showCalendar && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0 h-6 w-6 hover:bg-transparent"
              >
                <CalendarDays className="h-4 w-4 text-custom-gray-semiDark dark:text-custom-gray-dark hover:text-custom-blue dark:hover:text-custom-orange transition-colors" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={localExpirationDate}
                onSelect={handleExpirationDateChange}
                initialFocus
                weekStartsOn={1}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Errores */}
      {errors.nif && (
        <span className="text-xs text-red-500">{errors.nif}</span>
      )}
      {errors.nif_format_validation && (
        <span className="text-xs text-red-500">{errors.nif_format_validation}</span>
      )}
      {showCalendar && errors.caducidad_nif && (
        <span className="text-xs text-red-500">{errors.caducidad_nif}</span>
      )}
    </div>
  );
}
