import { Input } from "@/Components/ui/input";
import Icon from "@/imports/LucideIcon";
import { useDataTable } from "../../Context/DataTableContext";
import { useCallback, useEffect, useRef, useState } from "react";

// Constantes definidas fuera del componente para evitar recreaciones
const DEBOUNCE_DELAY = 500; // Tiempo de espera para el debounce (en milisegundos)

export default function GlobalFilter() {
    const { table } = useDataTable();
    const [filter, setFilter] = useState(table.getState().globalFilter || "");

    // Usar useRef en lugar de useState para el timer para evitar re-renders innecesarios
    const timerRef = useRef(null);

    /**
     * Maneja el cambio en el filtro de búsqueda global de la tabla
     * 
     * @param {Object} event - Evento del input
     * @param {string} event.target.value - Valor del input de búsqueda
     */
    const handleFilterChange = useCallback(({ target: { value } }) => {
        setFilter(value);

        // Limpiar timer anterior
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            table.setGlobalFilter(value || "");
        }, DEBOUNCE_DELAY);
    }, [table]);

    // Limpiar timer cuando el componente se desmonte
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <div className="w-full sm:max-w-sm">
            <div className="relative">
                <Icon
                    name="Search"
                    className="dark:text-custom-white/50 text-custom-gray-dark w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <Input
                    placeholder="Buscar..."
                    value={filter}
                    onChange={handleFilterChange}
                    className="pl-10 rounded-full dark:text-custom-white/50 bg-custom-gray-default dark:bg-custom-blackSemi border-none"
                />
            </div>
        </div>
    );
}