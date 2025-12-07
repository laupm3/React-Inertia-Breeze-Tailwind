import {
    useContext,
    createContext,
    useState,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { useDataHandler } from "./DataHandlerContext";

/**
 * @type {React.Context}
 */
const AdvanceDropdownContext = createContext(null);

/**
 * Proveedor de contexto para gestionar la selección en el dropdown avanzado
 *
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @param {string|number} props.defaultValue - Valor por defecto seleccionado
 * @param {Function} props.onChangeValue - Callback al cambiar selección. Recibe (id, objeto)
 * @param {Function} props.renderSelection - Función para renderizar la selección
 * @param {string} props.placeholder - Texto placeholder
 * @param {Function} props.getItemId - Función para obtener el ID de un elemento
 */
export const AdvanceDropdownContextProvider = ({
    children,
    defaultValue = null,
    onChangeValue = () => {},
    renderSelection = null,
    dropdownContent = null,
    placeholder = "Selecciona una opción",
    getItemId,
    handleResponse = () => {},
}) => {
    // Estado principal
    const [selection, setSelection] = useState({
        value: null, // El objeto seleccionado
        rowSelection: {}, // El estado de selección para la tabla
    });

    // Referencias para controlar el flujo de datos
    const isUserSelectionRef = useRef(false); // Indica si la selección fue hecha por el usuario
    const lastNotifiedIdRef = useRef(null); // Último ID notificado al padre
    const processingUpdateRef = useRef(false); // Evita actualizaciones concurrentes
    const defaultValueRef = useRef(defaultValue); // Valor inicial de defaultValue

    const { data } = useDataHandler();

    // Modificamos handleRowSelectionChange para marcar las selecciones de usuario
    const handleRowSelectionChange = useCallback(
        (newSelection) => {
            // Evitamos procesar si ya hay una actualización en curso
            if (processingUpdateRef.current) return false;

            processingUpdateRef.current = true;
            isUserSelectionRef.current = true; // Marcar como selección de usuario

            try {
                const finalSelection =
                    typeof newSelection === "function"
                        ? newSelection(selection.rowSelection)
                        : newSelection;

                const selectedId = Object.keys(finalSelection).find(
                    (id) => finalSelection[id]
                );

                // Verificar si se está seleccionando el mismo elemento que ya está seleccionado
                const isSameSelection =
                    selection.value &&
                    selectedId &&
                    String(getItemId(selection.value)) === String(selectedId);

                if (isSameSelection) {
                    // Si es el mismo elemento, establecer valor en null (deseleccionar)
                    setSelection({
                        value: null,
                        rowSelection: {},
                    });
                    return true; // Indicar selección exitosa
                }

                const newValue = selectedId
                    ? data.find(
                          (item) =>
                              String(getItemId(item)) === String(selectedId)
                      )
                    : null;
                // Devolver la selección al dropdown original
                handleResponse(newValue);

                // Comportamiento normal para una nueva selección
                setSelection({
                    value: newValue,
                    rowSelection: finalSelection,
                });

                return true; // Indicar selección exitosa
            } finally {
                // Garantizar que siempre liberamos el flag
                processingUpdateRef.current = false;
            }
        },
        [data, getItemId, selection.rowSelection, handleResponse]
    );

    // Efecto para inicializar/actualizar la selección por cambios de datos o defaultValue
    useEffect(() => {
        // Si no hay datos o estamos procesando otra actualización, salir
        if (!data || data.length === 0 || processingUpdateRef.current) return;

        // Si defaultValue no ha cambiado desde la última verificación, no hacemos nada
        if (defaultValueRef.current === defaultValue && selection.value) return;

        // Si no hay defaultValue, limpiamos la selección SOLO si no fue selección de usuario
        if (defaultValue === null || defaultValue === undefined) {
            if (!isUserSelectionRef.current) {
                setSelection({ value: null, rowSelection: {} });
            }
            return;
        }

        // Si ya tenemos una selección con el mismo ID, no hacemos nada
        if (
            selection.value &&
            String(getItemId(selection.value)) === String(defaultValue)
        ) {
            defaultValueRef.current = defaultValue; // Actualizar la referencia
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

            // Buscar elemento por ID
            const selectedRow = data.find(
                (item) => String(getItemId(item)) === String(defaultValue)
            );

            if (selectedRow) {
                const itemId = getItemId(selectedRow);
                setSelection({
                    value: selectedRow,
                    rowSelection: { [itemId]: true },
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

        // Caso 1: Hay un valor seleccionado
        if (selection.value) {
            const currentId = getItemId(selection.value);

            // Evitar notificar el mismo valor múltiples veces
            if (lastNotifiedIdRef.current === currentId) return;

            // Si fue selección de usuario, notificamos el cambio
            if (isUserSelectionRef.current) {
                lastNotifiedIdRef.current = currentId;
                // Siempre pasar tanto el ID como el objeto completo al callback
                onChangeValue(currentId, selection.value);
            }
        }
        // Caso 2: Se deseleccionó el valor (selection.value es null)
        else if (
            isUserSelectionRef.current &&
            lastNotifiedIdRef.current !== null
        ) {
            // Solo notificamos si había un valor previo notificado (para evitar notificar null múltiples veces)
            lastNotifiedIdRef.current = null;
            onChangeValue(null, null); // Comunicar al padre que se deseleccionó el elemento
        }
    }, [selection.value, onChangeValue, getItemId]);

    // Valores y funciones expuestas en el contexto
    const contextValue = {
        selection,
        setSelection,
        handleRowSelectionChange,
        renderSelection,
        dropdownContent,
        placeholder,
        getItemId,
        // Añadimos métodos de utilidad para casos avanzados
        resetSelection: useCallback(() => {
            isUserSelectionRef.current = false;
            setSelection({ value: null, rowSelection: {} });
        }, []),
        forceSelection: useCallback(
            (newValue) => {
                if (!newValue) return;

                processingUpdateRef.current = true;
                try {
                    const itemId = getItemId(newValue);
                    setSelection({
                        value: newValue,
                        rowSelection: { [itemId]: true },
                    });
                    lastNotifiedIdRef.current = itemId;
                } finally {
                    processingUpdateRef.current = false;
                }
            },
            [getItemId]
        ),
    };

    return (
        <AdvanceDropdownContext.Provider value={contextValue}>
            {children}
        </AdvanceDropdownContext.Provider>
    );
};

/**
 * Hook personalizado para acceder al contexto del dropdown avanzado
 *
 * @throws {Error} Si se usa fuera del AdvanceDropdownContextProvider
 * @returns {Object} Valores y funciones del contexto
 */
export function useAdvanceDropdown() {
    const context = useContext(AdvanceDropdownContext);
    if (!context) {
        throw new Error(
            "useAdvanceDropdown debe usarse dentro de AdvanceDropdownContextProvider"
        );
    }
    return context;
}
