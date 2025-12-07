import Icon from '@/imports/LucideIcon';
import UserAvatar from '@/Components/App/User/UserAvatar';

// Helper para formatear fecha, igual que en HistoricLayout y VistaPermiso
const formatDate = (dateString) => {
  if (!dateString) return "--/--/--";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "--/--/--";
  // Eliminar el punto de los meses abreviados si existe (ej. "ene." -> "ene")
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\.$/, '');
};

const generarPasosTimelineDesdePermiso = (permiso) => {
  if (!permiso || !permiso.estado) {
    return [
      { titulo: "Vacaciones solicitadas", fecha: "--/--/--", completado: false, icono: "ArrowUp", aprobador: null, observacion: null, esRechazo: false },
      { titulo: "En Revisión", fecha: "--/--/--", completado: false, icono: "Search", aprobador: null, observacion: null, esRechazo: false },
      { titulo: "En Proceso", fecha: "--/--/--", completado: false, icono: "Loader", aprobador: null, observacion: null, esRechazo: false },
      { titulo: "Resultado Final", fecha: "--/--/--", completado: false, icono: "Check", aprobador: null, observacion: null, esRechazo: false }
    ];
  }

  const { aprobaciones, estado, fecha_inicio, seen_at, updated_at, created_at, requiere_aprobacion_manager, requiere_aprobacion_hr, is_cancelled } = permiso;

  const pasos = [
    { titulo: "Vacaciones solicitadas", fecha: formatDate(fecha_inicio || created_at), completado: true, icono: "ArrowUp", aprobador: null, observacion: null, esRechazo: false, esAutomatico: false },
    { titulo: "En Revisión", fecha: seen_at ? formatDate(seen_at) : "--/--/--", completado: false, icono: "Search", aprobador: null, observacion: null, esRechazo: false, esAutomatico: false },
    { titulo: "En Proceso", fecha: "--/--/--", completado: false, icono: "Loader", aprobador: null, observacion: null, esRechazo: false, esAutomatico: false },
    { titulo: "Resultado Final", fecha: "--/--/--", completado: false, icono: "Check", aprobador: null, observacion: null, esRechazo: false, esAutomatico: false }
  ];

  // Manejar estado de cancelación
  if (is_cancelled || estado.nombre === "Cancelación") {
    pasos[0].completado = true;
    pasos[1].completado = true;
    pasos[2].completado = true;
    pasos[3].completado = true;
    pasos[3].titulo = "Vacaciones Canceladas";
    pasos[3].fecha = formatDate(updated_at);
    pasos[3].icono = "XCircle";
    pasos[3].esRechazo = true;
    pasos[3].observacion = "Solicitud de cancelación por el usuario";
    return pasos;
  }

  const aprobacionManager = aprobaciones?.find(a => a.tipo_aprobacion === 'manager');
  const aprobacionHR = aprobaciones?.find(a => a.tipo_aprobacion === 'hr');

  if (aprobacionManager) {
    pasos[1].fecha = formatDate(aprobacionManager.created_at);
    pasos[1].titulo = aprobacionManager.aprobado ? "Encargado (Aprobado)" : "Encargado (Rechazado)";
    pasos[1].aprobador = aprobacionManager.approvedBy;
    pasos[1].observacion = aprobacionManager.observacion;
    pasos[1].esRechazo = !aprobacionManager.aprobado;
    pasos[1].esAutomatico = aprobacionManager.is_automatic || false;
  } else if (seen_at && estado.nombre === "Solicitado") {
    pasos[1].titulo = "En Revisión (Visto)";
  } else if (requiere_aprobacion_manager === false && estado.nombre !== "Solicitado") {
    pasos[1].titulo = "Encargado (No Req.)";
  }

  const managerActuoYAproboOnoRequerido = (aprobacionManager ? aprobacionManager.aprobado : (requiere_aprobacion_manager === false));

  if (managerActuoYAproboOnoRequerido) {
    if (aprobacionHR) {
      pasos[2].fecha = formatDate(aprobacionHR.created_at);
      pasos[2].titulo = aprobacionHR.aprobado ? "RRHH (Aprobado)" : "RRHH (Rechazado)";
      pasos[2].aprobador = aprobacionHR.approvedBy;
      pasos[2].observacion = aprobacionHR.observacion;
      pasos[2].esRechazo = !aprobacionHR.aprobado;
      pasos[2].esAutomatico = aprobacionHR.is_automatic || false;
    } else if (requiere_aprobacion_hr === false && (estado.nombre === "Aprobado" || estado.nombre === "Denegado" || estado.nombre === "Aprobado RRHH" || estado.nombre === "Pendiente RRHH")) {
      pasos[2].titulo = "RRHH (No Req.)";
      if (aprobacionManager) pasos[2].fecha = formatDate(aprobacionManager.created_at);
    } else if (estado.nombre === "Pendiente RRHH") {
      pasos[2].titulo = "RRHH (En Proceso)";
      if (aprobacionManager) pasos[2].fecha = formatDate(aprobacionManager.created_at);
    }
  } else if (aprobacionManager && !aprobacionManager.aprobado) {
    pasos[2].titulo = "RRHH (Cancelado)";
    pasos[2].fecha = formatDate(aprobacionManager.created_at);
  }
  
  let fechaUltimaAccion = updated_at || created_at;
  const todasAprobacionesRelevantes = [...(aprobaciones || [])]
    .filter(a => (a.tipo_aprobacion === 'manager' && requiere_aprobacion_manager !== false) || (a.tipo_aprobacion === 'hr' && requiere_aprobacion_hr !== false))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (todasAprobacionesRelevantes.length > 0) {
    fechaUltimaAccion = todasAprobacionesRelevantes[0].created_at;
  }
  
  if (estado.nombre === "Aprobado" || estado.nombre === "Denegado") {
    pasos[3].fecha = formatDate(fechaUltimaAccion);
  }

  switch (estado.nombre) {
    case "Cancelación":
      break;
    case "Solicitado":
      if (seen_at && !aprobacionManager) pasos[1].completado = true;
      break;
    case "Pendiente RRHH":
      pasos[0].completado = true;
      pasos[1].completado = true;
      break;
    case "Aprobado RRHH":
      pasos[0].completado = true;
      pasos[1].completado = true;
      pasos[2].completado = true;
      break;
    case "Aprobado":
      pasos[0].completado = true;
      pasos[1].completado = true;
      pasos[2].completado = true;
      pasos[3].completado = true;
      pasos[3].titulo = "Vacaciones Aprobadas";
      if (!aprobacionManager && requiere_aprobacion_manager !== false) pasos[1].titulo = "Revisión Encargado";
      else if (!aprobacionManager && requiere_aprobacion_manager === false) pasos[1].titulo = "Encargado (No Req.)";
      if (!aprobacionHR && requiere_aprobacion_hr !== false && managerActuoYAproboOnoRequerido) pasos[2].titulo = "Proceso RRHH";
      else if (!aprobacionHR && requiere_aprobacion_hr === false && managerActuoYAproboOnoRequerido) pasos[2].titulo = "RRHH (No Req.)";
      break;
    case "Denegado":
      pasos[0].completado = true;
      pasos[3].completado = true;
      pasos[3].titulo = "Vacaciones Denegadas";
      if (aprobacionManager) {
        pasos[1].completado = true;
        if (!aprobacionManager.aprobado) {
          pasos[2].completado = true; 
        } else {
          if (aprobacionHR) {
            pasos[2].completado = true;
          } else if (requiere_aprobacion_hr !== false) {
            pasos[2].completado = true;
          } else {
             pasos[2].completado = true;
          }
        }
      } else if (requiere_aprobacion_manager === false) {
        pasos[1].completado = true;
        if (aprobacionHR) {
          pasos[2].completado = true;
        } else if (requiere_aprobacion_hr !== false) {
          pasos[2].completado = true;
        } else {
           pasos[2].completado = true;
        }
      } else {
        pasos[1].completado = true;
        pasos[2].completado = true;
      }
      break;
    default:
      break;
  }
  return pasos;
};

