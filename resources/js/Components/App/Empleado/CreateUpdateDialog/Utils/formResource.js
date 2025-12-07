const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id,
        nombre: dataKey.nombre || '',
        primer_apellido: dataKey.primerApellido || '',
        segundo_apellido: dataKey.segundoApellido || '',
        nif: dataKey.nif || '',
        caducidad_nif: dataKey.caducidadNif || dataKey.caducidad_nif || '',
        tipo_empleado_id: dataKey.tipoEmpleado?.id?.toString() || '',
        genero_id: dataKey.genero?.id?.toString() || '',
        estado_id: dataKey.estadoEmpleado?.id?.toString() || '',
        tipo_documento_id: dataKey.tipoDocumento?.id?.toString() || '',
        email: dataKey.email || '',
        email_secundario: dataKey.emailSecundario || '',
        telefono: dataKey.telefono || '',
        telefono_personal_movil: dataKey.telefono_personal_movil || '',
        telefono_personal_fijo: dataKey.telefono_personal_fijo || '',
        extension_centrex: dataKey.extension_centrex || '',
        fecha_nacimiento: dataKey.fechaNacimiento || '',
        niss: dataKey.niss || '',
        contacto_emergencia: dataKey.contactoEmergencia || '',
        telefono_emergencia: dataKey.telefonoEmergencia || '',
        direccion: {
            id: dataKey.direccion?.id || null,
            full_address: dataKey.direccion?.full_address || '',
            latitud: dataKey.direccion?.latitud?.toString() || '',
            longitud: dataKey.direccion?.longitud?.toString() || '',
            codigo_postal: dataKey.direccion?.codigo_postal || '',
            numero: dataKey.direccion?.numero || '',
            piso: dataKey.direccion?.piso || '',
            puerta: dataKey.direccion?.puerta || '',
            escalera: dataKey.direccion?.escalera || '',
            bloque: dataKey.direccion?.bloque || ''
        },
        user_id: dataKey.user?.id || null,
        create_user: dataKey.user?.id ? false : true
    };

    return formData;
}

export default formResource;