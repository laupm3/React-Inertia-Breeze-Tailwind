import { useMemo } from 'react';

/**
 * Hook para obtener datos del onboarding basados en los empleados
 * @param {Array} empleados - Lista de empleados
 * @returns {Object} Datos del onboarding { auth, empleado, departamento, managerInfo }
 */
export const useOnboardingData = (empleados) => {
    return useMemo(() => {
        let auth = {};
        
        // Verificar si estamos en el cliente y tenemos acceso a Inertia
        if (typeof window !== 'undefined' && 
            window.Inertia && 
            window.Inertia.page && 
            window.Inertia.page.props) {
            auth = window.Inertia.page.props.auth || {};
        }
        
        // Buscar empleado actual
        const empleado = empleados?.find(e => e.user?.id === auth.user?.id) || null;
        
        // Obtener departamento (primer departamento del empleado)
        const departamento = empleado?.departamentos?.[0] || null;
        
        // Obtener información del manager
        const managerInfo = departamento?.manager || null;

        return { 
            auth, 
            empleado, 
            departamento, 
            managerInfo 
        };
    }, [empleados]);
};

/**
 * Hook para obtener datos específicos del usuario autenticado
 * @param {Object} onboardingData - Datos del onboarding
 * @returns {Object} Datos del usuario { hasValidUser, hasManager, hasDepartment }
 */
export const useUserContext = (onboardingData) => {
    return useMemo(() => {
        const { auth, empleado, departamento, managerInfo } = onboardingData;
        
        return {
            hasValidUser: Boolean(auth?.user?.id),
            hasManager: Boolean(managerInfo?.nombreCompleto),
            hasDepartment: Boolean(departamento?.nombre),
            hasProfilePhoto: Boolean(managerInfo?.user?.profile_photo_url),
            userRole: empleado?.role || 'employee',
            isNewEmployee: !empleado?.onboarding_completed
        };
    }, [onboardingData]);
};
