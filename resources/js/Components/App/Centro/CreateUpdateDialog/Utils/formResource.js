const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id,
        nombre: dataKey.nombre,
        email: dataKey.email,
        telefono: dataKey.telefono,
        responsable_id: dataKey.responsable?.id,
        coordinador_id: dataKey.coordinador?.id,
        empresa_id: dataKey.empresa?.id,
        estado_id: dataKey.estado?.id,
        departamento_ids: dataKey.departamentos.map(departamento => departamento.id),
        direccion: dataKey.direccion,
    };

    return formData;
}

export default formResource;