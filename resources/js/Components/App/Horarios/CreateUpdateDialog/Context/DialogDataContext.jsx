import { useContext, useEffect, createContext, useState, useMemo, useCallback } from "react";
import { defaultValues, useModelSchema } from "../../Schema/ModelSchema";
import { useForm } from "@inertiajs/react";
import formResource from "../Utils/formResource";
import useApiEndpoints from "../../Hooks/useApiEndpoints";
import { toast } from "sonner";

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
  onOpenChange,
  dataKey,
  onSaveData = null,
  modelAlias = "registro",
  data,
  dataForUpdate,
  setDataForUpdate,
  onDelete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);

  // Estados de carga específicos
  const [isLoading, setIsLoading] = useState(false); // Para carga inicial de datos
  const [isSaving, setIsSaving] = useState(false);   // Para guardar formulario

  const endpoints = useApiEndpoints(model);
  const form = useForm(defaultValues);
  const formNewHorarios = useForm([])
  const modelSchema = useModelSchema();
  const [contratos, setContratos] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    formNewHorarios.setData([]);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Ejecuta múltiples GET en paralelo usando Promise.all
        const response = await axios.post(
          route("api.v1.admin.horarios.bulk-show", { horarios: model })
        );

        // Pasa todo el array a formResource para convertirlo (ya modificaste esa función)
        form.setData(formResource(response.data.horarios));
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    form.clearErrors();

    if (model && Array.isArray(model) && model.length > 0) {
      fetchData();
    } else {
      form.setData(defaultValues);
      setError(false);
      setIsLoading(false);
    }
    return () => { };
  }, [model]);

  useEffect(() => {
    if (data.length === 0) return;

    const fetchContratos = async () => {
      if (!data || !Array.isArray(data)) return;

      const empleadosFormateados = data.map(emp => ({
        empleado_id: emp.empleado_id,
        fechas: emp.fechas.map(f => f.date),
      }));

      try {
        const response = await axios.post(
          route("api.v1.admin.empleados.available-contracts"),
          { empleados: empleadosFormateados }
        );

        setContratos(response.data);
      } catch (error) {
        console.error("Error al cargar contratos disponibles:", error);
        toast.error("No se pudieron cargar los contratos disponibles.");
      }
    };

    fetchContratos();
  }, [data]);

  /**
   * Actualiza un campo específico del formulario manteniendo el resto de valores
   * @param {string|object} key - Nombre del campo a actualizar o objeto con varios campos
   * @param {any} value - Nuevo valor (solo se usa si key es string)
   */
  const updateForm = useCallback((key, value) => {
    if (typeof key === 'object' && value === undefined) {
      form.setData(prevData => {
        if (Array.isArray(prevData)) {
          const toUpdate = key.filter(k => k.id != null);
          const toAdd = key.filter(k => k.id == null);

          const updated = prevData.map(item => {
            const match = toUpdate.find(k => k.id === item.id);
            return match ? { ...item, ...match } : item;
          });

          return [...updated, ...toAdd]; // ← añade los nuevos al final
        } else {
          return { ...prevData, ...key };
        }
      });
      return;
    }

    console.warn('updateForm: actualización por clave/valor no válida para arrays');
  }, [form]);

  // Nueva función para actualizar el formulario de nuevos horarios
  const updateFormNewHorarios = useCallback((key, value) => {
    if (typeof key === 'function') {
      formNewHorarios.setData(prev => key(prev));
      return;
    }

    if (typeof key === 'object' && value === undefined) {
      formNewHorarios.setData(prevData => {
        if (Array.isArray(prevData)) {
          const toUpdate = key.filter(k => k.id != null);
          const toAdd = key.filter(k => k.id == null);

          const updated = prevData.map(item => {
            const match = toUpdate.find(k => k.id === item.id);
            return match ? { ...item, ...match } : item;
          });

          return [...updated, ...toAdd];
        } else {
          return { ...prevData, ...key };
        }
      });
      return;
    }

    // puedes extender aquí para key/string, si lo necesitas
  }, [formNewHorarios]);

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

  // Validación para nuevos horarios
  const handleValidationNewHorarios = useCallback(() => {
    const validation = modelSchema.safeParse(formNewHorarios.data);

    formNewHorarios.clearErrors();


    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      Object.keys(errors).forEach((key) => {
        formNewHorarios.setError(key, errors[key][0]);
      });
    }

    return validation.success;
  }, [formNewHorarios, modelSchema]);

  /**
   * Maneja el envío del formulario, validando los datos y enviándolos a la API
   */
  const handleSubmit = useCallback(async () => {
    const hasEditData = Array.isArray(form.data) && form.data.length > 0;
    const hasCreateData = Array.isArray(formNewHorarios.data) && formNewHorarios.data.length > 0;

    let isEditValid = false;
    let isCreateValid = false;

    setIsSaving(true);
    setError(false);

    // Acumulador de horarios finales actualizados o creados
    const resultHorarios = { updated: [], created: [] };

    try {
      // Validar y enviar edición
      if (hasEditData) {
        isEditValid = handleValidation();
        if (isEditValid) {
          const res = await axios.put(endpoints.update, { horarios: form.data });
          if (res.data?.horarios) resultHorarios.updated.push(...res.data.horarios);
        } else {
          console.warn(" Edición inválida, no se envía.");
        }
      }

      // Validar y enviar creación
      if (hasCreateData) {
        isCreateValid = handleValidationNewHorarios();
        if (isCreateValid) {
          const res = await axios.post(endpoints.store, { horarios: formNewHorarios.data });
          if (res.data?.horarios) resultHorarios.created.push(...res.data.horarios);
        } else {
          console.warn(" Creación inválida, no se envía.");
        }
      }

      if (isEditValid || isCreateValid) {
        toast.success("Horarios actualizados y/o creados con éxito.");
        onOpenChange(false);
        form.clearErrors();
        formNewHorarios.clearErrors();

        if (onSaveData) onSaveData();

        // Pasar solo los horarios válidos recibidos
        setDataForUpdate({ ...dataForUpdate, ...resultHorarios });
      } else {
        console.warn(" Ningún formulario fue válido. No se hizo ninguna petición.");
      }
    } catch (err) {
      setError(true);
      if (err.response?.data?.errors) {
        const { errors } = err.response.data;
        Object.keys(errors).forEach((key) => {
          form.setError(key, errors[key][0]);
          formNewHorarios.setError(key, errors[key][0]);
        });
      }
      toast.error("Error al guardar los horarios.");
    } finally {
      setIsSaving(false);
    }
  }, [
    form,
    formNewHorarios,
    endpoints.update,
    endpoints.store,
    handleValidation,
    handleValidationNewHorarios,
    onOpenChange,
    onSaveData,
    setDataForUpdate,
  ]);

  // Memoizar el valor del contexto para evitar renderizados innecesarios
  const contextValue = useMemo(() => ({
    modelAlias,
    model,
    error,
    form,
    formNewHorarios,
    data,
    contratos,
    updateForm,
    handleSubmit,
    setError,
    onOpenChange,
    isProcessing,
    isLoading,
    isSaving,
    setIsProcessing,
    updateFormNewHorarios,
    onDelete
  }), [
    modelAlias,
    model,
    error,
    form,
    formNewHorarios,
    data,
    contratos,
    updateForm,
    handleSubmit,
    onOpenChange,
    isProcessing,
    isLoading,
    isSaving,
    updateFormNewHorarios,
    onDelete
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