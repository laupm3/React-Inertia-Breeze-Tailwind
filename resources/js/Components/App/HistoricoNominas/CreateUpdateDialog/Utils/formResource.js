const formResource = (dataKey) => {
    // Si no hay dataKey (modo creación), devuelve un objeto con la estructura vacía.
    if (!dataKey) {
        return {
            id: null,
            nombre: '',
            user: null,
            created_at: '',
            created_by: null,
            updated_by: null,
            archivo: null,
        };
    }

    const formData = {
        id: dataKey.id || null,
        nombre: dataKey.nombre || '',
        user: dataKey.user || null,
        created_at: dataKey.created_at || '',
        created_by: dataKey.created_by || null,
        updated_by: dataKey.updated_by || null,
        archivo: null,
    };

    return formData;
};

export default formResource;