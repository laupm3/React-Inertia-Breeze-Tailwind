export const EVENT_COLORS = {
  'Vacaciones': 'bg-pink-600/30', // Clase CSS de Tailwind para vacaciones
  'Boda o pareja registrada': 'bg-blue-500/30',
  'Permiso sin sueldo': 'bg-gray-500/30',
  'Mudanza de familiar cercano': 'bg-green-500/30',
  'Boda de familiar cercano': 'bg-purple-500/30',
  'Permiso por adopción o acogida': 'bg-teal-500/30',
  'Permiso para cuidar hijos menores de 8 años': 'bg-pink-500/30',
  'Ausencia por urgencia familiar': 'bg-orange-500/30',
  'Obligación legal o personal': 'bg-cyan-500/30',
  'Permiso por violencia de género': 'bg-red-500/30',
  'Nacimiento, accidente o fallecimiento familiar': 'bg-indigo-500/30',
  'Cirugía con reposo de familiar': 'bg-lime-500/30',
  'Pruebas médicas de embarazo o adopción': 'bg-yellow-500/30',
  'Baja por maternidad': 'bg-fuchsia-500/30',
  'Baja por paternidad':  'bg-rose-500/30',
  'Hospitalización tras parto': 'bg-sky-500/30',
  'Permiso por lactancia': 'bg-violet-500/30',
  'Reducción de jornada por cuidado': 'bg-amber-500/30',
  'Citas médicas justificadas': 'bg-emerald-500/30',
};

// Colores para los badges de estado
export const STATUS_BADGE_COLORS = {
  'Aprobado': 'bg-green-500',
  'Denegado': 'bg-red-500',
  'En revisión': 'bg-yellow-500',
  'Solicitado': 'bg-blue-500',
  'En proceso': 'bg-purple-500',
  'Pendiente': 'bg-orange-500',
  'Visto': 'bg-cyan-500',
  'default': 'bg-gray-500'
};

// Función para obtener el estado de una solicitud
export const getEstadoSolicitud = (solicitud) => {
  if (!solicitud || !solicitud.estado || !solicitud.estado.nombre) {
    return 'Estado desconocido';
  }
  
  const { estado, seen_at } = solicitud;
  
  // Lógica para determinar el estado a mostrar
  if (seen_at && estado.nombre === "Solicitado") {
    return "Visto";
  }
  
  return estado.nombre;
};

export function SolicitudVacacionesEvent(vacaciones) {
  return vacaciones.map(vacacion => {
    const {
      id,
      fecha_inicio,
      fecha_fin,
      permiso,
      empleado,
    } = vacacion;

    let backgroundColor; 
    // Para vacaciones, siempre usar el color específico de vacaciones
    backgroundColor = EVENT_COLORS['Vacaciones'] || 'bg-pink-600/30';

    // Obtener el estado y color del badge
    const estadoVacacion = getEstadoSolicitud(vacacion);
    const badgeColor = STATUS_BADGE_COLORS[estadoVacacion] || STATUS_BADGE_COLORS.default;

    const avatarDescription = empleado && empleado.user && empleado.user.profile_photo_url ? (
      <div className="relative">
        <img
          src={empleado.user.profile_photo_url}
          alt={empleado.nombre || 'Avatar'}
          className="h-6 w-6 rounded-full mr-2 object-cover"
        />
        {/* Badge de estado */}
        <div 
          className={`absolute -top-1 right-0.5 w-3 h-3 rounded-full ${badgeColor}`}
          title={`Estado: ${estadoVacacion}`}
        ></div>
      </div>
    ) : (
      <div className="relative">
        <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 mr-2 flex items-center justify-center">
          <span className="text-xs text-white font-bold">
            {empleado?.nombre ? empleado.nombre.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
        {/* Badge de estado */}
        <div 
          className={`absolute -top-1 right-0.5 w-3 h-3 rounded-full ${badgeColor}`}
          title={`Estado: ${estadoVacacion}`}
        ></div>
      </div>
    );

    const empleadoNombreCompleto = empleado ? (empleado.nombreCompleto || empleado.nombre || 'Nombre no disponible') : 'Nombre no disponible';

    return {
      id: String(id), 
      title: 'Vacaciones', 
      start: fecha_inicio, 
      end: fecha_fin, 
      backgroundColor: backgroundColor,
      extendedProps: {
        description: avatarDescription,
        empleadoNombre: empleadoNombreCompleto, 
        permisoCompleto: vacacion,
        estadoSolicitud: estadoVacacion, // Añadimos el estado para filtrado
      }
    };
  });
}
