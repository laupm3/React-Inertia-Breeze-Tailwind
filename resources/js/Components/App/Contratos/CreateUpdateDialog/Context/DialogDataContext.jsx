import { useContext, useEffect, createContext, useState, useMemo, useCallback } from "react";
import { defaultValues, useModelSchema } from "../../Schema/ModelSchema";
import { useForm } from "@inertiajs/react";
import formResource from "../Utils/formResource";
import useApiEndpoints from "../../Hooks/useApiEndpoints";
import { toast } from "sonner";
import { useDataHandler } from "@/Pages/Admin/Contratos/Index/Context/DataHandlerContext";

/**
 * Contexto para manejar el el dialog y los formularios
 * @type {React.Context}
 */
const DialogDataContext = createContext(null);

/**
 * Proveedor de contexto para el diálogo.
 * 
 * Gestiona el estado del formulario, las operaciones de API y los estados de carga.
 * Este componente es responsable de la comunicación con el backend y proporciona
 * los datos y funcionalidades necesarias a los componentes hijos.
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Object|null} props.model - Modelo para edición, null para creación
 * @param {Function} props.onOpenChange - Función para cambiar el estado de visibilidad del diálogo
 * @param {Function|null} props.onSaveData - Callback que se ejecuta después de guardar éxitosamente
 * @param {React.ReactNode} props.children - Componentes hijos que consumirán el contexto
 * @param {string} [props.dataKey] - Clave para acceder a los datos en la respuesta de la API
 * @param {string} [props.modelAlias="registro"] - Alias del modelo para mostrar en el diálogo
 * @param {boolean} [props.open] - Estado de visibilidad del diálogo
 * @returns {JSX.Element} Proveedor de contexto con sus hijos
 */
const DialogDataContextProvider = ({
  children,
  model,
  onOpenChange,
  dataKey,
  onSaveData = null,
  modelAlias = "registro",
  open = false,

}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);

  // Estados de carga específicos
  const [isLoading, setIsLoading] = useState(false); // Para carga inicial de datos
  const [isSaving, setIsSaving] = useState(false);   // Para guardar formulario

  const endpoints = useApiEndpoints(model);
  const form = useForm(defaultValues);
  const modelSchema = useModelSchema();
  
  // Usar el contexto global para obtener datos del contrato
  const { getContratoDetail, clearContratoCache } = useDataHandler();

  // Cargar datos iniciales solo cuando el diálogo esté abierto
  useEffect(() => {
    // Solo cargar datos si el diálogo está abierto y tenemos un model válido
    if (!open || !model) {
      // Resetear estados cuando el diálogo se cierra
      if (!open) {
        setError(false);
        setIsLoading(false);
      }
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Usar el caché global del DataHandlerContext
        const responseData = await getContratoDetail(model);

        if (responseData) {
          // Transformar datos si es necesario antes de setear en el form
          form.setData(
            formResource(responseData)
          );
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    form.clearErrors();
    fetchData();
    
    return () => { };
  }, [open, model]); // Solo depender de open y model

  /**
   * Actualiza un campo específico del formulario manteniendo el resto de valores
   * @param {string|object} key - Nombre del campo a actualizar o objeto con varios campos
   * @param {any} value - Nuevo valor (solo se usa si key es string)
   */
  const updateForm = useCallback((key, value) => {
    // Si se proporciona un objeto, actualizar múltiples campos
    if (typeof key === 'object' && value === undefined) {
      form.setData(prevData => ({
        ...prevData,
        ...key
      }));
      return;
    }

    // Si se proporciona una clave y valor, actualizar un solo campo
    form.setData(prevData => ({
      ...prevData,
      [key]: value
    }));
  }, [form]);

  /**
   * Valida el formulario usando el esquema definido - procesa los errores
   * 
   * @returns {boolean} - El resultado de la validación
   */
  const handleValidation = useCallback(() => {
    const validation = modelSchema.safeParse(form.data);

    form.clearErrors();

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      Object.keys(errors).forEach((key) => {
        form.setError(key, errors[key][0]);
      });
    }

    return validation.success;
  }, [form, modelSchema]);

  /**
   * Ejecuta la petición HTTP para crear o actualizar el registro
   */
  const handleRequest = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(false);

      form.clearErrors();

      // 🔥 CONVERTIR form.data a FormData
      const formData = new FormData();
      Object.entries(form.data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value ?? ''); // si hay null o undefined
        }
      });

      // 👇 Importante: si es PUT, Laravel necesita saberlo con "_method"
      if (model) {
        formData.append('_method', 'PUT');
      }

      const response = (model)
        ? await axios.post(endpoints.update, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        : await axios.post(endpoints.store, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

      if (onSaveData) {
        // Si es una actualización, usar el caché global para obtener los datos actualizados
        if (model) {
          const updatedData = await getContratoDetail(model);
          if (updatedData) {
            onSaveData(updatedData);
          }
        } else {
          onSaveData(response.data[dataKey]);
        }
      }

      onOpenChange(false);
      form.clearErrors();

      // Limpiar caché después de actualizar exitosamente
      if (model) {
        clearContratoCache(model);
      }

      toast.success(
        model
          ? `Registro ${modelAlias} actualizado con éxito`
          : `Registro ${modelAlias} creado con éxito`
      );
    } catch (err) {
      setError(true);

      if (err.response?.data?.errors) {
        const { errors } = err.response.data;
        Object.keys(errors).forEach((key) => {
          form.setError(key, errors[key][0]);
        });
      }

      toast.error(
        model
          ? `Error al actualizar el ${modelAlias}`
          : `Error al crear el ${modelAlias}`
      );
    } finally {
      setIsSaving(false);
    }
  }, [model, endpoints.update, endpoints.store, form, onSaveData, onOpenChange, getContratoDetail, clearContratoCache, dataKey, modelAlias]);

  /**
   * Maneja el envío del formulario, validando los datos y enviándolos a la API
   */
  const handleSubmit = useCallback(() => {
    const isFormSuccess = handleValidation();

    if (!isFormSuccess) {
      return;
    }

    handleRequest();
  }, [handleValidation, handleRequest]);

  // Memoizar el valor del contexto para evitar renderizados innecesarios
  const contextValue = useMemo(() => ({
    modelAlias,
    model,
    error,
    form,
    updateForm,
    handleSubmit,
    setError,
    onOpenChange,
    isProcessing,
    isLoading,
    isSaving,
    setIsProcessing,
  }), [
    modelAlias,
    model,
    error,
    form,
    updateForm,
    handleSubmit,
    onOpenChange,
    isProcessing,
    isLoading,
    isSaving
  ]);

  return (
    <DialogDataContext.Provider value={contextValue}>
      {children}
    </DialogDataContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto
 * @throws {Error} Si se usa fuera del DialogDataContextProvider
 * @returns {Object} Valores y funciones del contexto
 */
function useDialogData() {
  const context = useContext(DialogDataContext);
  if (!context) {
    throw new Error('useDialogData debe usarse dentro de DialogDataContextProvider');
  }
  return context;
}

export { DialogDataContextProvider, useDialogData };