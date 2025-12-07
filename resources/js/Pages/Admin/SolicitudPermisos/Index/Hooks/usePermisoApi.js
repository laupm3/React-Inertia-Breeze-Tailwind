import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

/**
 * Hook para manejar las operaciones de API relacionadas con permisos (versión admin)
 */
export function usePermisoApi() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Preparar datos de la petición - MEJORADO
     */
    const prepareRequestData = (formData) => {

        // Validar campos requeridos (incluyendo empleado_id para admin)
        const requiredFields = ['empleado_id', 'permiso_id', 'fecha_inicio', 'fecha_fin', 'motivo'];
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
     * Crear nueva solicitud de permiso (admin)
     */
    const createPermiso = async (formData) => {
        
        const { requestData, headers } = prepareRequestData(formData);
        
        // Usar ruta del admin
        const url = '/api/v1/admin/solicitudes';
        
        return await sendRequest(url, requestData, headers, false);
    };

    /**
     * Actualizar solicitud de permiso existente (admin)
     */
    const updatePermiso = async (formData, permisoId) => {
        
        const { requestData, headers } = prepareRequestData(formData);
        
        // Usar ruta del admin
        const url = `/api/v1/admin/solicitudes/${permisoId}`;
        
        return await sendRequest(url, requestData, headers, true);
    };

    /**
     * Obtener detalles completos de una solicitud (incluyendo archivos)
     */
    const getSolicitudDetails = async (solicitudId) => {
        try {
            const url = `/api/v1/admin/solicitudes/${solicitudId}`;
            const response = await axios.get(url);
            
            
            if (response.data && response.data.solicitud) {
                return response.data.solicitud;
            }
            
            throw new Error('No se pudieron obtener los detalles de la solicitud');
        } catch (error) {
            console.error('Error al obtener detalles de la solicitud:', error);
            const errorMessage = error.response?.data?.message || 'Error al cargar los detalles de la solicitud';
            toast.error(errorMessage);
            throw error;
        }
    };

    /**
     * Manejar envío del formulario (crear o actualizar)
     */
    const handleSubmit = async (formData, isEditing, permisoId, onSuccess = null) => {

        setIsSubmitting(true);
        
        try {
            let response;
            
            if (isEditing && permisoId) {
                response = await updatePermiso(formData, permisoId);
                toast.success('¡Permiso actualizado!', {
                    description: 'Los cambios en la solicitud de permiso han sido guardados correctamente.',
                    duration: 5000
                });
            } else {
                response = await createPermiso(formData);
                toast.success('¡Permiso creado!', {
                    description: 'La nueva solicitud de permiso ha sido creada correctamente.'
                });
            }


            // Llamar callback de éxito si está definido
            if (onSuccess && typeof onSuccess === 'function') {
                try {
                    onSuccess(response);
                } catch (callbackError) {
                    // No lanzar error aquí, ya que la operación fue exitosa
                }
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
                    (isEditing ? 'Error al actualizar el permiso' : 'Error al crear el permiso');
                
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
        handleSubmit,
        getSolicitudDetails
    };
}
