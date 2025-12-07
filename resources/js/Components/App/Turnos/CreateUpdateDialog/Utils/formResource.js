const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id || null,
        nombre: dataKey.nombre || '',
        color: dataKey.color || '',
        hora_inicio: dataKey.horaInicio || '',
        hora_fin: dataKey.horaFin || '',
        centro_id: dataKey.centro.id || null,
        descripcion: dataKey.descripcion || '',
        descanso_inicio: dataKey.descansoInicio || '',
        descanso_fin: dataKey.descansoFin || '',
    };

    return formData;
}

export default formResource;