const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id,
        nombre: dataKey.nombre,
        descripcion: dataKey.descripcion
    };

    return formData;
}

export default formResource;