import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

/**
 * Hook para manejar las operaciones de API relacionadas con permisos
 */
export function usePermisoApi() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Preparar datos de la petición - MEJORADO
     */
    const prepareRequestData = (formData) => {
        // Validar campos requeridos
        const requiredFields = ['permiso_id', 'fecha_inicio', 'fecha_fin', 'motivo'];
        const missingFields = requiredFields.filter(field => {
            const value = formData[field];
            return !value || (typeof value === 'string' && value.trim() === '');
        });
        
        if (missingFields.length > 0) {
            throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
        }
        
        // Siempre usar FormData para mantener consistencia con el backend
        const requestData = new FormData();
        const headers = {};

        // Procesar cada campo del formulario
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'files') {
                // Solo agregar archivos si existen
                if (Array.isArray(value) && value.length > 0) {
                    value.forEach(file => requestData.append('files[]', file));
                }
                // Si no hay archivos, no agregamos nada al FormData
            } else if (typeof value === 'boolean') {
                const boolValue = value ? '1' : '0';
                requestData.append(key, boolValue);
            } else if (value !== null && value !== undefined) {
                const finalValue = value || '';
                requestData.append(key, finalValue);
            }
        });
        
        return { requestData, headers };
    };

    /**
     * Enviar petición HTTP
     */
    const sendRequest = async (url, requestData, headers, isEditing) => {
        if (isEditing) {
            if (requestData instanceof FormData) {
                requestData.append('_method', 'PUT');
                return await axios.post(url, requestData, { headers });
            } else {
                return await axios.put(url, requestData, { headers });
            }
        } else {
            return await axios.post(url, requestData, { headers });
        }
    };

    /**
     * Crear nueva solicitud de permiso
     */
    const createPermiso = async (formData) => {
        const { requestData, headers } = prepareRequestData(formData);
        const url = '/api/v1/user/solicitudes';
        
        return await sendRequest(url, requestData, headers, false);
    };

    /**
     * Actualizar solicitud de permiso existente
     */
    const updatePermiso = async (formData, permisoId) => {
        const { requestData, headers } = prepareRequestData(formData);
        const url = `/api/v1/user/solicitudes/${permisoId}`;
        
        return await sendRequest(url, requestData, headers, true);
    };

    /**
     * Manejar envío del formulario (crear o actualizar)
     */
    const handleSubmit = async (formData, isEditing, permisoId) => {
        setIsSubmitting(true);
        
        try {
            let response;
            
            if (isEditing && permisoId) {
                response = await updatePermiso(formData, permisoId);
                toast.success('¡Permiso actualizado!', {
                    description: 'Los cambios en tu solicitud de permiso han sido guardados correctamente.',
                    duration: 5000
                });
            } else {
                response = await createPermiso(formData);
                toast.success('¡Permiso solicitado!', {
                    description: 'Tu solicitud de permiso ha sido enviada correctamente y está pendiente de aprobación.',
                    duration: 5000
                });
            }
            
            return response;
        } catch (error) {
            // Mostrar errores de validación específicos si están disponibles
            if (error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors).flat();
                toast.error('Errores de validación', {
                    description: validationErrors.join(', '),
                    duration: 8000
                });
            } else {
                const errorMessage = error.response?.data?.message || 
                    (isEditing ? 'Error al actualizar el permiso' : 'Error al solicitar el permiso');
                
                toast.error('Error', {
                    description: errorMessage,
                    duration: 5000
                });
            }
            
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        createPermiso,
        updatePermiso,
        handleSubmit
    };
}
