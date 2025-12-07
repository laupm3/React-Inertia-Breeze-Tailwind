import { useState, useEffect } from 'react';
import { defaultPermisoValues, permisoFormSchema } from '../Schema/PermisoSchema';
import { formatDate } from '../Utils/dateUtils';

// Constants
const DEFAULT_WORK_HOURS = {
    START: '09:00',
    END: '17:00'
};

const SYSTEM_FULL_DAY_HOURS = {
    START: ['00:00', '02:00'],
    END: ['23:59', '01:59']
};

/**
 * Custom hook for managing permission form state and logic (admin version)
 */
export const usePermisoForm = (permisoToEdit = null, isOpen = false) => {

    // Form state
    const [formData, setFormData] = useState(defaultPermisoValues);
    const [dateRange, setDateRange] = useState(undefined);
    const [selectedPermiso, setSelectedPermiso] = useState(null);
    const [errors, setErrors] = useState({});
    const [savedHours, setSavedHours] = useState({ hora_inicio: '', hora_fin: '' });
    const [isInitializing, setIsInitializing] = useState(false);

    // Computed values
    const isEditing = Boolean(permisoToEdit);
    const maxDurationMs = selectedPermiso?.duracion || null;
    const maxDurationDays = maxDurationMs ? Math.floor(maxDurationMs / (1000 * 60 * 60 * 24)) : null;
    
    // Date range logic
    const isSingleDay = formData.fecha_inicio && formData.fecha_fin && formData.fecha_inicio === formData.fecha_fin;
    const shouldForceFullDay = formData.fecha_inicio && formData.fecha_fin && formData.fecha_inicio !== formData.fecha_fin;
    
    // UI visibility controls
    const canShowCheckbox = isSingleDay && !shouldForceFullDay;
    const canShowTimeFields = canShowCheckbox && !formData.dia_completo;

    /**
     * Extract time data from permission object
     */
    const extractTimeData = (permiso) => {

        let horaInicio = '';
        let horaFin = '';
        let esDiaCompleto = Boolean(permiso.dia_completo);
        
        if (permiso.fecha_inicio) {
            const fechaInicio = new Date(permiso.fecha_inicio);
            horaInicio = fechaInicio.toTimeString().slice(0, 5);
        }
        
        if (permiso.fecha_fin) {
            const fechaFin = new Date(permiso.fecha_fin);
            horaFin = fechaFin.toTimeString().slice(0, 5);
        }
        
        // Detect full day based on system hours
        const esDiaCompletoDetectado = SYSTEM_FULL_DAY_HOURS.START.includes(horaInicio) && 
                                       SYSTEM_FULL_DAY_HOURS.END.includes(horaFin);
        
        if (esDiaCompletoDetectado) {
            esDiaCompleto = true;
        }

        const result = { horaInicio, horaFin, esDiaCompleto };
        
        return result;
    };

    /**
     * Reset form to initial state
     */
    const resetForm = () => {
        setFormData(defaultPermisoValues);
        setDateRange(undefined);
        setSelectedPermiso(null);
        setErrors({});
        setSavedHours({ hora_inicio: '', hora_fin: '' });
        setIsInitializing(false);
    };

    /**
     * Initialize form with edit data
     */
    const initializeFormForEdit = (permiso) => {

        if (!permiso || !permiso.id) {
            console.error('🔍 [usePermisoForm] Invalid permiso data for edit:', permiso);
            return;
        }

        setIsInitializing(true);
        
        const { horaInicio, horaFin, esDiaCompleto } = extractTimeData(permiso);
        
        // Save original hours
        setSavedHours({
            hora_inicio: horaInicio,
            hora_fin: horaFin
        });
        
        // Prepare form data
        const formDataForEdit = {
            empleado_id: permiso.empleado?.id || permiso.empleado_id || null, // Campo específico del admin
            permiso_id: permiso.permiso?.id || null,
            fecha_inicio: permiso.fecha_inicio ? formatDate(new Date(permiso.fecha_inicio)) : '',
            fecha_fin: permiso.fecha_fin ? formatDate(new Date(permiso.fecha_fin)) : '',
            hora_inicio: esDiaCompleto ? '' : horaInicio,
            hora_fin: esDiaCompleto ? '' : horaFin,
            motivo: permiso.motivo || '',
            dia_completo: esDiaCompleto,
            recuperable: Boolean(permiso.recuperable),
            estado_id: permiso.estado_id || defaultPermisoValues.estado_id,
            files: [] 
        };
        setFormData(formDataForEdit);
        
        // Set date range
        if (permiso.fecha_inicio && permiso.fecha_fin) {
            const newDateRange = {
                from: new Date(permiso.fecha_inicio),
                to: new Date(permiso.fecha_fin)
            };
            setDateRange(newDateRange);
        }

        // Set selected permission
        if (permiso.permiso) {
            setSelectedPermiso(permiso.permiso);
        }
        
        // Finish initialization
        setTimeout(() => {
            setIsInitializing(false);
        }, 100);
    };

    /**
     * Handle full day toggle logic
     */
    const handleFullDayToggle = (value) => {

        if (value) {
            // Enable full day: save current hours and clear form
            const currentHours = {
                hora_inicio: formData.hora_inicio || savedHours.hora_inicio,
                hora_fin: formData.hora_fin || savedHours.hora_fin
            };
            setSavedHours(currentHours);
            setFormData(prev => ({ 
                ...prev, 
                dia_completo: true,
                hora_inicio: '',
                hora_fin: ''
            }));
        } else {
            // Disable full day: restore saved hours or defaults
            let horaInicio = savedHours.hora_inicio;
            let horaFin = savedHours.hora_fin;
            
            // Provide defaults if no saved hours or system full-day hours
            if (!horaInicio || SYSTEM_FULL_DAY_HOURS.START.includes(horaInicio)) {
                horaInicio = DEFAULT_WORK_HOURS.START;
            }
            if (!horaFin || SYSTEM_FULL_DAY_HOURS.END.includes(horaFin)) {
                horaFin = DEFAULT_WORK_HOURS.END;
            }
            
            setFormData(prev => ({ 
                ...prev, 
                dia_completo: false,
                hora_inicio: horaInicio,
                hora_fin: horaFin
            }));
            
            setSavedHours({
                hora_inicio: horaInicio,
                hora_fin: horaFin
            });
        }
    };

    /**
     * Handle input field changes
     */
    const handleInputChange = (field, value) => {

        if (field === 'dia_completo') {
            handleFullDayToggle(value);
        } else {
            handleRegularFieldChange(field, value);
        }
        
        // Clear field error if exists
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    /**
     * Handle regular field changes
     */
    const handleRegularFieldChange = (field, value) => {
        if (field === 'files') {
            const filesArray = Array.isArray(value) ? value : (value ? [value] : []);
            setFormData(prev => ({ ...prev, [field]: filesArray }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        
        // Update saved hours for time fields
        if ((field === 'hora_inicio' || field === 'hora_fin') && !formData.dia_completo && !isInitializing) {
            setSavedHours(prev => ({ ...prev, [field]: value }));
        }
    };

    /**
     * Handle permission selection
     */
    const handlePermisoSelect = (permiso) => {
        // Solo proceder si el permiso realmente cambió
        if (selectedPermiso?.id === permiso?.id) {
            return;
        }

        setSelectedPermiso(permiso);
        
        // Reset dependent fields y actualizar permiso_id en una sola operación
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
    };

    /**
     * Handle date range changes
     */
    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange);
    };

    /**
     * Validate form data using schema
     */
    const validateForm = () => {
        const validationResult = permisoFormSchema.safeParse(formData);
        
        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            const errorMap = {};
            
            Object.entries(fieldErrors).forEach(([field, messages]) => {
                errorMap[field] = messages[0];
            });
            
            setErrors(errorMap);
            return null;
        }

        setErrors({});
        return validationResult.data;
    };

    // Effects
    useEffect(() => {
        if (!isInitializing && dateRange?.from && dateRange?.to) {
            const newFechaInicio = formatDate(dateRange.from);
            const newFechaFin = formatDate(dateRange.to);
            
            // Solo actualizar si realmente cambió
            if (formData.fecha_inicio !== newFechaInicio || formData.fecha_fin !== newFechaFin) {
                setFormData(prev => ({
                    ...prev,
                    fecha_inicio: newFechaInicio,
                    fecha_fin: newFechaFin
                }));
            }
        }
    }, [dateRange?.from, dateRange?.to, isInitializing]); // Solo las fechas específicas

    useEffect(() => {
        if (isInitializing) return;
        
        if (shouldForceFullDay) {
            if (!formData.dia_completo || formData.hora_inicio || formData.hora_fin) {
                setFormData(prev => ({
                    ...prev,
                    dia_completo: true,
                    hora_inicio: '',
                    hora_fin: ''
                }));
            }
        }
    }, [shouldForceFullDay, formData.dia_completo, formData.hora_inicio, formData.hora_fin, isInitializing]);

    return {
        // State
        formData,
        dateRange,
        selectedPermiso,
        errors,
        isInitializing,
        
        // Computed
        isEditing,
        maxDurationMs,
        maxDurationDays,
        isSingleDay,
        shouldForceFullDay,
        canShowCheckbox,
        canShowTimeFields,
        
        // Actions
        resetForm,
        initializeFormForEdit,
        handleInputChange,
        handlePermisoSelect,
        handleDateRangeChange,
        validateForm,
        setErrors,
        setFormData
    };
};
