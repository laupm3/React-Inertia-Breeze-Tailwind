const roleDefinitions = {
  member: {
    label: "Miembro",
    description: "Puede ver y participar en el equipo",
    permissions: [
      "Ver información del equipo",
      "Ver miembros",
      "Participar en actividades"
    ],
    style: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  },
  editor: {
    label: "Editor",
    description: "Puede gestionar contenido y algunos aspectos del equipo",
    permissions: [
      "Permisos de Miembro",
      "Crear y editar contenido",
      "Gestionar actividades",
      "Invitar nuevos miembros"
    ],
    style: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
  },
  admin: {
    label: "Administrador",
    description: "Control total sobre el equipo excepto su eliminación",
    permissions: [
      "Permisos de Editor",
      "Gestionar miembros",
      "Asignar roles",
      "Configurar equipo"
    ],
    style: "bg-orange-300 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
  }
};

export default roleDefinitions