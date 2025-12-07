import useEventUtils from '@/hooks/useEventUtils';
import Icon from '@/imports/LucideIcon';

/**
 * Componente para mostrar estadísticas de eventos
 * @param {Object} props - Props del componente
 * @param {Array} props.events - Array de eventos
 * @param {Array} props.eventTypes - Array de tipos de eventos
 * @param {string} props.className - Clases CSS adicionales
 */
const EventStats = ({ events = [], eventTypes = [], className = '' }) => {
    const { getEventStats } = useEventUtils(events);
    
    const stats = getEventStats();

    const getEventTypeName = (typeId) => {
        const eventType = eventTypes.find(type => type.id === typeId);
        return eventType?.nombre || 'Sin tipo';
    };

    const getEventTypeColor = (typeId) => {
        const eventType = eventTypes.find(type => type.id === typeId);
        return eventType?.color || '#cccccc';
    };

    return (
        <div className={`bg-white dark:bg-custom-blackSemi rounded-lg p-4 ${className}`}>
            <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
                <Icon name="BarChart3" className="w-5 h-5 mr-2 text-custom-orange" />
                Estadísticas de Eventos
            </h3>
            
            {/* Estadísticas generales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                    <div className="text-2xl font-bold text-custom-orange">{stats.total}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{stats.future}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Futuros</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500">{stats.past}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Pasados</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{stats.today}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Hoy</div>
                </div>
            </div>

            {/* Estadísticas por tipo */}
            {Object.keys(stats.byType).length > 0 && (
                <div>
                    <h4 className="text-md font-medium mb-3 dark:text-white">Por tipo de evento</h4>
                    <div className="space-y-2">
                        {Object.entries(stats.byType).map(([typeId, count]) => (
                            <div key={typeId} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: getEventTypeColor(parseInt(typeId)) }}
                                    />
                                    <span className="text-sm dark:text-gray-200">
                                        {getEventTypeName(parseInt(typeId))}
                                    </span>
                                </div>
                                <span className="text-sm font-medium dark:text-white">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventStats;
