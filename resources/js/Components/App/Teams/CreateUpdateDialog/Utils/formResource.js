const formResource = (dataKey) => {
    if (!dataKey) return;

    const formData = {
        id: dataKey.id || null,
        name: dataKey.name || '',
        description: dataKey.description || '',
        icon: dataKey.icon || 'Box',
        bg_color: dataKey.bg_color || '#16b83a',
        icon_color: dataKey.icon_color || '#ed703b',
        personal_team: dataKey.personal_team || false,
        owner: {
            id: dataKey.owner?.id || 0,
            name: dataKey.owner?.name || '',
            email: dataKey.owner?.email || '',
            profile_photo_url: dataKey.owner?.profile_photo_url || '',
            profile_photo_path: dataKey.owner?.profile_photo_path || '',
            empleado: dataKey.owner?.empleado || null,
            role: dataKey.owner?.role || null,
            departamentos: dataKey.owner?.departamentos || null,
            centros: dataKey.owner?.centros || null,
            asignaciones: dataKey.owner?.asignaciones || null,
            contratos: dataKey.owner?.contratos || null,
            membership: dataKey.owner?.membership || null
        },
        users: dataKey.users || [],
        teamInvitations: dataKey.teamInvitations || []
    };

    return formData;
}

export default formResource;
