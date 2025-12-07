import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

/**
 * Hook para manejar las operaciones de API relacionadas con vacaciones (versión admin)
 */
export function usePermisoApi() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Preparar datos de la petición - SIMPLIFICADO (igual que user hook)
     */
    const prepareRequestData = (formData) => {
        console.log('🔍 [Admin] Frontend - Datos originales del formulario:', formData);
        
        // Validar campos requeridos (incluyendo empleado_id para admin)
        const requiredFields = ['empleado_id', 'permiso_id', 'fecha_inicio', 'fecha_fin', 'motivo'];
        const missingFields = requiredFields.filter(field => {
            const value = formData[field];
            return !value || (typeof value === 'string' && value.trim() === '');
        });
        
        if (missingFields.length > 0) {
            throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
        }
        
        // Verificar que dia_completo sea un valor booleano válido
        if (formData.dia_completo === undefined || formData.dia_completo === null) {
            throw new Error('El campo dia_completo es requerido');
        }
        
        // Verificar si hay archivos
        const hasFiles = formData.files && Array.isArray(formData.files) && formData.files.length > 0;
        
        if (hasFiles) {
            // Con archivos: usar FormData pero asegurar tipos correctos donde sea posible
            const requestData = new FormData();
            const headers = {};

            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'files') {
                    value.forEach(file => requestData.append('files[]', file));
                } else if (key === 'permiso_id' || key === 'empleado_id') {
                    // Asegurar que permiso_id y empleado_id sean string de entero válido
                    const intValue = parseInt(value, 10);
                    requestData.append(key, intValue.toString());
                } else if (typeof value === 'boolean') {
                    requestData.append(key, value ? '1' : '0');
                } else if (value !== null && value !== undefined) {
                    requestData.append(key, value || '');
                }
            });
            
            return { requestData, headers };
        } else {
            // Sin archivos: usar JSON para mantener tipos de datos correctos
            const requestData = {};
            const headers = {
                'Content-Type': 'application/json'
            };

            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'files') {
                    // Ignorar archivos vacíos
                    return;
                } else if (key === 'permiso_id' || key === 'empleado_id') {
                    // Asegurar que permiso_id y empleado_id sean enteros
                    requestData[key] = parseInt(value, 10);
                } else if (key === 'dia_completo' || key === 'recuperable') {
                    // Mantener booleanos como booleanos
                    requestData[key] = Boolean(value);
                } else if (value !== null && value !== undefined) {
                    requestData[key] = value;
                }
            });
            
            return { requestData, headers };
        }
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
     * Crear nueva solicitud de vacaciones (admin)
     */
    const createPermiso = async (formData) => {
        
        // DEBUG: Imprimir los datos originales del formulario
        console.log('🔍 [Admin] Datos originales del formulario:', formData);
        
        const { requestData, headers } = prepareRequestData(formData);
        
        // DEBUG: Imprimir los datos preparados para envío
        if (requestData instanceof FormData) {
            console.log('🔍 [Admin] Enviando como FormData:');
            for (let [key, value] of requestData.entries()) {
                console.log(`  ${key}: ${value} (tipo: ${typeof value})`);
            }
        } else {
            console.log('🔍 [Admin] Enviando como JSON:', requestData);
        }
        console.log('🔍 [Admin] Headers:', headers);
        
        // Usar ruta del admin de vacaciones
        const url = '/api/v1/admin/vacaciones';
        
        return await sendRequest(url, requestData, headers, false);
    };

    /**
     * Actualizar solicitud de vacaciones existente (admin)
     */
    const updatePermiso = async (formData, permisoId) => {
        
        const { requestData, headers } = prepareRequestData(formData);
        
        // Usar ruta del admin de vacaciones
        const url = `/api/v1/admin/vacaciones/${permisoId}`;
        
        return await sendRequest(url, requestData, headers, true);
    };

    /**
     * Obtener detalles completos de una solicitud de vacaciones (incluyendo archivos)
     */
    const getSolicitudDetails = async (solicitudId) => {
        try {
            const url = `/api/v1/admin/vacaciones/${solicitudId}`;
            const response = await axios.get(url);
            
            
            if (response.data && response.data.solicitud) {
                return response.data.solicitud;
            }
            
            throw new Error('No se pudieron obtener los detalles de la solicitud de vacaciones');
        } catch (error) {
            console.error('Error al obtener detalles de la solicitud de vacaciones:', error);
            const errorMessage = error.response?.data?.message || 'Error al cargar los detalles de la solicitud de vacaciones';
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
                toast.success('¡Vacaciones actualizadas!', {
                    description: 'Los cambios en la solicitud de vacaciones han sido guardados correctamente.',
                    duration: 5000
                });
            } else {
                response = await createPermiso(formData);
                toast.success('¡Vacaciones creadas!', {
                    description: 'La nueva solicitud de vacaciones ha sido creada correctamente.'
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
                    (isEditing ? 'Error al actualizar las vacaciones' : 'Error al crear las vacaciones');
                
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
