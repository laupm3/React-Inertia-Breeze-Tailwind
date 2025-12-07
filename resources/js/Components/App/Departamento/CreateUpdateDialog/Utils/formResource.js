const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id || null,
        nombre: dataKey.nombre || '',
        manager_id: dataKey.manager?.id || null,
        adjunto_id: dataKey.adjunto?.id || null,
        descripcion: dataKey.descripcion || '',
        parent_department_id: dataKey.parentDepartment?.id || null
    };

    return formData;
}

export default formResource;