import { Tooltip, TooltipContent, TooltipTrigger } from "@/Components/ui/tooltip";

/**
 * Componente reutilizable para mostrar una vista previa de un array en una celda de tabla.
 * Si el array excede el límite, muestra un badge con el excedente y un tooltip con la lista completa.
 *
 * @param {Array} items - Array de elementos a mostrar
 * @param {function} labelFn - Función para renderizar el texto de cada elemento (por defecto item => item)
 * @param {number} maxToShow - Máximo de elementos visibles antes de mostrar el badge/tooltip (por defecto 3)
 * @param {ReactNode} emptyText - Texto a mostrar si el array está vacío (por defecto "No asignados")
 * @param {boolean} useTooltip - Si mostrar el tooltip con la lista completa (por defecto true)
 * @param {function} badgeFn - Función para renderizar el badge del excedente (por defecto badge azul)
 * @param {string} separator - Separador entre elementos (por defecto ", ")
 * @param {string} className - Clases adicionales para el contenedor principal
 */
export default function ArrayCellPreview({
    items = [],
    labelFn = (item) => item,
    maxToShow = 3,
    emptyText = null,
    useTooltip = true,
    badgeFn,
    separator = ', ',
    className = '',
}) {
    if (!items || items.length === 0) {
        return emptyText;
    }

    // Construir la vista previa visible con el separador personalizado
    const visible = items.slice(0, maxToShow).map(labelFn).reduce((acc, curr, idx) => {
        if (idx === 0) return curr;
        return acc + separator + curr;
    }, '');
    
    const hiddenCount = items.length - maxToShow;

    const badge = badgeFn
        ? badgeFn(hiddenCount)
        : (
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer align-middle">
                +{hiddenCount} más
            </span>
        );

    if (hiddenCount > 0 && useTooltip) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={className}>
                        {visible} {badge}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    {items.map((item, idx) => (
                        <div key={idx}>{labelFn(item)}</div>
                    ))}
                </TooltipContent>
            </Tooltip>
        );
    }
    
    return <span className={className}>{visible}</span>;
}
