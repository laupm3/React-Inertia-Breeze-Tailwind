const DEFAULT_COLOR_MAP = {
    point: 'bg-gray-500',
    bg: 'bg-gray-500/30',
    text: 'text-gray-500',
    border: 'border-gray-500'
};

// Tamaños predefinidos para pills con círculos proporcionales
const PILL_SIZES = {
    xs: {
        container: 'text-xs px-2 py-1 gap-1.5',
        point: 'w-1.5 h-1.5',
        text: 'text-xs font-medium'
    },
    sm: {
        container: 'text-sm px-3 py-1.5 gap-2',
        point: 'w-2 h-2',
        text: 'text-sm font-medium'
    },
    md: {
        container: 'text-sm px-4 py-1.5 gap-2',
        point: 'w-2.5 h-2.5',
        text: 'text-sm font-bold'
    },
    lg: {
        container: 'text-base px-4 py-2 gap-2.5',
        point: 'w-3 h-3',
        text: 'text-base font-bold'
    }
};

/**
 * Crea un componente de tipo Pill con tamaños consistentes y círculos proporcionales
 * 
 * @param {Object} props Las propiedades del componente
 * @param {String} props.identifier El identificador del color - Hace referencia a la clave del objeto mapColor
 * @param {Object} props.mapColor El objeto que contiene el diccionario de colores
 * @param {String} props.size El tamaño predefinido del pill: 'xs', 'sm', 'md', 'lg'
 * @param {String} props.textClassName Clase adicional para el texto de la pill (sobrescribe las predefinidas)
 * @param {String} props.className Clases adicionales para el contenedor
 * @param {React.ReactNode} props.children El contenido del pill
 * 
 * @returns {JSX.Element} El componente de React
 */
function Pill({ 
    identifier = null, 
    mapColor = {}, 
    children, 
    className = '', 
    size = 'md',
    textClassName = null 
}) {
    const COLOR_MAP = (!identifier)
        ? DEFAULT_COLOR_MAP
        : mapColor[identifier] || DEFAULT_COLOR_MAP;

    const { point, bg, text, border } = COLOR_MAP;
    
    // Obtener configuración de tamaño, fallback a 'md' si no existe
    const sizeConfig = PILL_SIZES[size] || PILL_SIZES.md;
    
    // Usar textClassName personalizado o el predefinido
    const finalTextClassName = textClassName || sizeConfig.text;

    return (
        <div className={`
            flex flex-row items-center w-fit rounded-full
            ${sizeConfig.container}
            ${bg} ${text} 
            ${className}
        `}>
            <div className={`${point} ${sizeConfig.point} rounded-full flex-shrink-0`} />
            <span className={finalTextClassName}>
                {children ? children : 'No definido'}
            </span>
        </div>
    );
}

export default Pill;