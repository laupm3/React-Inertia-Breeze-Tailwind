import { useMemo, useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para validaciones del formulario (versión admin)
 */
export function useFormValidation(formData, selectedPermiso) {

    // Estado para rastrear interacciones específicas del usuario
    const [touchedFields, setTouchedFields] = useState(new Set());
    const [hasUserInitiatedAction, setHasUserInitiatedAction] = useState(false);
    const initialFormRef = useRef(null);

    // Capturar el estado inicial del formulario una sola vez
    useEffect(() => {
        if (!initialFormRef.current) {
            initialFormRef.current = {
                permiso_id: formData.permiso_id,
                fecha_inicio: formData.fecha_inicio,
                fecha_fin: formData.fecha_fin,
                hora_inicio: formData.hora_inicio,
                hora_fin: formData.hora_fin,
                motivo: formData.motivo,
                dia_completo: formData.dia_completo
            };
        }
    }, []); // Solo una vez al montar

    // Detectar cambios reales del usuario (no los valores iniciales)
    useEffect(() => {
        if (!initialFormRef.current) return;

        const initial = initialFormRef.current;
        const hasRealChanges = 
            formData.permiso_id !== initial.permiso_id ||
            formData.fecha_inicio !== initial.fecha_inicio ||
            formData.fecha_fin !== initial.fecha_fin ||
            formData.hora_inicio !== initial.hora_inicio ||
            formData.hora_fin !== initial.hora_fin ||
            formData.motivo !== initial.motivo ||
            formData.dia_completo !== initial.dia_completo;

        if (hasRealChanges) {
            setHasUserInitiatedAction(true);
        }
    }, [formData]);

    // Función para marcar campos como "tocados" manualmente
    const markFieldAsTouched = useCallback((fieldName) => {
        setTouchedFields(prev => new Set([...prev, fieldName]));
        setHasUserInitiatedAction(true);
    }, []);

    // Función para marcar todos los campos como tocados (útil cuando se intenta enviar)
    const markAllFieldsAsTouched = () => {
        setTouchedFields(new Set([
            'empleado_id', 'permiso_id', 'fecha', 'motivo', 
            'hora_inicio', 'hora_fin'
        ]));
        setHasUserInitiatedAction(true);
    };

    // Función para limpiar campos tocados específicos (útil para operaciones de archivos)
    const clearTouchedFields = (fieldNames = []) => {
        setTouchedFields(prev => {
            const newSet = new Set(prev);
            fieldNames.forEach(field => newSet.delete(field));
            return newSet;
        });
    };

    // Función para resetear completamente la interacción del usuario
    const resetUserInteraction = () => {
        setTouchedFields(new Set());
        setHasUserInitiatedAction(false);
    };

    // Resetear estado cuando el formulario se reinicia completamente
    useEffect(() => {
        const isFormReset = !formData.permiso_id && 
                          !formData.motivo && 
                          !formData.hora_inicio && 
                          !formData.hora_fin &&
                          formData.fecha_inicio === initialFormRef.current?.fecha_inicio &&
                          formData.fecha_fin === initialFormRef.current?.fecha_fin;
        
        if (isFormReset) {
            setTouchedFields(new Set());
            setHasUserInitiatedAction(false);
            initialFormRef.current = null; // Reset para nueva inicialización
        }
    }, [formData]);
    
    /**
     * Validar si todos los campos requeridos están completos
     */
    const isFormValid = useMemo(() => {
        const requiredFields = [
            'permiso_id',
            'fecha_inicio', 
            'fecha_fin',
            'motivo'
        ];

        // Verificar campos requeridos básicos
        const hasAllRequiredFields = requiredFields.every(field => {
            const value = formData[field];
            if (field === 'permiso_id') {
                return value !== null && value !== undefined && value !== '' && value > 0;
            }
            return value !== null && value !== undefined && value !== '';
        });

        if (!hasAllRequiredFields) return false;

        // Si no es día completo, verificar horarios
        if (!formData.dia_completo) {
            if (!formData.hora_inicio || !formData.hora_fin) {
                return false;
            }

            // Validar que hora_fin sea posterior a hora_inicio
            if (formData.hora_inicio >= formData.hora_fin) {
                return false;
            }
        }

        return true;
    }, [formData]);

    /**
     * Validar duración del permiso
     */
    const durationValidation = useMemo(() => {
        if (!formData.fecha_inicio || !formData.fecha_fin || !selectedPermiso?.duracion) {
            return { isValid: true, message: '' };
        }

        const startDate = new Date(formData.fecha_inicio);
        const endDate = new Date(formData.fecha_fin);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 porque incluye ambos días
        
        const maxDurationMs = selectedPermiso.duracion;
        const maxDurationDays = Math.floor(maxDurationMs / (1000 * 60 * 60 * 24));

        if (diffDays > maxDurationDays) {
            return {
                isValid: false,
                message: `La duración máxima permitida es de ${maxDurationDays} día(s)`
            };
        }

        return { isValid: true, message: '' };
    }, [formData.fecha_inicio, formData.fecha_fin, selectedPermiso]);

    /**
     * Validar fechas
     */
    const dateValidation = useMemo(() => {
        if (!formData.fecha_inicio || !formData.fecha_fin) {
            return { isValid: true, message: '' };
        }

        const startDate = new Date(formData.fecha_inicio);
        const endDate = new Date(formData.fecha_fin);
        const today = new Date();
        
        // Limpiar tiempo para comparación de solo fechas
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (startDate > endDate) {
            return {
                isValid: false,
                message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
            };
        }

        // En admin, permitir fechas pasadas para editar solicitudes históricas
        // if (endDate < today) {
        //     return {
        //         isValid: false,
        //         message: 'La fecha de fin no puede ser anterior a hoy'
        //     };
        // }

        return { isValid: true, message: '' };
    }, [formData.fecha_inicio, formData.fecha_fin]);

    /**
     * Validar horarios cuando no es día completo
     */
    const timeValidation = useMemo(() => {
        if (formData.dia_completo) {
            return { isValid: true, message: '' };
        }

        if (!formData.hora_inicio || !formData.hora_fin) {
            return {
                isValid: false,
                message: 'Las horas de inicio y fin son requeridas'
            };
        }

        if (formData.hora_inicio >= formData.hora_fin) {
            return {
                isValid: false,
                message: 'La hora de inicio debe ser anterior a la hora de fin'
            };
        }

        return { isValid: true, message: '' };
    }, [formData.dia_completo, formData.hora_inicio, formData.hora_fin]);

    /**
     * Compilar errores de validación visual - Solo mostrar cuando es apropiado
     */
    const validationErrors = useMemo(() => {
        // No mostrar errores hasta que el usuario haya iniciado acciones
        if (!hasUserInitiatedAction) {
            return [];
        }

        const errors = [];

        // Validar empleado_id requerido
        if (!formData.empleado_id || formData.empleado_id <= 0) {
            errors.push('Debe seleccionar un empleado');
        }

        // Validar permiso_id requerido
        if (!formData.permiso_id || formData.permiso_id <= 0) {
            errors.push('Debe seleccionar un tipo de permiso');
        }

        // Validar motivo requerido
        if (!formData.motivo || formData.motivo.trim() === '') {
            errors.push('El motivo es requerido');
        }

        // Solo mostrar error de fecha si el campo de fecha ha sido tocado o hay cambios reales
        if (!dateValidation.isValid && (touchedFields.has('fecha') || hasUserInitiatedAction)) {
            errors.push(dateValidation.message);
        }

        // Solo mostrar error de tiempo si los campos de tiempo han sido tocados específicamente
        // o si se ha desmarcado "día completo" (lo que expone los campos de tiempo)
        if (!timeValidation.isValid && 
            (touchedFields.has('hora_inicio') || 
             touchedFields.has('hora_fin') || 
             (hasUserInitiatedAction && !formData.dia_completo))) {
            errors.push(timeValidation.message);
        }

        // Validación de duración ELIMINADA - No tiene sentido que aparezca en el admin
        // Los administradores pueden crear permisos con cualquier duración según sea necesario

        return errors;
    }, [
        dateValidation, 
        timeValidation, 
        durationValidation, 
        hasUserInitiatedAction, 
        touchedFields, 
        formData.dia_completo,
        formData.fecha_inicio,
        formData.fecha_fin,
        formData.empleado_id,
        formData.permiso_id,
        formData.motivo
    ]);

    const hasValidationErrors = validationErrors.length > 0;

    return {
        isFormValid,
        hasValidationErrors,
        validationErrors,
        dateValidation,
        timeValidation,
        durationValidation,
        hasUserInitiatedAction,
        touchedFields,
        markFieldAsTouched,
        markAllFieldsAsTouched,
        clearTouchedFields,
        resetUserInteraction
    };
}
