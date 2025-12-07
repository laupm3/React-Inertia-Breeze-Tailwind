const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id,
        empleado_id: dataKey.empleado?.id || dataKey.empleado_id || null,
        permiso_id: dataKey.permiso?.id || dataKey.permiso_id || null,
        fecha_inicio: dataKey.fecha_inicio || '',
        fecha_fin: dataKey.fecha_fin || '',
        hora_inicio: dataKey.hora_inicio || '',
        hora_fin: dataKey.hora_fin || '',
        motivo: dataKey.motivo || '',
        dia_completo: dataKey.dia_completo || false,
        recuperable: dataKey.recuperable || false,
        estado_id: dataKey.estado?.id || dataKey.estado_id || 1,
        files: dataKey.files || []
    };

    return formData;
}

export default formResource;
