import { useContext, useEffect, createContext, useState, useMemo, useCallback } from "react";
import { defaultValues, useModelSchema } from "../../Schema/ModelSchema";
import { useForm } from "@inertiajs/react";
import formResource from "../Utils/formResource";
import useApiEndpoints from "../../Hooks/useApiEndpoints";
import { toast } from "sonner";
import { convertDateToUTC, getUserTimezone, convertJavaScriptDateToUTC } from "../Utils/dateHelpers";

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
 * @returns {JSX.Element} Proveedor de contexto con sus hijos
 */
const DialogDataContextProvider = ({
  children,
  model,
  open,
  onOpenChange,
  dataKey,
  onSaveData = null,
  modelAlias = "registro",

}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);

  // Estados de carga específicos
  const [isLoading, setIsLoading] = useState(false); // Para carga inicial de datos
  const [isSaving, setIsSaving] = useState(false);   // Para guardar formulario

  const endpoints = useApiEndpoints(model);
  const form = useForm(defaultValues);
  const modelSchema = useModelSchema();

  /**
   * Crea un Form Data basado en los datos del modelo antes de enviarlos a la API.
   *
   * Convierte las fechas a objetos Date y maneja otros ajustes necesarios.
   * @param {Object} data - Datos del modelo a transformar
   * @returns {Object} - Datos transformados listos para enviar
   */
  const createFormData = useCallback((data) => {
    // Transformar los datos del modelo según sea necesario
    const transformData = {
      ...data,
      photo: (data.photo && !(data.photo instanceof File || data.photo instanceof Blob))
        ? null
        : data.photo,
      // Agregar la zona horaria del usuario si hay fechas
      user_timezone: getUserTimezone(),
    }

    const formData = new FormData();

    Object.keys(transformData).forEach((key) => {
      const value = transformData[key];
      if (value === null || value === undefined) {
        return; // No agregar campos nulos o indefinidos
      } else {
        formData.append(key, transformData[key]);
      }
    });

    return formData;
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const response = await axios.get(endpoints.show);

        if (response.status === 200) {
          form.setData(formResource(response.data[dataKey]));
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

    if (model) {
      fetchData();
    } else {
      form.setData(defaultValues);
      setError(false);
      setIsLoading(false);
    }
  }, [model]);

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
    const formData = createFormData({ ...form.data });

    if (model) {
      formData.append('_method', 'PUT');
    }

    try {
      setIsSaving(true);
      setError(false);

      form.clearErrors();

      const response = (model)
        ? await axios.post(endpoints.update, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        : await axios.post(endpoints.store, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

      if (onSaveData) {
        onSaveData(response.data.user);
      }

      onOpenChange(false);
      form.clearErrors();

      toast.success(
        model
          ? `Registro ${modelAlias} actualizado con éxito`
          : `Registro ${modelAlias} creado con éxito`
      );
    } catch (err) {
      setError(true);
      console.log('err :>> ', err);

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
  }, [model, endpoints.update, endpoints.store, form, onSaveData, onOpenChange]);

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
    onSaveData,
    setError,
    onOpenChange,
    isProcessing,
    isLoading,
    isSaving,
    setIsProcessing,
    dataKey
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
