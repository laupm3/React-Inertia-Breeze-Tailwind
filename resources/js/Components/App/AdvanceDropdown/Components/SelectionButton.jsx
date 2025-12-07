import { Button } from "@/Components/App/Buttons/Button";
import { forwardRef } from "react";
import { useAdvanceDropdown } from "../Context/AdvanceDropdownContext";

/**
 * Componente para mostrar el valor seleccionado en el dropdown
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.selection - Objeto con la información de la selección actual
 * @param {string} props.placeholder - Texto a mostrar cuando no hay selección
 * @param {Function} props.renderSelection - Función personalizada para renderizar la selección
 */
const SelectionButton = forwardRef((props, ref) => {
    const { selection, placeholder, renderSelection } = useAdvanceDropdown();
    const { value } = selection;

    // Renderizador por defecto para mostrar el valor seleccionado
    const defaultRenderer = (value) => {
        if (typeof value === 'string') return value;

        // Intenta obtener propiedades comunes de identificación
        const display = value?.nombre || value?.name || value?.title || value?.label;

        return display || JSON.stringify(value);
    };

    return (
        <Button
            ref={ref}
            type="button"
            variant="secondary"
            className={`w-full flex items-center justify-start text-start focus:outline-none focus:ring-0 focus:ring-offset-0 dark:hover:text-custom-gray-light font-normal ${value ? "" : "text-custom-gray"}`}
            {...props}
        >
            {value
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