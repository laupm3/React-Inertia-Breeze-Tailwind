import { Button } from "@/Components/App/Buttons/Button";
import { forwardRef } from "react";
import { useAdvanceMultiselect } from "../Context/AdvanceMultiselectContext";

/**
 * Componente para mostrar el valor seleccionado en el Multiselect
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.selection - Objeto con la información de la selección actual
 * @param {string} props.placeholder - Texto a mostrar cuando no hay selección
 * @param {Function} props.renderSelection - Función personalizada para renderizar la selección
 */
const SelectionButton = forwardRef((props, ref) => {
    const { selection, placeholder, renderSelection } = useAdvanceMultiselect();
    const { value } = selection;

    // Renderizador por defecto para mostrar el valor seleccionado
    const defaultRenderer = (values) => {
        if (!values || values.length === 0) return placeholder;
        
        if (values.length === 1) {
            const singleValue = values[0];
            if (typeof singleValue === 'string') return singleValue;
            
            const display = singleValue?.nombre || singleValue?.name || singleValue?.title || singleValue?.label;
            return display || JSON.stringify(singleValue);
        }
        
        // Para múltiples selecciones, mostrar conteo
        return `${values.length} elemento${values.length !== 1 ? 's' : ''} seleccionado${values.length !== 1 ? 's' : ''}`;
    };

    return (
        <Button
            ref={ref}
            type="button"
            variant="secondary"
            className={`w-full h-10 rounded-full bg-custom-gray-default dark:bg-custom-blackSemi text-custom-blackLight dark:text-custom-white hover:bg-custom-gray-light dark:hover:bg-custom-blackMedium transition-colors px-4 py-2 text-sm flex items-center justify-start text-start focus:outline-none focus:ring-0 font-normal ${value && value.length > 0 ? "" : "text-gray-500"}`}
            {...props}
        >
            {value && value.length > 0
                ? (renderSelection
                    ? renderSelection(value)
                    : defaultRenderer(value))
                : placeholder
            }
        </Button>
    );
});

SelectionButton.displayName = "SelectionButton";

export default SelectionButton;