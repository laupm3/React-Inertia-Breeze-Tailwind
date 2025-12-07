const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id,
        nombre: dataKey.nombre || '',
        siglas: dataKey.siglas || '',
        cif: dataKey.cif || '',
        email: dataKey.email || '',
        telefono: dataKey.telefono || '',
        representante_id: dataKey.representante.id || null,
        adjunto_id: dataKey.adjunto.id || null,
        direccion: {
            id: dataKey.direccion.id || null,
            full_address: dataKey.direccion.full_address || '',
            latitud: dataKey.direccion.latitud || '',
            longitud: dataKey.direccion.longitud || '',
            codigo_postal: dataKey.direccion.codigo_postal || '',
            numero: dataKey.direccion.numero || '',
            piso: dataKey.direccion.piso || '',
            puerta: dataKey.direccion.puerta || '',
            escalera: dataKey.direccion.escalera || '',
            bloque: dataKey.direccion.bloque || '',
        },
    };

    return formData;
}

export default formResource;