const ContentTwoItems = [
    { value: "Users", label: "Usuarios", url: "admin.users.index", icon: "UserRoundCog" },
    { value: "Empleados", label: "Empleados", url: "admin.empleados.index", icon: "UserRoundCog" },
    { value: "Roles", label: "Roles", url: "admin.roles.index", icon: "Notebook" },
    { value: "Control Panel", label: "Control Panel", url: "admin.dashboard", icon: "ChartArea" },
    { value: "Control de fichajes", label: "Control de fichajes", url: "admin.controlFichajes", icon: "Fingerprint" },
    { value: "Nominas", label: "Nóminas", url: "admin.nominas.index", icon: "HandCoins" },
    { value: "Contratos", label: "Contratos", url: "admin.contratos.index", icon: "Signature" },
    { value: "Login Tablet", label: "Login Tablet", url: "login-tablet", icon: "Tablet" },
    { value: "Centros", label: "Centros", url: "admin.centros.index", icon: "Building" },
    { value: "Departmentos", label: "Departamentos", url: "admin.departamentos.index", icon: "Boxes" },
    { value: "Empresas", label: "Empresas", url: "admin.empresas.index", icon: "Building" },
    { value: "Permissions", label: "Permisos de la App", url: "admin.permissions.index", icon: "Scroll" },
    { value: "Asignaciones", label: "Asignaciones", url: "admin.asignaciones.index", icon: "ClipboardList" },
    { value: "Teams", label: "Teams", url: "admin.teams.index", icon: "Users" },
    { value: "Plantillas de Brevo", label: "Plantillas de Brevo", url: "admin.brevo.plantillas.index", icon: "LayoutTemplate" },
    {
        value: "Planificación",
        label: "Planificación",
        icon: "Calendar",
        children: [
            { value: "Horarios", label: "Horarios", url: "admin.horarios.index", icon: "Calendar" },
            { value: "Turnos", label: "Turnos", url: "admin.turnos.index", icon: "CalendarCog" },
            { value: "Jornadas", label: "Jornadas", url: "admin.jornadas.index", icon: "CalendarRange" },
        ]
    },
    {
        value: "Permisos",
        label: "Solicitudes",
        icon: "Scroll",
        children: [
            { value: "Vacaciones", label: "Vacaciones", url: "user.vacaciones.index",icon: "Calendar" },
            { value: "PeroV", label: "Permisos", url: "admin.solicitudes.index", icon: "Scroll" },
        ]
    },
];

export default ContentTwoItems;