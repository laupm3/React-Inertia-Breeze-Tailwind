import { useContext, createContext, useState, useCallback, useEffect, useRef } from "react";
import { useDataHandler } from "./DataHandlerContext";

/**
 * @type {React.Context}
 */
const AdvanceMultiselectContext = createContext(null);

/**
 * Proveedor de contexto para gestionar la selección en el dropdown avanzado
 */
export const AdvanceMultiselectContextProvider = ({
    children,
    defaultValue = null,
    onChangeValue = () => { },
    renderSelection = null,
    placeholder = "Selecciona opciones",
    getItemId
}) => {
    // Estado principal
    const [selection, setSelection] = useState({
        value: [],        // Array de objetos seleccionados (para multiselección)
        rowSelection: {}  // El estado de selección para la tabla
    });

    // Referencias para controlar el flujo de datos
    const isUserSelectionRef = useRef(false);        // Indica si la selección fue hecha por el usuario
    const lastNotifiedIdRef = useRef(null);          // Último ID notificado al padre
    const processingUpdateRef = useRef(false);       // Evita actualizaciones concurrentes
    const defaultValueRef = useRef(defaultValue);    // Valor inicial de defaultValue

    const { data } = useDataHandler();

    // Modificamos handleRowSelectionChange para manejar multiselección
    const handleRowSelectionChange = useCallback((newSelection) => {
        // Evitamos procesar si ya hay una actualización en curso
        if (processingUpdateRef.current) return false;

        processingUpdateRef.current = true;
        isUserSelectionRef.current = true; // Marcar como selección de usuario

        try {
            const finalSelection = typeof newSelection === "function"
                ? newSelection(selection.rowSelection)
                : newSelection;

            // Obtener todos los IDs seleccionados
            const selectedIds = Object.keys(finalSelection).filter(id => finalSelection[id]);
            
            // Encontrar los objetos correspondientes
            const selectedObjects = selectedIds
                .map(id => data.find(item => String(getItemId(item)) === String(id)))
                .filter(Boolean); // Filtrar nulls/undefineds

            setSelection({
                value: selectedObjects,
                rowSelection: finalSelection
            });

            return true; // Indicar selección exitosa
        } finally {
            // Garantizar que siempre liberamos el flag
            processingUpdateRef.current = false;
        }
    }, [data, getItemId, selection.rowSelection]);

    // Efecto para inicializar/actualizar la selección por cambios de datos o defaultValue
    useEffect(() => {
        // Si no hay datos o estamos procesando otra actualización, salir
        if (!data || data.length === 0 || processingUpdateRef.current) return;

        // Si defaultValue no ha cambiado desde la última verificación, no hacemos nada
        if (defaultValueRef.current === defaultValue && selection.value) return;

        // Si no hay defaultValue, limpiamos la selección SOLO si no fue selección de usuario
        if (defaultValue === null || defaultValue === undefined) {
            if (!isUserSelectionRef.current) {
                setSelection({ value: [], rowSelection: {} });
            }
            return;
        }

        // Para multiselección, defaultValue puede ser un array de IDs
        const defaultValues = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
        
        // Si ya tenemos los mismos elementos seleccionados, no hacemos nada
        const currentIds = selection.value.map(item => String(getItemId(item))).sort();
        const defaultIds = defaultValues.map(val => String(val)).sort();
        
        if (currentIds.length === defaultIds.length && 
            currentIds.every((id, index) => id === defaultIds[index])) {
            defaultValueRef.current = defaultValue;
            return;
        }

        // Evitar procesamiento concurrente
        processingUpdateRef.current = true;

        try {
            // Resetear el flag de selección de usuario si defaultValue cambia
            if (defaultValueRef.current !== defaultValue) {
                isUserSelectionRef.current = false;
            }

            // Actualizar referencia
            defaultValueRef.current = defaultValue;

            // Buscar elementos por IDs
            const selectedRows = defaultValues
                .map(id => data.find(item => String(getItemId(item)) === String(id)))
                .filter(Boolean); // Filtrar nulls/undefineds

            if (selectedRows.length > 0) {
                const rowSelection = {};
                selectedRows.forEach(row => {
                    const itemId = getItemId(row);
                    rowSelection[itemId] = true;
                });
                
                setSelection({
                    value: selectedRows,
                    rowSelection
                });
            }
        } finally {
            processingUpdateRef.current = false;
        }
    }, [data, defaultValue, getItemId]);

    // Efecto para notificar cambios al componente padre
    useEffect(() => {
        // No notificamos si estamos en medio de una actualización
        if (processingUpdateRef.current) return;

        // Caso 1: Hay valores seleccionados
        if (selection.value && selection.value.length > 0) {
            const currentIds = selection.value.map(item => getItemId(item));

            // Si fue selección de usuario, notificamos el cambio
            if (isUserSelectionRef.current) {
                lastNotifiedIdRef.current = currentIds.join(','); // Para tracking
                onChangeValue(currentIds);
            }
        }
        // Caso 2: Se deseleccionaron todos los valores
        else if (isUserSelectionRef.current && lastNotifiedIdRef.current !== null) {
            lastNotifiedIdRef.current = null;
            onChangeValue([]); // Comunicar al padre que se deseleccionaron todos
        }
    }, [selection.value, onChangeValue, getItemId]);

    // Valores y funciones expuestas en el contexto
    const contextValue = {
        selection,
        setSelection,
        handleRowSelectionChange,
        renderSelection,
        placeholder,
        getItemId,
        // Añadimos métodos de utilidad para casos avanzados
        resetSelection: useCallback(() => {
            isUserSelectionRef.current = false;
            setSelection({ value: [], rowSelection: {} });
        }, []),
        forceSelection: useCallback((newValues) => {
            if (!newValues) return;

            const values = Array.isArray(newValues) ? newValues : [newValues];
            
            processingUpdateRef.current = true;
            try {
                const rowSelection = {};
                values.forEach(value => {
                    const itemId = getItemId(value);
                    rowSelection[itemId] = true;
                });
                
                setSelection({
                    value: values,
                    rowSelection
                });
                lastNotifiedIdRef.current = values.map(v => getItemId(v)).join(',');
            } finally {
                processingUpdateRef.current = false;
            }
        }, [getItemId])
    };

    return (
        <AdvanceMultiselectContext.Provider value={contextValue}>
            {children}
        </AdvanceMultiselectContext.Provider>
    );
};

/**
 * Hook personalizado para acceder al contexto del dropdown avanzado
 * 
 * @throws {Error} Si se usa fuera del AdvanceMultiselectContextProvider
 * @returns {Object} Valores y funciones del contexto
 */
export function useAdvanceMultiselect() {
    const context = useContext(AdvanceMultiselectContext);
    if (!context) {
        throw new Error('useAdvanceMultiselect debe usarse dentro de AdvanceMultiselectContextProvider');
    }
    return context;
}