/**
 * Componente para mostrar el peso visual como puntos del 1 al 5
 * @param {Object} props
 * @param {number} props.weight - Peso del 1 al 5
 * @param {string} props.className - Clases adicionales
 * @param {boolean} props.interactive - Si es true, permite seleccionar el peso
 * @param {function} props.onWeightChange - Función que se ejecuta cuando cambia el peso (solo si interactive=true)
 * @returns {JSX.Element}
 */
const WeightIndicator = ({ 
    weight = 1, 
    className = '', 
    interactive = false, 
    onWeightChange = null 
}) => {
    // Asegurar que el peso esté entre 1 y 5
    const normalizedWeight = Math.min(Math.max(weight || 1, 1), 5);
    
    const handleDotClick = (selectedWeight) => {
        if (interactive && onWeightChange) {
            onWeightChange(selectedWeight);
        }
    };
    
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[1, 2, 3, 4, 5].map((dot) => (
                <div
                    key={dot}
                    className={`w-3 h-3 rounded-full transition-colors ${
                        dot <= normalizedWeight 
                            ? 'bg-custom-orange' 
                            : 'bg-gray-300 dark:bg-gray-600'
                    } ${
                        interactive 
                            ? 'cursor-pointer hover:scale-110 hover:shadow-sm' 
                            : ''
                    }`}
                    title={`Peso: ${normalizedWeight}/5${interactive ? ' (Clic para cambiar)' : ''}`}
                    onClick={() => handleDotClick(dot)}
                />
            ))}
        </div>
    );
};

export default WeightIndicator;
