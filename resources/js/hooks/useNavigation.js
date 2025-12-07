import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Hook simple para obtener navegación de la API
 */
export const useNavigationAPI = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [links, setLinks] = useState([]);

    /**
     * Obtiene los enlaces de navegación desde la API
     */
    const fetchNavigationData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.get('/api/v1/user/navigation');
            
            if (response.data && response.data.links) {
                setLinks(response.data.links);
            } else {
                throw new Error('No se pudieron cargar los datos de navegación');
            }
        } catch (err) {
            console.error('Error al obtener la navegación:', err);
            setError(err.message || 'Error al cargar la navegación');
            
            // Fallback a elementos estáticos
            try {
                const ContentOneItems = (await import('@/Components/Sidebar/elements/ContentOneItems')).default;
                const ContentTwoItems = (await import('@/Components/Sidebar/elements/ContentTwoItems')).default;
                
                // Combinar todos los elementos estáticos como fallback
                const allStaticItems = [
                    ...ContentOneItems,
                    ...ContentTwoItems.map(item => ({ ...item, isAdmin: true }))
                ];
                setLinks(allStaticItems);
            } catch (importErr) {
                console.error('Error al cargar elementos fallback:', importErr);
                setLinks([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNavigationData();
    }, []);

    const refreshNavigation = () => {
        fetchNavigationData();
    };

    return {
        isLoading,
        error,
        links,
        refreshNavigation
    };
};
