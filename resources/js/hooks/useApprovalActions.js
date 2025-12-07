import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

export const useApprovalActions = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState(null);

    const getApprovalStatus = useCallback(async (solicitudId) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/admin/permisos/${solicitudId}/approval-status`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setApprovalStatus(data);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching approval status:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const processApproval = useCallback(async (solicitudId, approvalData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/admin/permisos/${solicitudId}/process-approval`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: JSON.stringify(approvalData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Refresh the page to show updated data
            router.reload({ only: ['permisos'] });
            
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error processing approval:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const approveRequest = useCallback(async (solicitudId, tipoAprobacion, observacion = null) => {
        return processApproval(solicitudId, {
            tipo_aprobacion: tipoAprobacion,
            aprobado: true,
            observacion,
        });
    }, [processApproval]);

    const rejectRequest = useCallback(async (solicitudId, tipoAprobacion, observacion) => {
        return processApproval(solicitudId, {
            tipo_aprobacion: tipoAprobacion,
            aprobado: false,
            observacion,
        });
    }, [processApproval]);

    return {
        isLoading,
        error,
        approvalStatus,
        getApprovalStatus,
        processApproval,
        approveRequest,
        rejectRequest,
    };
};
