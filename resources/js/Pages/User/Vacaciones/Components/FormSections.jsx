import { usePage } from '@inertiajs/react';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import Icon from "@/imports/LucideIcon";
import PermisoAdvanceDropdown from "@/Pages/User/Vacaciones/Components/PermisoAdvanceDropdown";
import PermisoStatsInline from "@/Pages/User/Vacaciones/Components/PermisoStatsInline";
import { CustomDatePickerWithRange } from "@/Pages/User/Vacaciones/Components/CustomDatePickerWithRange";

/**
 * Componente para la sección de selección de permiso
 */
export function PermisoSelectionSection({
    selectedPermiso,
    onPermisoSelect,
    maxDurationDays,
    formData,
    validationErrors = [],
    markFieldAsTouched = () => {},
    dateRange = null, // Para las estadísticas
    empleadoId = null // Para admin: ID del empleado seleccionado
}) {
    const { auth } = usePage().props;
    
    // Determinar el empleado: prop (admin) o usuario actual (usuario)
    const targetEmpleadoId = empleadoId || auth?.user?.empleado?.id;
    
    // Calcular fechas para estadísticas (año actual completo si no hay rango)
    const currentYear = new Date().getFullYear();
    const statsDateRange = dateRange && dateRange.from && dateRange.to ? dateRange : {
        from: new Date(currentYear, 0, 1), // 1 enero
        to: new Date(currentYear, 11, 31)  // 31 diciembre
    };
    
    const fechaInicio = statsDateRange.from ? 
        statsDateRange.from.toISOString().split('T')[0] : 
        `${currentYear}-01-01`;
    const fechaFin = statsDateRange.to ? 
        statsDateRange.to.toISOString().split('T')[0] : 
        `${currentYear}-12-31`;

    return (
        <div className="flex flex-col gap-1">
            <Label className="text-sm font-bold text-custom-blue dark:text-custom-white">
                Permiso Solicitado <span className='text-custom-orange'>*</span>
            </Label>
            <PermisoAdvanceDropdown
                value={selectedPermiso || (formData?.permiso_id ? { id: formData.permiso_id } : null)}
                onChange={(permiso) => {
                    onPermisoSelect(permiso);
                    markFieldAsTouched('permiso_id');
                }}
                className="w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                // Props para estadísticas - las estadísticas aparecen en la sección de fechas
                empleadoId={targetEmpleadoId}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
                showStats={false} // Ocultar estadísticas aquí, aparecen en DateTimeSection
            />
            
            {/* Fallback para mostrar duración máxima si no hay permiso seleccionado pero sí maxDurationDays */}
            {!selectedPermiso && maxDurationDays && (
                <p className="text-xs text-custom-gray-dark dark:text-custom-gray-light mt-1">
                    Duración máxima: {maxDurationDays} día(s)
                </p>
            )}
        </div>
    );
}

/**
 * Componente para la sección de fechas y horarios
 */
export function DateTimeSection({
    dateRange,
    onDateRangeChange,
    formData,
    onInputChange,
    canShowCheckbox,
    canShowTimeFields,
    shouldForceFullDay,
    maxDurationMs,
    selectedPermiso,
    validationErrors,
    markFieldAsTouched = () => {},
    empleadoId = null // Para estadísticas
}) {
    const { auth } = usePage().props;
    
    // Determinar el empleado para estadísticas
    const targetEmpleadoId = empleadoId || auth?.user?.empleado?.id;
    return (
        <div className="space-y-3">
            {/* Date Range Selection */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-bold text-custom-blue dark:text-custom-white">
                    Fecha del Permiso
                </Label>
                <CustomDatePickerWithRange
                    selectedRange={dateRange}
                    onRangeChange={(range) => {
                        onDateRangeChange(range);
                        // Solo marcar como tocado si es una selección real del usuario (no undefined/null)
                        if (range && (range.from || range.to)) {
                            markFieldAsTouched('fecha');
                        }
                    }}
                    maxDurationMilliseconds={maxDurationMs}
                    disablePastDates={true}
                    permisoNombre={selectedPermiso?.nombre}
                    permisoDuracionDias={Math.floor((maxDurationMs || 0) / (1000 * 60 * 60 * 24))}
                />
                
                {/* Estadísticas de uso del permiso - debajo de las instrucciones */}
                <PermisoStatsInline
                    selectedPermiso={selectedPermiso}
                    empleadoId={targetEmpleadoId}
                    fechaInicio={dateRange?.from?.toISOString()?.split('T')[0]}
                    fechaFin={dateRange?.to?.toISOString()?.split('T')[0]}
                />
            </div>

            {/* Time Fields - Only for single day, non-full day */}
            {canShowTimeFields && (
                <div className="flex flex-col gap-1">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Time */}
                        <div className="flex flex-col gap-1">
                            <Label className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                Hora de inicio
                            </Label>
                            <div className="flex items-center relative rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi">
                                <Icon name="Clock" className="absolute left-3 text-custom-orange" size={16} />
                                <Input
                                    type="time"
                                    className="pl-10 rounded-full border-0 dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                    value={formData.hora_inicio || ''}
                                    onChange={(e) => onInputChange('hora_inicio', e.target.value)}
                                    onFocus={() => markFieldAsTouched('hora_inicio')}
                                />
                            </div>
                        </div>

                        {/* End Time */}
                        <div className="flex flex-col gap-1">
                            <Label className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                Hora de fin
                            </Label>
                            <div className="flex items-center relative rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi">
                                <Icon name="Clock" className="absolute left-3 text-custom-orange" size={16} />
                                <Input
                                    type="time"
                                    className="pl-10 rounded-full border-0 dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                    value={formData.hora_fin || ''}
                                    onChange={(e) => onInputChange('hora_fin', e.target.value)}
                                    onFocus={() => markFieldAsTouched('hora_fin')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Day Checkbox - Only for single day */}
            {canShowCheckbox && (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            className="border-custom-gray-semiLight dark:border-custom-white"
                            id="dia_completo"
                            checked={formData.dia_completo || false}
                            onCheckedChange={(checked) => onInputChange('dia_completo', checked)}
                        />
                        <Label htmlFor="dia_completo" className="text-sm font-medium text-custom-blackSemi dark:text-custom-white">
                            Día completo
                        </Label>
                    </div>
                </div>
            )}

            {/* Multi-day Information Message */}
            {shouldForceFullDay && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Icon name="Info" className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={16} />
                    <span className="text-sm text-blue-800 dark:text-blue-300">
                        Los permisos de múltiples días son automáticamente de días completos.
                    </span>
                </div>
            )}
        </div>
    );
}

/**
 * Componente para la sección de detalles adicionales
 */
export function AdditionalDetailsSection({
    formData,
    onInputChange,
    validationErrors = [],
    markFieldAsTouched = () => {}
}) {
    return (
        <div className="flex flex-col gap-1">
            <Label className="text-sm font-bold text-custom-blackLight dark:text-custom-white">
                Motivo <span className='text-custom-orange'>*</span>
            </Label>
            <Textarea
                placeholder="Escribe aquí el motivo por el que solicita el permiso..."
                className="rounded-xl h-20 max-h-20 resize-none dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi active:border-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-3 overflow-y-auto"
                value={formData.motivo || ''}
                onChange={(e) => onInputChange('motivo', e.target.value)}
                onFocus={() => markFieldAsTouched('motivo')}
            />
        </div>
    );
}
