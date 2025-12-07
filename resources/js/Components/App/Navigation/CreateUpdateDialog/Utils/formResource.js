const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id,
        name: dataKey.name || '',
        description: dataKey.description || '',
        icon: dataKey.icon || 'MapPin',
        route_name: dataKey.route_name || '',
        parent_id: dataKey.parent_id || null,
        weight: dataKey.weight || 1,
        is_important: dataKey.is_important || false,
        is_recent: dataKey.is_recent || false,
        requires_employee: dataKey.requires_employee || false,
    };

    return formData;
}

export default formResource;