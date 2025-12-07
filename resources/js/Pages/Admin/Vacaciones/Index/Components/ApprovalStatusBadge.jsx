import { Badge } from "@/Components/ui/badge";
import Icon from "@/imports/LucideIcon";

/**
 * Componente para mostrar el estado de aprobación de una solicitud
 * @param {Object} props 
 * @param {Object} props.solicitud - Datos de la solicitud con aprobaciones
 * @returns {JSX.Element}
 */
export default function ApprovalStatusBadge({ solicitud }) {
    const { aprobaciones = [], estado } = solicitud;

    // Si no hay aprobaciones, mostrar estado pendiente
    if (!aprobaciones.length) {
        return (
            <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                <Icon name="Clock" className="w-3 h-3 mr-1" />
                Pendiente
            </Badge>
        );
    }

    // Agrupar aprobaciones por tipo
    const aprobacionesPorTipo = aprobaciones.reduce((acc, aprobacion) => {
        acc[aprobacion.tipo_aprobacion] = aprobacion;
        return acc;
    }, {});

    const tiposRequeridos = ['manager', 'hr', 'direction'];
    const aprobadas = tiposRequeridos.filter(tipo => 
        aprobacionesPorTipo[tipo]?.aprobado === true
    );
    const rechazadas = tiposRequeridos.filter(tipo => 
        aprobacionesPorTipo[tipo]?.aprobado === false
    );

    // Si hay rechazos, mostrar rechazado
    if (rechazadas.length > 0) {
        return (
            <Badge variant="destructive" className="text-red-600 border-red-200 bg-red-50">
                <Icon name="X" className="w-3 h-3 mr-1" />
                Rechazado
            </Badge>
        );
    }

    // Si todas están aprobadas, mostrar aprobado
    if (aprobadas.length === tiposRequeridos.length) {
        return (
            <Badge variant="default" className="text-green-600 border-green-200 bg-green-50">
                <Icon name="Check" className="w-3 h-3 mr-1" />
                Aprobado
            </Badge>
        );
    }

    // Si hay algunas aprobaciones pero no todas, mostrar parcial
    if (aprobadas.length > 0) {
        return (
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                <Icon name="MoreHorizontal" className="w-3 h-3 mr-1" />
                Parcial ({aprobadas.length}/{tiposRequeridos.length})
            </Badge>
        );
    }

    // Por defecto, pendiente
    return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
            <Icon name="Clock" className="w-3 h-3 mr-1" />
            Pendiente
        </Badge>
    );
}
