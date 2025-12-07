import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

/**
 * Hook para manejar aprobaciones de solicitudes de vacaciones
 */
export function useApproval() {
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Procesar aprobación o rechazo de una solicitud
     * @param {number|string} solicitudId - ID de la solicitud
     * @param {string} tipo - Tipo de aprobación (manager, hr, direction)
     * @param {string} accion - Acción a realizar (aprobar, denegar)
     * @param {string|null} observacion - Observación opcional
     * @param {Function|null} onSuccess - Callback de éxito
     * @returns {Promise<boolean>} - True si fue exitoso
     */
    const processApproval = async (solicitudId, tipo, accion, observacion = null, onSuccess = null) => {
        try {
            setIsProcessing(true);

            // Validar que el tipo de aprobación sea válido
            const validTypes = ['manager', 'hr', 'direction'];
            if (!validTypes.includes(tipo)) {
                throw new Error(`Tipo de aprobación no válido: ${tipo}`);
            }

            const endpoint = `/api/v1/admin/solicitudes/${solicitudId}/process-approval`;
            
            const response = await axios.post(endpoint, {
                tipo_aprobacion: tipo, // Usar directamente el tipo sin mapear
                aprobado: accion === 'aprobar',
                observacion: observacion
            });

            if (response.status === 200) {
                const mensaje = `Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} como ${tipo}`;
                toast.success(mensaje);
                
                if (onSuccess) {
                    onSuccess(response.data);
                }
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error(`Error al ${accion} solicitud:`, error);
            
            let errorMessage = `Error al ${accion} la solicitud`;
            
            if (error.response?.status === 403) {
                errorMessage = 'No tienes permisos para realizar esta acción';
            } else if (error.response?.status === 422) {
                // Errores de validación
                const errors = error.response.data.errors || {};
                const firstError = Object.values(errors)[0];
                errorMessage = Array.isArray(firstError) ? firstError[0] : (firstError || errorMessage);
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            toast.error(errorMessage);
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Obtener estado de aprobación de una solicitud
     * @param {number|string} solicitudId - ID de la solicitud
     * @returns {Promise<Object|null>} - Estado de aprobación o null si hay error
     */
    const getApprovalStatus = async (solicitudId) => {
        try {
            const endpoint = `/api/v1/admin/solicitudes/${solicitudId}/approval-status`;
            const response = await axios.get(endpoint);
            
            if (response.status === 200) {
                return response.data;
            }
            
            return null;
        } catch (error) {
            console.error('Error al obtener estado de aprobación:', error);
            return null;
        }
    };

    return {
        isProcessing,
        processApproval,
        getApprovalStatus
    };
}
