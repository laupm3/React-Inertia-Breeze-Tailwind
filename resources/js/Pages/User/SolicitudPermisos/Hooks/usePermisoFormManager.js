import { useState, useEffect, useCallback } from 'react';
import { defaultPermisoValues } from '@/Pages/User/SolicitudPermisos/Schema/PermisoSchema';
import { formatDate } from '@/Pages/User/SolicitudPermisos/Utils/dateUtils';

// Constantes
const DEFAULT_WORK_HOURS = {
    START: '09:00',
    END: '17:00'
};

const SYSTEM_FULL_DAY_HOURS = {
    START: ['00:00', '02:00'],
    END: ['23:59', '01:59']
};

/**
 * Hook personalizado para manejar toda la lógica del formulario de permisos
 */
export function usePermisoFormManager(permisoToEdit = null) {
    // Estados del formulario
    const [formData, setFormData] = useState(defaultPermisoValues);
    const [dateRange, setDateRange] = useState(undefined);
    const [selectedPermiso, setSelectedPermiso] = useState(null);
    const [savedHours, setSavedHours] = useState({ hora_inicio: '', hora_fin: '' });
    const [isInitializing, setIsInitializing] = useState(false);

    // Computed values
    const isEditing = Boolean(permisoToEdit);
    const maxDurationMs = selectedPermiso?.duracion || null;
    const maxDurationDays = maxDurationMs ? Math.floor(maxDurationMs / (1000 * 60 * 60 * 24)) : null;
    
    const isSingleDay = formData.fecha_inicio && formData.fecha_fin && 
                       formData.fecha_inicio === formData.fecha_fin;
    const shouldForceFullDay = formData.fecha_inicio && formData.fecha_fin && 
                              formData.fecha_inicio !== formData.fecha_fin;
    
    const canShowCheckbox = isSingleDay && !shouldForceFullDay;
    const canShowTimeFields = canShowCheckbox && !formData.dia_completo;

    /**
     * Resetear formulario
     */
    const resetForm = useCallback(() => {
        setFormData(defaultPermisoValues);
        setDateRange(undefined);
        setSelectedPermiso(null);
        setSavedHours({ hora_inicio: '', hora_fin: '' });
        setIsInitializing(false);
    }, []);

    /**
     * Extraer datos de tiempo de un permiso - MEJORADO
     */
    const extractTimeData = (permiso) => {
        let horaInicio = '';
        let horaFin = '';
        let esDiaCompleto = Boolean(permiso.dia_completo);
        
        // Extraer fechas sin problemas de zona horaria
        const fechaInicioStr = permiso.fecha_inicio ? permiso.fecha_inicio.split('T')[0] : '';
        const fechaFinStr = permiso.fecha_fin ? permiso.fecha_fin.split('T')[0] : '';
        
        // Si las fechas son diferentes, automáticamente es día completo
        if (fechaInicioStr && fechaFinStr && fechaInicioStr !== fechaFinStr) {
            esDiaCompleto = true;
        }
        
        if (permiso.fecha_inicio) {
            const fechaInicio = new Date(permiso.fecha_inicio);
            horaInicio = fechaInicio.toTimeString().slice(0, 5);
        }
        
        if (permiso.fecha_fin) {
            const fechaFin = new Date(permiso.fecha_fin);
            horaFin = fechaFin.toTimeString().slice(0, 5);
        }
        
        // Detectar día completo por las horas del sistema
        const esDiaCompletoDetectado = SYSTEM_FULL_DAY_HOURS.START.includes(horaInicio) && 
                                       SYSTEM_FULL_DAY_HOURS.END.includes(horaFin);
        
        if (esDiaCompletoDetectado) {
            esDiaCompleto = true;
        }
        
        // Si es día completo, limpiar las horas para mostrar campos vacíos
        if (esDiaCompleto) {
            horaInicio = '';
            horaFin = '';
        }
        
        return { horaInicio, horaFin, esDiaCompleto };
    };

    /**
     * Inicializar formulario para edición
     */
    const initializeFormForEdit = useCallback((permiso) => {
        setIsInitializing(true);
        
        const { horaInicio, horaFin, esDiaCompleto } = extractTimeData(permiso);
        
        setSavedHours({
            hora_inicio: esDiaCompleto ? '' : horaInicio,
            hora_fin: esDiaCompleto ? '' : horaFin
        });
        
        const formDataForEdit = {
            // Intentar obtener permiso_id de diferentes estructuras posibles
            permiso_id: permiso.permiso?.id || permiso.permiso_id || permiso.tipo_permiso?.id || permiso.tipo_permiso_id || null,
            fecha_inicio: permiso.fecha_inicio ? permiso.fecha_inicio.split('T')[0] : '',
            fecha_fin: permiso.fecha_fin ? permiso.fecha_fin.split('T')[0] : '',
            hora_inicio: esDiaCompleto ? '' : horaInicio,
            hora_fin: esDiaCompleto ? '' : horaFin,
            motivo: permiso.motivo || '',
            dia_completo: esDiaCompleto,
            recuperable: Boolean(permiso.recuperable),
            estado_id: permiso.estado_id || defaultPermisoValues.estado_id,
            files: []
        };

        setFormData(formDataForEdit);
        
        if (permiso.fecha_inicio && permiso.fecha_fin) {
            // Extraer solo la fecha sin problemas de zona horaria
            const fechaInicio = permiso.fecha_inicio.split('T')[0];
            const fechaFin = permiso.fecha_fin.split('T')[0];
            
            setDateRange({
                from: new Date(fechaInicio + 'T12:00:00'), // Usar mediodía para evitar problemas de zona horaria
                to: new Date(fechaFin + 'T12:00:00')
            });
        }

        if (permiso.permiso) {
            setSelectedPermiso(permiso.permiso);
        } else if (permiso.tipo_permiso) {
            setSelectedPermiso(permiso.tipo_permiso);
        } else {
            console.warn('DEBUG - No se pudo encontrar información del tipo de permiso');
        }
        
        // Corrección diferida: Si no se pudo obtener el permiso_id, actualizarlo después de setear el selectedPermiso
        setTimeout(() => {
            if (formDataForEdit.permiso_id === null) {
                const selectedPermisoObject = permiso.permiso || permiso.tipo_permiso;
                if (selectedPermisoObject?.id) {
                    setFormData(prev => ({
                        ...prev,
                        permiso_id: selectedPermisoObject.id
                    }));
                }
            }
            setIsInitializing(false);
        }, 150); // Aumentado a 150ms para dar más tiempo
    }, []);

    /**
     * Manejar toggle de día completo
     */
    const handleFullDayToggle = useCallback((value) => {
        setFormData(prev => {
            if (value) {
                // Guardar horas actuales antes de limpiarlas
                const currentHours = {
                    hora_inicio: prev.hora_inicio || savedHours.hora_inicio,
                    hora_fin: prev.hora_fin || savedHours.hora_fin
                };
                setSavedHours(currentHours);
                
                return { 
                    ...prev, 
                    dia_completo: true,
                    hora_inicio: '',
                    hora_fin: ''
                };
            } else {
                // Restaurar horas guardadas o usar valores por defecto
                let horaInicio = savedHours.hora_inicio;
                let horaFin = savedHours.hora_fin;
                
                if (!horaInicio || SYSTEM_FULL_DAY_HOURS.START.includes(horaInicio)) {
                    horaInicio = DEFAULT_WORK_HOURS.START;
                }
                if (!horaFin || SYSTEM_FULL_DAY_HOURS.END.includes(horaFin)) {
                    horaFin = DEFAULT_WORK_HOURS.END;
                }
                
                setSavedHours({
                    hora_inicio: horaInicio,
                    hora_fin: horaFin
                });
                
                return { 
                    ...prev, 
                    dia_completo: false,
                    hora_inicio: horaInicio,
                    hora_fin: horaFin
                };
            }
        });
    }, [savedHours.hora_inicio, savedHours.hora_fin]);

    /**
     * Manejar cambios en campos regulares
     */
    const handleRegularFieldChange = useCallback((field, value) => {
        if (field === 'files') {
            const filesArray = Array.isArray(value) ? value : (value ? [value] : []);
            setFormData(prev => {
                return { ...prev, [field]: filesArray };
            });
        } else {
            setFormData(prev => {
                return { ...prev, [field]: value };
            });
        }
    }, []);

    /**
     * Manejar cambios en campos del formulario
     */
    const handleInputChange = useCallback((field, value) => {
        if (field === 'dia_completo') {
            handleFullDayToggle(value);
        } else {
            handleRegularFieldChange(field, value);
        }
    }, [handleFullDayToggle, handleRegularFieldChange]);

    /**
     * Manejar selección de permiso
     */
    const handlePermisoSelect = useCallback((permiso) => {
        setSelectedPermiso(permiso);
        
        setDateRange(undefined);
        setSavedHours({ hora_inicio: '', hora_fin: '' });
        
        setFormData(prev => ({
            ...prev,
            permiso_id: permiso?.id || null,
            fecha_inicio: '',
            fecha_fin: '',
            dia_completo: false,
            hora_inicio: '',
            hora_fin: ''
        }));
    }, []);

    /**
     * Manejar cambios en rango de fechas
     */
    const handleDateRangeChange = useCallback((newRange) => {
        setDateRange(newRange);
    }, []);

    // Efecto para sincronizar rango de fechas con formData
    useEffect(() => {
        if (!isInitializing && dateRange?.from && dateRange?.to) {
            const newFechaInicio = formatDate(dateRange.from);
            const newFechaFin = formatDate(dateRange.to);
            
            setFormData(prev => {
                // Solo actualizar si realmente hay cambios
                if (prev.fecha_inicio !== newFechaInicio || prev.fecha_fin !== newFechaFin) {
                    const isMultipleDays = newFechaInicio !== newFechaFin;
                    
                    return {
                        ...prev,
                        fecha_inicio: newFechaInicio,
                        fecha_fin: newFechaFin,
                        // Forzar día completo para múltiples días
                        ...(isMultipleDays && {
                            dia_completo: true,
                            hora_inicio: '',
                            hora_fin: ''
                        })
                    };
                }
                return prev;
            });
        }
    }, [dateRange, isInitializing]);

    // Remover el useEffect que causaba conflictos
    // useEffect(() => {
    //     if (!isInitializing && shouldForceFullDay && !formData.dia_completo) {
    //         setFormData(prev => ({
    //             ...prev,
    //             dia_completo: true,
    //             hora_inicio: '',
    //             hora_fin: ''
    //         }));
    //     }
    // }, [formData.fecha_inicio, formData.fecha_fin, shouldForceFullDay, isInitializing]);

    return {
        // Estados
        formData,
        dateRange,
        selectedPermiso,
        isInitializing,
        
        // Computed values
        isEditing,
        maxDurationMs,
        maxDurationDays,
        isSingleDay,
        shouldForceFullDay,
        canShowCheckbox,
        canShowTimeFields,
        
        // Funciones
        resetForm,
        initializeFormForEdit,
        handleInputChange,
        handlePermisoSelect,
        handleDateRangeChange,
        
        // Setters (por si se necesitan desde fuera)
        setFormData,
        setDateRange,
        setSelectedPermiso
    };
}
