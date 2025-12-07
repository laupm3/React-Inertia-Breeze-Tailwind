import WeekDay from "@/Pages/Admin/Jornadas/Partials/WeekDay";

export default function WeekdayPreview({ esquema = [], turnos = [], modalidades = [] }) {
  // Array con los nombres de los días de la semana
  const weekdayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const weekdayNumbers = [0, 1, 2, 3, 4, 5, 6];

  // Función para obtener el turno completo a partir del turno_id
  const getTurnoById = (turnoId) => {
    return turnos.find(turno => turno.id === turnoId) || null;
  };

  // Función para obtener la modalidad completa a partir del modalidad_id
  const getModalidadById = (modalidadId) => {
    return modalidades.find(modalidad => modalidad.id === modalidadId) || null;
  };

  // Construir la previsualización de los días con sus datos
  const previewDays = weekdayNumbers.map((dayIndex) => {
    // Buscar el esquema para este día
    const dayConfig = esquema.find(day => day.weekday_number === dayIndex);
    
    // Si no hay configuración para este día, devolver un día vacío
    if (!dayConfig || !dayConfig.turno_id) {
      return {
        dayIndex,
        weekday_name: weekdayNames[dayIndex]
      };
    }
    
    // Obtener el turno y modalidad correspondientes
    const turno = getTurnoById(dayConfig.turno_id);
    const modalidad = getModalidadById(dayConfig.modalidad_id);
    
    // Devolver la configuración completa del día para la previsualización
    return {
      dayIndex,
      weekday_name: weekdayNames[dayIndex],
      turno,
      modalidad,
      esquema: { centro: dayConfig.centro }
    };
  });

  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-custom-blue dark:text-custom-white mb-2">
        Previsualización de la jornada
      </h3>
      
      <div className="flex gap-2 overflow-auto p-2">
        {previewDays.map((day) => (
          <WeekDay 
            key={day.dayIndex}
            weekday={day}
            dayIndex={day.dayIndex}
            isLoading={false}
          />
        ))}
      </div>
    </div>
  );
}
