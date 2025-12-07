const formResource = (dataKey) => {
    if (!dataKey) return {};

    // Helper para asegurar que las fechas estén en formato string ISO válido
    const formatDateString = (dateValue) => {
        if (!dateValue) return null;
        
        try {
            // Si ya es un string válido, devolverlo tal como está
            if (typeof dateValue === 'string') {
                // Verificar que es una fecha válida
                const date = new Date(dateValue);
                return isNaN(date.getTime()) ? null : dateValue;
            }
            
            // Si es un objeto Date, convertir a ISO string
            if (dateValue instanceof Date) {
                return isNaN(dateValue.getTime()) ? null : dateValue.toISOString();
            }
            
            return null;
        } catch (error) {
            return null;
        }
    };

    const formData = {
        id: dataKey.id || null,
        n_expediente: dataKey.n_expediente,
        tipo_contrato_id: dataKey.tipoContrato?.id || dataKey.tipo_contrato_id,
        asignacion_id: dataKey.asignacion?.id || dataKey.asignacion_id,
        fecha_inicio: formatDateString(dataKey.fechaInicio || dataKey.fecha_inicio),
        fecha_fin: formatDateString(dataKey.fechaFin || dataKey.fecha_fin),
        empresa_id: dataKey.empresa?.id || dataKey.empresa_id || dataKey.empresaId || '',
        centro_id: dataKey.centro?.id || dataKey.centro_id || dataKey.centroId || '',
        departamento_id: dataKey.departamento?.id || dataKey.departamento_id || dataKey.departamentoId || '',
        empleado_id: dataKey.empleado?.id || dataKey.empleado_id || dataKey.empleadoId || '',
        jornada_id: dataKey.jornada?.id || dataKey.jornada_id || dataKey.jornadaId || ''
    };

    return formData;
}

export default formResource;