const getPosicionPasoActivo = (permisoEstadoNombre, permisoSeenAt, permisoAprobacionManager, pasosGenerados) => {
  if (!permisoEstadoNombre) return 0;

  if (permisoSeenAt && permisoEstadoNombre === "Solicitado" && !permisoAprobacionManager) {
    return 1; 
  }

  switch (permisoEstadoNombre) {
    case "Cancelación":
      return 3;
    case "Solicitado":
      return 0;
    case "Pendiente RRHH":
      return 2;
    case "Aprobado RRHH":
      return 2; 
    case "Aprobado":
    case "Denegado":
      return 3;
    default:
      let ultimaPosicionCompletada = -1;
      for (let i = 0; i < pasosGenerados.length; i++) {
        if (pasosGenerados[i].completado) {
          ultimaPosicionCompletada = i;
        } else {
          break; 
        }
      }
      if (ultimaPosicionCompletada === pasosGenerados.length - 1 && (permisoEstadoNombre === "Aprobado" || permisoEstadoNombre === "Denegado")) return pasosGenerados.length - 1;
      if (ultimaPosicionCompletada < pasosGenerados.length -1) return ultimaPosicionCompletada + 1;
      return ultimaPosicionCompletada; // Si todos están completados pero no es Aprobado/Denegado, o si algo es inconsistente.
  }
};

