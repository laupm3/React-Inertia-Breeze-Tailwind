const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id || null,
        name: dataKey.name || '',
        description: dataKey.description || '',
    };

    return formData;
}

export default formResource;