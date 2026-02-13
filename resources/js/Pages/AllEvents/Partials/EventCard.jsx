import Icon from "@/imports/LucideIcon";
import { formatDateDMY } from "@/Utils";

/**
 * Componente para mostrar una tarjeta de evento
 * @param {Object} props - Props del componente
 * @param {Object} props.event - Datos del evento
 * @param {Object} props.eventTypeColor - Colores del tipo de evento
 * @param {Function} props.onClick - Función a ejecutar al hacer click
 * @param {Function} props.extractTextFromDescription - Función para extraer texto de la descripción
 * @param {boolean} props.isPast - Si el evento ya pasó
 */
const EventCard = ({ event, eventTypeColor, onClick, extractTextFromDescription, isPast = false }) => {
  // Extraer el color directamente del objeto
  const pointColor = eventTypeColor?.point?.backgroundColor || '#cccccc';
  // Si el evento es pasado, hacer el color más opaco
  const finalPointColor = isPast ? `${pointColor}80` : pointColor; // Añadir transparencia si es pasado

  // Clases CSS dinámicas basadas en si el evento es pasado
  const cardClasses = `
    flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer mb-2
    ${isPast
      ? 'opacity-60 bg-gray-50 dark:bg-gray-800/30 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/40'
      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-custom-blackLight/50'
    }
  `.trim();

  return (
    <div
      className={cardClasses}
      onClick={() => onClick(event)}
    >
      <div className="flex items-center space-x-3">        <div
        className="w-3 h-3 rounded-full m-4"
        style={{ backgroundColor: finalPointColor }}
      /><div>
          <h4 className={`font-medium ${isPast ? 'text-gray-500 dark:text-gray-400' : 'dark:text-white'}`}>
            {event.nombre}
          </h4>
          <p className={`text-sm line-clamp-1 ${isPast ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
            {extractTextFromDescription(event.descripcion)}
          </p>
        </div>
      </div>      <div className={`text-xs ${isPast ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
        <div className="flex items-center mb-1">
          <Icon name="Calendar" className={`w-3 h-3 mr-1 ${isPast ? 'text-gray-400' : 'text-custom-orange'}`} />
          {formatDateDMY(event.fecha_inicio)}
        </div>
        <div className="flex items-center">
          <Icon name="Clock" className={`w-3 h-3 mr-1 ${isPast ? 'text-gray-400' : 'text-custom-orange'}`} />
          {event.hora_inicio}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
