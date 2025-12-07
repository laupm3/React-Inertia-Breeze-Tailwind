const formResource = (dataKey) => {
    if (!dataKey) return;
    console.log('dataKey :>> ', dataKey);

    const formData = {
        id: dataKey.id || null,
        name: dataKey.name || '',
        module_id: dataKey.module.id || null,
        description: dataKey.description || '',
    };

    return formData;
}

export default formResource;