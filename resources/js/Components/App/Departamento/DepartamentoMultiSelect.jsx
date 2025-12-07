import { useEffect, useState, useMemo, useCallback } from "react";
import { MultiSelect } from "@/Components/multi-select";
import { useTranslation } from "react-i18next";
import { ChevronsUpDown, AlertCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import PropTypes from "prop-types";

export function DepartamentoMultiSelect({ 
    prevDepartamentoIds = [], 
    fetchUrl, 
    className = "", 
    onSelect,
    disabled = false 
}) {
    // Estados para manejar la selección, datos, carga y errores
    const [selectedDepartamentos, setSelectedDepartamentos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    // Función que notifica al componente padre sobre los cambios en la selección
    // Utilizamos useCallback para evitar recrear esta función en cada renderizado
    const manageSelection = useCallback((departamentos) => {
        onSelect?.(departamentos);
    }, [onSelect]);

    // Función para obtener datos de departamentos de la API
    // Encapsulada en useCallback para optimizar rendimiento y dependencias
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(fetchUrl);
            if (response.status === 200) {
                setDepartamentos(response.data.departamentos);
            } else {
                setError(new Error('Failed to fetch departamentos'));
            }
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [fetchUrl]);

    // Efecto para cargar datos al montar el componente o cuando cambia la URL
    useEffect(() => {
        fetchData();
        // Función de limpieza vacía (buena práctica)
        return () => {};
    }, [fetchData]);

    // Transformamos los datos de departamentos al formato requerido por MultiSelect
    // useMemo evita recalcular esto en cada renderizado a menos que cambie departamentos
    const departamentoOptions = useMemo(() => {
        return departamentos.map((departamento) => ({
            value: departamento.id,
            label: departamento.nombre,
        }));
    }, [departamentos]);

    // Manejador para cuando cambia la selección en el MultiSelect
    // Actualiza el estado local y notifica al componente padre
    const handleValueChange = useCallback((values) => {
        setSelectedDepartamentos(values);
        manageSelection(values);
    }, [manageSelection]);

    return (
        <div className="relative">
            {/* Componente MultiSelect con múltiples opciones configurables */}
            {/* Convertimos loading a string para evitar warning */}
            <MultiSelect
                options={departamentoOptions}
                onValueChange={handleValueChange}
                defaultValue={prevDepartamentoIds}
                placeholder={t('placeholder.SeleccionaDepartamento')}
                variant="inverted"
                animation={2}
                maxCount={10}
                modalPopover={true}
                className={`rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker border-none text-sm ${className}`}
                loading={loading.toString()} 
                chevronIcon={ChevronsUpDown} 
                placeholderTextColor="text-custom-gray-semiLight" 
                disabled={disabled || loading}
            />
            
            {/* Mensaje de error con botón para reintentar la carga */}
            {error && (
                <div className="mt-2 flex items-center text-red-500 text-xs">
                    <AlertCircle size={14} className="mr-1" />
                    <span>{t('error.loadingDepartamentos')}</span>
                    <button 
                        onClick={fetchData} 
                        className="ml-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                        aria-label="Retry"
                    >
                        <RefreshCw size={12} />
                    </button>
                </div>
            )}
        </div>
    );
}

// Validación de tipos de props para mejor documentación y desarrollo
DepartamentoMultiSelect.propTypes = {
    prevDepartamentoIds: PropTypes.array,
    fetchUrl: PropTypes.string.isRequired,
    className: PropTypes.string,
    onSelect: PropTypes.func,
    disabled: PropTypes.bool
};