const TimelineSolicitud = ({ permiso }) => {
  if (!permiso) return null;

  const pasos = generarPasosTimelineDesdePermiso(permiso);
  const aprobacionManager = permiso.aprobaciones?.find(a => a.tipo_aprobacion === 'manager');
  const posicionRealPasoActivo = getPosicionPasoActivo(permiso.estado?.nombre, permiso.seen_at, aprobacionManager, pasos);

  let nombreEstadoParaWidth = permiso.estado?.nombre || "Solicitado";
  if (permiso.seen_at && nombreEstadoParaWidth === "Solicitado" && !aprobacionManager) {
    if (posicionRealPasoActivo === 1) nombreEstadoParaWidth = "En revisión";
  } else if (posicionRealPasoActivo === 2 && (nombreEstadoParaWidth === "Pendiente RRHH" || nombreEstadoParaWidth === "Aprobado RRHH")) {
    nombreEstadoParaWidth = "En proceso";
  } else if (posicionRealPasoActivo === 3 && (nombreEstadoParaWidth === "Aprobado" || nombreEstadoParaWidth === "Denegado" || nombreEstadoParaWidth === "Cancelación")) {
    nombreEstadoParaWidth = permiso.estado?.nombre;
  }

  let progressWidth = "0%";
  if (nombreEstadoParaWidth === "Solicitado") {
    progressWidth = "13%";
  } else if (nombreEstadoParaWidth === "En revisión") {
    progressWidth = "36%";
  } else if (nombreEstadoParaWidth === "En proceso" || nombreEstadoParaWidth === "Pendiente RRHH" || nombreEstadoParaWidth === "Aprobado RRHH") {
    progressWidth = "63%";
  } else if (nombreEstadoParaWidth === "Aprobado" || nombreEstadoParaWidth === "Denegado" || nombreEstadoParaWidth === "Cancelación") {
    progressWidth = "100%";
  }
  
  return (
    <div className="mt-4 px-2">
      <div className="relative">
        <div className="absolute left-0 right-0 top-[60px] h-1 bg-gray-200 dark:bg-gray-700 z-0" style={{ transform: 'translateY(-50%)' }}>
          <div
            className="absolute left-0 top-0 h-full bg-custom-orange transition-all duration-300"
            style={{ width: progressWidth }}
          ></div>
        </div>
        <div className="grid grid-cols-4 gap-1 relative z-10" style={{ minHeight: '120px' }}>
          {pasos.map((paso, index) => {
            const esPasoActivo = posicionRealPasoActivo === index;
            const estaPasoCompletado = paso.completado;
            const esUltimoPaso = index === pasos.length - 1;

            let iconoContainerClass = "bg-gray-200 dark:bg-gray-500";
            let iconoColorClass = "text-gray-400 dark:text-gray-300";
            let circuloLineaClass = "bg-gray-300 dark:bg-gray-600 border-none";
            let textoTituloClass = "text-gray-600 dark:text-gray-400";
            let textoFechaClass = "text-gray-500 dark:text-gray-500";

            if (estaPasoCompletado) {
              if (esUltimoPaso && permiso.estado?.nombre === "Denegado") {
                iconoContainerClass = "bg-red-600/30 dark:bg-red-600/30";
                iconoColorClass = "text-red-600 dark:text-red-400";
                circuloLineaClass = "bg-red-600 border-red-600";
                textoTituloClass = "text-red-600 dark:text-red-400 font-bold";
              } else if (esUltimoPaso && permiso.estado?.nombre === "Cancelación") {
                iconoContainerClass = "bg-orange-600/30 dark:bg-orange-600/30";
                iconoColorClass = "text-orange-600 dark:text-orange-400";
                circuloLineaClass = "bg-orange-600 border-orange-600";
                textoTituloClass = "text-orange-600 dark:text-orange-400 font-bold";
              } else if (esUltimoPaso && permiso.estado?.nombre === "Aprobado") {
                iconoContainerClass = "bg-green-100 dark:bg-green-900";
                iconoColorClass = "text-green-500 dark:text-green-400";
                circuloLineaClass = "bg-green-500 border-green-600";
                textoTituloClass = "text-green-600 dark:text-green-400 font-bold";
              } else { 
                iconoContainerClass = "bg-custom-orange/30 dark:bg-custom-orange/30";
                iconoColorClass = "text-custom-orange dark:text-custom-orange";
                circuloLineaClass = "bg-custom-orange border-custom-orange dark:border-custom-orange";
                textoTituloClass = "text-custom-orange dark:text-custom-orange";
              }
            }
            
            if (esPasoActivo && !(esUltimoPaso && (permiso.estado?.nombre === "Aprobado" || permiso.estado?.nombre === "Denegado" || permiso.estado?.nombre === "Cancelación"))) {
              iconoContainerClass = "bg-custom-orange/30 dark:bg-custom-orange/30";
              iconoColorClass = "text-custom-orange dark:text-custom-orange";
              circuloLineaClass = "bg-custom-orange border-custom-orange dark:border-custom-orange ring-custom-orange dark:ring-custom-orange ring-offset-1 dark:ring-offset-gray-800";
              textoTituloClass = "text-custom-orange dark:text-custom-orange font-bold";
              textoFechaClass = "text-gray-500 dark:text-gray-500";
            }

            return (
              <div key={index} className="flex flex-col items-center text-center px-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 ${iconoContainerClass}`}>
                  {paso.icono && <Icon name={paso.icono} size={16} className={`${iconoColorClass} sm:w-5 sm:h-5`} />}
                </div>
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${circuloLineaClass} mb-2`}/>
                <div className={`text-xs font-medium ${textoTituloClass} sm:text-xs leading-tight`}>
                  {paso.titulo}
                </div>
                <div className={`text-xs ${textoFechaClass} mb-1`}>
                  {paso.fecha !== "--/--/--" ? `(${paso.fecha})` : ""}
                </div>
                
                {/* Avatar del aprobador */}
                {paso.aprobador && (
                  <div className="mt-1">
                    <UserAvatar 
                      user={paso.aprobador} 
                      size="sm"
                      className="w-6 h-6 text-xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección de observaciones */}
      {pasos.some(paso => paso.observacion && paso.observacion.trim() !== '') && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Observaciones:
          </h4>
          <div className="space-y-3">
            {pasos.filter(paso => paso.observacion && paso.observacion.trim() !== '').map((paso, index) => (
              <div key={index} className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium ${paso.esRechazo ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {paso.titulo}:
                  </span>
                  {paso.aprobador && (
                    <div className="flex items-center gap-1">
                      <UserAvatar 
                        user={paso.aprobador} 
                        size="xs"
                        className="w-4 h-4 text-xs"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {paso.aprobador.name} {paso.aprobador.apellidos}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                  {paso.observacion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineSolicitud;
