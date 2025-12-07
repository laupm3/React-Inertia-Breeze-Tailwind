import axios from "axios";
import { useContext, useEffect, createContext, useState, useMemo, useCallback, useRef } from "react";
import { defaultValues, useModelSchema } from "../../Schema/ModelSchema";
import { useForm } from "@inertiajs/react";
import formResource from "../Utils/formResource";
import useApiEndpoints from "../../Hooks/useApiEndpoints";
import { toast } from "sonner";
import { convertDateToUTC } from "@/Components/App/User/CreateUpdateDialog/Utils/dateHelpers";
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
  const [empleado, setEmpleado] = useState(null);
  const [error, setError] = useState(false);
  const [initialAnexos, setInitialAnexos] = useState([]);
  const [selectedAnexo, setSelectedAnexo] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Estados de carga específicos
  const [isLoading, setIsLoading] = useState(false); // Para carga inicial de datos
  const [isSaving, setIsSaving] = useState(false);   // Para guardar formulario

  const endpoints = useApiEndpoints(model);
  const form = useForm(defaultValues);
  const modelSchema = useModelSchema();
  
  // Usar el contexto global para obtener datos del contrato
  const { getContratoDetail, clearContratoCache } = useDataHandler();

  // Ref para evitar múltiples llamadas a la API
  const hasFetchedRef = useRef(false);

  // Cargar datos iniciales solo cuando el diálogo esté abierto y tenga un model válido
  useEffect(() => {
    // Solo cargar datos si el diálogo está abierto y tenemos un model válido
    if (!open || !model) {
      // Resetear estados cuando el diálogo se cierra
      if (!open) {
        setContractData(null);
        setEmpleado(null);
        setSelectedAnexo(null);
        setInitialAnexos([]);
        setError(false);
        setIsLoading(false);
        hasFetchedRef.current = false;
      }
      return;
    }

    // Evitar múltiples llamadas para el mismo contrato
    if (hasFetchedRef.current) {
      return;
    }

    const fetchData = async () => {
      try {
        hasFetchedRef.current = true;
        setIsLoading(true);
        setError(false);

        // Usar el caché global del DataHandlerContext
        const responseData = await getContratoDetail(model);
        
        if (responseData) {
          const fetchedAnexos = responseData.anexos || [];
          const formInitialData = formResource(responseData);

          // Procesar los anexos también con formResource para que tengan las fechas correctas
          // Los anexos heredan campos del contrato padre (responseData)
          const processedAnexos = fetchedAnexos.map(anexo => {
            const anexoProcessed = formResource(anexo);
            // Heredar campos del contrato si no están en el anexo
            return {
              ...anexoProcessed,
              n_expediente: anexoProcessed.n_expediente || formInitialData.n_expediente,
              tipo_contrato_id: anexoProcessed.tipo_contrato_id || formInitialData.tipo_contrato_id,
              asignacion_id: anexoProcessed.asignacion_id || formInitialData.asignacion_id,
              departamento_id: anexoProcessed.departamento_id || formInitialData.departamento_id,
              empresa_id: anexoProcessed.empresa_id || formInitialData.empresa_id,
              centro_id: anexoProcessed.centro_id || formInitialData.centro_id,
              empleado_id: anexoProcessed.empleado_id || formInitialData.empleado_id,
            };
          });

          const empleado = responseData.empleado;
          let selectedAnexo = null;
          
          if (processedAnexos.length > 0) {
            const latestAnexo = processedAnexos.sort((a, b) => {
              const dateA = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(0);
              const dateB = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(0);
              return dateB - dateA;
            })[0];
            selectedAnexo = latestAnexo;
          }

          const formData = {
            ...formInitialData,
            anexos: processedAnexos,
          };

          setContractData(formInitialData);
          form.setData(formData);
          setInitialAnexos(processedAnexos);
          setEmpleado(empleado);
          setSelectedAnexo(selectedAnexo);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos del contrato:', error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    form.clearErrors();
    fetchData();
    
    return () => { };
  }, [open, model]); // Solo depender de open y model, no de getContratoDetail

  const addAnexo = useCallback(async (anexoData) => {
    if (!contractData?.id) throw new Error("ID del contrato no encontrado");
    try {
      // Convertir fechas a UTC antes de enviar
      const sanitizedData = { ...anexoData };
      if (sanitizedData.fecha_inicio) {
        sanitizedData.fecha_inicio = convertDateToUTC(sanitizedData.fecha_inicio);
      }
      if (sanitizedData.fecha_fin) {
        sanitizedData.fecha_fin = convertDateToUTC(sanitizedData.fecha_fin);
      }

      // Convertir jornada_id a número si no está vacío
      if (sanitizedData.jornada_id && sanitizedData.jornada_id !== '') {
        sanitizedData.jornada_id = Number(sanitizedData.jornada_id);
      }

      // Filtrar campos con valores null o undefined
      const cleanedData = Object.fromEntries(
        Object.entries(sanitizedData).filter(([key, value]) => value !== null && value !== undefined && value !== '')
      );

      await axios.post(route('api.v1.admin.contratos.anexos.store', { contrato: contractData.id }), cleanedData);
      toast.success('Anexo creado con éxito');
      // Limpiar cache después de crear exitosamente
      clearContratoCache(model);
    } catch (error) {


      // Mostrar errores específicos de validación si están disponibles
      if (error.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');

        toast.error(`Errores de validación:\n${validationErrors}`);
      } else {
        toast.error('Error al crear un anexo');
      }

      throw error; // Propagar el error para detener el proceso principal
    }
  }, [contractData, model, clearContratoCache]);

  const updateAnexo = useCallback(async (anexoData) => {
    if (!contractData?.id) throw new Error("ID del contrato no encontrado");
    try {
      // Convertir fechas a UTC antes de enviar
      const sanitizedData = { ...anexoData };
      if (sanitizedData.fecha_inicio) {
        sanitizedData.fecha_inicio = convertDateToUTC(sanitizedData.fecha_inicio);
      }
      if (sanitizedData.fecha_fin) {
        sanitizedData.fecha_fin = convertDateToUTC(sanitizedData.fecha_fin);
      }

      await axios.put(route('api.v1.admin.contratos.anexos.update', { contrato: contractData.id, anexo: sanitizedData.id }), sanitizedData);
      toast.success('Anexo actualizado con éxito');
      // Limpiar cache después de actualizar exitosamente
      clearContratoCache(model);
    } catch (error) {
      toast.error('Error al actualizar un anexo');
      throw error;
    }
  }, [contractData, model, clearContratoCache]);

  const deleteAnexo = useCallback(async (anexoId) => {
    if (!contractData?.id) throw new Error("ID del contrato no encontrado");
    try {
      await axios.delete(route('api.v1.admin.contratos.anexos.destroy', { contrato: contractData.id, anexo: anexoId }));
      toast.success('Anexo eliminado con éxito');
      // Limpiar cache después de eliminar exitosamente
      clearContratoCache(model);
    } catch (error) {
      toast.error('Error al eliminar un anexo');
      throw error;
    }
  }, [contractData, model, clearContratoCache]);

  /**
   * Actualiza un campo específico del formulario manteniendo el resto de valores
   * @param {string|object} key - Nombre del campo a actualizar o objeto con varios campos
   * @param {any} value - Nuevo valor (solo se usa si key es string)
   */
  const updateForm = useCallback((key, value) => {
    if (!selectedAnexo) return;
    const updates = typeof key === 'object' ? key : { [key]: value };

    // 1. Update the selectedAnexo state
    const updatedSelectedAnexo = { ...selectedAnexo, ...updates };
    setSelectedAnexo(updatedSelectedAnexo);

    // 2. Update the anexo in the form's 'anexos' array
    const anexoIndex = form.data.anexos.findIndex(a => a.id === selectedAnexo.id);
    if (anexoIndex > -1) {
      const updatedAnexos = [...form.data.anexos];
      updatedAnexos[anexoIndex] = updatedSelectedAnexo;
      form.setData('anexos', updatedAnexos);
    }
  }, [form, selectedAnexo, setSelectedAnexo]);

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
  const handleSubmit = useCallback(async () => {
    const isFormSuccess = handleValidation();

    if (!isFormSuccess) {
      return;
    }

    try {
      setIsSaving(true);
      setError(false);
      form.clearErrors();

      const currentAnexos = form.data.anexos || [];
      let hasNewAnexos = false; // Para controlar si se crearon nuevos anexos

      // Detectar añadidos y actualizaciones
      for (const anexo of currentAnexos) {
        const isNew = typeof anexo.id === 'string' && anexo.id.startsWith('new_');
        if (isNew) {
          hasNewAnexos = true; // Marcar que hay nuevos anexos
          // Validar campos obligatorios específicamente para anexos
          const requiredFields = {
            'fecha_inicio': anexo.fecha_inicio,
            'n_expediente': anexo.n_expediente || contractData.n_expediente,
            'tipo_contrato_id': anexo.tipo_contrato_id || contractData.tipo_contrato_id,
            'departamento_id': anexo.departamento_id || contractData.departamento_id,
            'asignacion_id': anexo.asignacion_id || contractData.asignacion_id,
            'empresa_id': anexo.empresa_id || contractData.empresa_id,
            'centro_id': anexo.centro_id || contractData.centro_id,
            'empleado_id': anexo.empleado_id || contractData.empleado_id
          };

          // Verificar campos obligatorios
          const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value || value === '')
            .map(([key]) => key);

          if (missingFields.length > 0) {
            toast.error(`Faltan campos obligatorios: ${missingFields.join(', ')}`);
            throw new Error(`Campos obligatorios faltantes: ${missingFields.join(', ')}`);
          }

          // Asegurar que el anexo nuevo tiene todos los campos necesarios
          const anexoToCreate = {
            n_expediente: anexo.n_expediente || contractData.n_expediente,
            tipo_contrato_id: anexo.tipo_contrato_id || contractData.tipo_contrato_id,
            departamento_id: anexo.departamento_id || contractData.departamento_id,
            asignacion_id: anexo.asignacion_id || contractData.asignacion_id,
            empresa_id: anexo.empresa_id || contractData.empresa_id,
            centro_id: anexo.centro_id || contractData.centro_id,
            empleado_id: anexo.empleado_id || contractData.empleado_id,
            jornada_id: anexo.jornada_id,
            fecha_inicio: anexo.fecha_inicio,
            fecha_fin: anexo.fecha_fin,
          };

          await addAnexo(anexoToCreate);
        } else {
          const originalAnexo = initialAnexos.find(a => a.id === anexo.id);
          if (originalAnexo && JSON.stringify(originalAnexo) !== JSON.stringify(anexo)) {
            await updateAnexo(anexo);
          }
        }
      }

      if (onSaveData) {
        // Usar el caché global para obtener los datos actualizados
        const updatedData = await getContratoDetail(model);
        if (updatedData) {
          onSaveData(updatedData);
        }
      }

      // Solo cerrar el diálogo si se crearon nuevos anexos o si estamos editando el contrato principal
      // No cerrar si solo se está editando un anexo existente
      if (hasNewAnexos || !selectedAnexo || (selectedAnexo && typeof selectedAnexo.id === 'string' && selectedAnexo.id.startsWith('new_'))) {
        onOpenChange(false);
        toast.success(`Contrato y anexos actualizados con éxito`);
        // Resetear el modo de edición cuando se cierra el diálogo
        setIsEditingMode(false);
      } else {
        // Solo mostrar mensaje de éxito sin cerrar el diálogo
        toast.success(`Anexo actualizado con éxito`);
        // Resetear el modo de edición después de actualizar exitosamente
        setIsEditingMode(false);
      }

    } catch (err) {
      setError(true);
      toast.error(`Error al actualizar el ${modelAlias}`);
    } finally {
      setIsSaving(false);
    }
  }, [
    model,
    form.data.anexos,
    initialAnexos,
    onSaveData,
    onOpenChange,
    addAnexo,
    updateAnexo,
    deleteAnexo,
    modelAlias,
    handleValidation,
    selectedAnexo,
    getContratoDetail
  ]);

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
    isLoading,
    isSaving,
    empleado,
    empleado_id: form.data.empleado_id,
    deleteAnexo,
    selectedAnexo,
    setSelectedAnexo,
    contractData,
    isEditingMode,
    setIsEditingMode,
  }), [
    modelAlias,
    model,
    error,
    form,
    updateForm,
    handleSubmit,
    onOpenChange,
    isLoading,
    isSaving,
    empleado,
    deleteAnexo,
    selectedAnexo,
    contractData,
    isEditingMode,
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