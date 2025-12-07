const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id || null,
        name: dataKey.name || '',
        description: dataKey.description || '',
        esquema: dataKey.esquema.filter(({
            turno_id,
            modalidad_id,
            weekday_number
        }) => turno_id && modalidad_id && (weekday_number != null)),
    };

    return formData;
}

export default formResource;