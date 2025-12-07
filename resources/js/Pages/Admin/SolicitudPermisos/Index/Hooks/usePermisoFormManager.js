import { usePermisoForm } from './usePermisoForm';
import { useFileManager } from './useFileManager';
import { useFormValidation } from './useFormValidation';
import { usePermisoApi } from './usePermisoApi';
import { useState, useEffect } from 'react';

/**
 * Hook maestro que combina todos los hooks del formulario de permisos (versión admin)
 * Proporciona toda la funcionalidad necesaria para el formulario de manera unificada
 */
export function usePermisoFormManager(initialData = null) {
    // Estado para el modelo completo (con archivos cargados)
    const [fullModel, setFullModel] = useState(initialData);
    // Estado para controlar la carga de datos completos
    const [isLoadingCompleteData, setIsLoadingCompleteData] = useState(false);

    // Resetear fullModel cuando cambie initialData
    useEffect(() => {
        setFullModel(initialData);
    }, [initialData?.id]); // Solo cuando cambie el ID

    // Hook principal del formulario
    const {
        formData,
        dateRange,
        selectedPermiso,
        errors,
        isInitializing,
        isEditing,
        maxDurationMs,
        maxDurationDays,
        isSingleDay,
        shouldForceFullDay,
        canShowCheckbox,
        canShowTimeFields,
        resetForm,
        initializeFormForEdit,
        handleInputChange,
        handlePermisoSelect,
        handleDateRangeChange,
        validateForm,
        setErrors,
        setFormData
    } = usePermisoForm(initialData);

    // Hook para manejo de archivos
    const {
        fileToDelete,
        showDeleteFileDialog,
        isDeletingFile,
        initiateFileDelete,
        confirmDeleteFile,
        cancelFileDelete,
        addFilesToForm,
        removeFileFromForm
    } = useFileManager();

    // Hook para validaciones
    const {
        isFormValid,
        hasValidationErrors,
        validationErrors,
        dateValidation,
        timeValidation,
        durationValidation,
        hasUserInitiatedAction,
        touchedFields,
        markFieldAsTouched,
        markAllFieldsAsTouched,
        clearTouchedFields,
        resetUserInteraction
    } = useFormValidation(formData, selectedPermiso);

    // Hook para API
    const {
        isSubmitting,
        handleSubmit: apiHandleSubmit,
        getSolicitudDetails
    } = usePermisoApi();

    /**
     * Manejar adición de archivos - Siguiendo exactamente el patrón del usuario
     */
    const handleFilesAdd = (files) => {
        // Asegurar que siempre sea un array
        const filesArray = Array.isArray(files) ? files : (files ? [files] : []);
        
        // Actualizar directamente con la nueva lista completa de archivos (como en usuario)
        setFormData(prev => ({
            ...prev,
            files: filesArray
        }));
    };

    /**
     * Manejar eliminación de archivo nuevo
     */
    const handleFileRemove = (index) => {
        setFormData(prev => {
            const currentFiles = prev.files || [];
            const updatedFiles = currentFiles.filter((_, i) => i !== index);
            return {
                ...prev,
                files: updatedFiles
            };
        });
    };

    /**
     * Maneo del envío del formulario
     */
    const handleFormSubmit = async (onSuccess = null) => {
        // Marcar todos los campos como tocados para mostrar errores
        markAllFieldsAsTouched();
        
        // Validar antes de enviar
        const validatedData = validateForm();
        if (!validatedData) {
            return false;
        }

        try {
            const response = await apiHandleSubmit(
                validatedData, // Usar los datos validados
                isEditing,
                initialData?.id,
                onSuccess
            );
            
            return response;
        } catch (error) {
            console.error('Form submission failed:', error);
            return false;
        }
    };

    /**
     * Inicializar formulario para edición con detalles completos (incluyendo archivos)
     */
    const initializeForEdit = async (data) => {
        if (!data || !data.id) {
            console.error('initializeForEdit: data is invalid', data);
            return;
        }

        try {
            setIsLoadingCompleteData(true);
            // Obtener detalles completos incluyendo archivos
            const fullData = await getSolicitudDetails(data.id);
           
            
            // Actualizar el modelo completo
            setFullModel(fullData);
            
            // Inicializar con los datos completos
            initializeFormForEdit(fullData);
        } catch (error) {
            console.error('Error al cargar detalles completos:', error);
            // Fallback: usar los datos básicos si falla la carga de detalles
            setFullModel(data);
            initializeFormForEdit(data);
        } finally {
            setIsLoadingCompleteData(false);
        }
    };

    /**
     * Manejar eliminación de archivo existente con actualización de estado
     */
    const handleExistingFileDelete = (file) => {
        if (fullModel?.id) {
            initiateFileDelete(fullModel.id, file, (deletedFile) => {
                // Actualizar el modelo completo removiendo el archivo eliminado
                setFullModel(prev => {
                    if (!prev) {
                        return prev;
                    }
                    
                    const updatedFiles = prev.files.filter(f => {
                        // Estrategia de filtrado robusta:
                        // 1. Comparar por ID si existe y es válido
                        // 2. Fallback: comparar por hash si existe
                        // 3. Fallback final: comparar por nombre y tamaño
                        
                        const matchById = f.id && deletedFile.id && f.id === deletedFile.id;
                        const matchByHash = f.hash && deletedFile.hash && f.hash === deletedFile.hash;
                        const matchByNameSize = f.name === deletedFile.name && f.size === deletedFile.size;
                        
                        const shouldDelete = matchById || matchByHash || matchByNameSize;
                        const keep = !shouldDelete;
                        
                        return keep;
                    });
                    
                    const newState = {
                        ...prev,
                        files: updatedFiles
                    };
                    
                    return newState;
                });

                // Si el usuario no ha tocado específicamente los campos de fecha,
                // limpiar cualquier error de duración que pueda haberse mostrado
                // debido a la validación automática
                if (!touchedFields.has('fecha') && 
                    !touchedFields.has('fecha_inicio') && 
                    !touchedFields.has('fecha_fin')) {
                    // No hacer nada - el error no debería aparecer
                    // Este es más un safeguard para asegurar que el comportamiento sea correcto
                }
            });
        }
    };

    return {
        // Estado del formulario
        formData,
        dateRange,
        selectedPermiso,
        errors,
        isInitializing,
        setFormData,
        fullModel, // Modelo completo con archivos
        isLoadingCompleteData, // Nuevo estado de loading

        // Computed values
        isEditing,
        maxDurationMs,
        maxDurationDays,
        isSingleDay,
        shouldForceFullDay,
        canShowCheckbox,
        canShowTimeFields,

        // Validaciones
        isFormValid,
        hasValidationErrors,
        validationErrors,
        dateValidation,
        timeValidation,
        durationValidation,
        hasUserInitiatedAction,
        touchedFields,
        markFieldAsTouched,
        markAllFieldsAsTouched,
        clearTouchedFields,
        resetUserInteraction,

        // Manejo de archivos
        fileToDelete,
        showDeleteFileDialog,
        isDeletingFile,
        initiateFileDelete,
        confirmDeleteFile,
        cancelFileDelete,
        handleFilesAdd,
        handleFileRemove,
        handleExistingFileDelete, // Nuevo método

        // API
        isSubmitting,
        handleFormSubmit,

        // Acciones del formulario
        resetForm,
        initializeForEdit,
        handleInputChange,
        handlePermisoSelect,
        handleDateRangeChange,
        validateForm,
        setErrors
    };
}
