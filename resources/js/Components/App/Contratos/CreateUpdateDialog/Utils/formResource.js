const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id || null,
        n_expediente: dataKey.n_expediente || '',
        tipo_contrato_id: dataKey.tipoContrato.id || null,
        asignacion_id: dataKey.asignacion.id || null,
        fecha_inicio: dataKey.fechaInicio || '',
        fecha_fin: dataKey.fechaFin || null,
        empresa_id: dataKey.empresa.id || null,
        centro_id: dataKey.centro.id || null,
        departamento_id: dataKey.departamento.id || null,
        empleado_id: dataKey.empleado.id || null,
        jornada_id: dataKey.jornada.id || null
    };

    return formData;
}

export default formResource;