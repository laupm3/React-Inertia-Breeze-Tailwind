const formatToDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);

    const pad = (num) => String(num).padStart(2, '0');

    const yyyy = date.getUTCFullYear();
    const mm = pad(date.getUTCMonth() + 1);
    const dd = pad(date.getUTCDate());
    const hh = pad(date.getUTCHours());
    const min = pad(date.getUTCMinutes());
    const ss = pad(date.getUTCSeconds());

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

const formResource = (dataKey) => {
    if (!dataKey) return;

    return dataKey.map((data) => ({
        id: data.id || null,
        turno_id: data.turno?.id || null,
        modalidad_id: data.modalidad?.id || null,
        estado_horario_id: data.estadoHorario?.id || null,
        horario_inicio: formatToDateTime(data.horario_inicio),
        horario_fin: formatToDateTime(data.horario_fin),
        descanso_inicio: formatToDateTime(data.descanso_inicio),
        descanso_fin: formatToDateTime(data.descanso_fin),
        observaciones: data.observaciones || '',
    }));
};


export default formResource;
