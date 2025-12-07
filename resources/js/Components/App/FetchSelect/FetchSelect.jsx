import { useMemo } from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/Components/ui/select";
import useSelectData from "./Hooks/useSelectData";

/**
 * Componente selector que utiliza datos cacheados.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string|number} props.value - Valor seleccionado actualmente
 * @param {Function} props.onValueChange - Función a llamar cuando cambie el valor
 * @param {boolean} props.disabled - Si el selector está deshabilitado
 * @param {string} props.placeholder - Texto de placeholder
 * @param {string} props.className - Clases adicionales para el componente
 * @returns {JSX.Element}
 */
export default function FetchSelect({
    fetchRoute,
    responseParameter,
    value,
    onValueChange,
    disabled = false,
    placeholder = 'selecciona...',
    className = ''
}) {
    // Usar el hook personalizado para obtener los datos
    const { selectorData, loading, error, reload } = useSelectData(fetchRoute, responseParameter);

    // Memorizar el valor seleccionado para mayor rendimiento
    const selectedValue = useMemo(() => {
        if (value === null || value === undefined) {
            return "";
        }
        return value.toString();
    }, [value]);

    return (
        <div className="w-full">
            <Select
                value={selectedValue}
                onValueChange={onValueChange}
                disabled={disabled || loading}
            >
                <SelectTrigger className={`rounded-full dark:text-custom-gray-semiLight bg-custom-gray-default dark:bg-custom-blackSemi focus:ring-transparent ${className}`}>
                    <SelectValue placeholder={loading ? 'Cargando...' : placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-custom-gray-default dark:bg-custom-blackSemi max-w-[80vw]">
                    {error ? (
                        <>
                            <SelectItem value="error" disabled>
                                Error: {error}
                            </SelectItem>
                            <SelectItem
                                value="retry"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    reload();
                                }}
                            >
                                Reintentar carga
                            </SelectItem>
                        </>
                    ) : loading ? (
                        <SelectItem value="loading" disabled>
                            Cargando...
                        </SelectItem>
                    ) : selectorData.length === 0 ? (
                        <SelectItem value="empty" disabled>
                            No hay datos disponibles
                        </SelectItem>
                    ) : (
                        selectorData.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                {tipo.nombre || tipo.name}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}