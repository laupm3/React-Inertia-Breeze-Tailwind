const formResource = (dataKey) => {
    
    if (!dataKey) {
        return {
            id: null,
            photo: null,
            name: '',
            email: '',
            empleado_id: null,
            role_id: null,
            status: 3, // PENDIENTE por defecto
            status_initial_date: null,
            status_final_date: null,
            user_timezone: null,
        };
    }

    // Función helper para convertir fechas de string a Date object
    const parseDate = (dateString) => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date;
        } catch (error) {
            console.error('Error parsing date:', dateString, error);
            return null;
        }
    };

    const formData = {
        id: dataKey.id || null,
        photo: dataKey.profile_photo_url || null,
        name: dataKey.name || '',
        email: dataKey.email || '',
        empleado_id: dataKey.empleado?.id || null,
        role_id: dataKey.role?.id || null,
        status: dataKey.status?.id || 3,
        status_initial_date: parseDate(dataKey.status_initial_date),
        status_final_date: parseDate(dataKey.status_final_date),
        user_timezone: null, // Se establecerá dinámicamente
    };

    return formData;
}

export default formResource;
