import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { Label } from "@/Components/ui/label";
import EmpleadoAdvanceDropdown from "@/Components/App/Empleado/AdvanceDropdown/AdvanceDropdown";
import { usePermisoFormManager } from '@/Pages/Admin/Vacaciones/Index/Hooks/usePermisoFormManager';

// Importar componentes del lado del usuario (reutilizando la lógica existente)
import {
    PermisoSelectionSection,
    DateTimeSection,
    AdditionalDetailsSection
} from '@/Pages/User/SolicitudPermisos/Components/FormSections';
import { FileUploadSection } from '@/Pages/User/SolicitudPermisos/Components/FileUploadSection';

/**
 * FormFields para Vacaciones - Sin selector de tipo de permiso, siempre es "Vacaciones"
 */
const FormFields = forwardRef(({ form, updateForm, model, isLoading, error, onStateChange }, ref) => {
    const isEditing = Boolean(model);
    
    // Usar el hook principal del admin
    const {
        // Estado del formulario
        formData,
        dateRange,
        selectedPermiso,
        errors: hookErrors,
        isInitializing,

        // Computed values
        maxDurationMs,
        maxDurationDays,
        canShowCheckbox,
        canShowTimeFields,
        shouldForceFullDay,

        // Validaciones
        isFormValid,
        hasValidationErrors,
        validationErrors,
        markFieldAsTouched,

        // Manejo de archivos
        fileToDelete,
        showDeleteFileDialog,
        isDeletingFile,
        initiateFileDelete,
        confirmDeleteFile,
        cancelFileDelete,

        // Estado de API
        isSubmitting,

        // Acciones del formulario
        initializeForEdit,
        handleInputChange,
        handlePermisoSelect,
        handleDateRangeChange,
        validateForm,

        // Acciones de archivos
        handleFilesAdd,
        handleFileRemove,
        handleExistingFileDelete, // Ahora viene del hook

        // Acciones de API
        handleFormSubmit,

        // Modelo completo (con archivos)
        fullModel,
        isLoadingCompleteData // Nuevo estado de loading
    } = usePermisoFormManager(model);

    // Exponer métodos y estados a través de la ref (memoized)
    useImperativeHandle(ref, () => ({
        handleFormSubmit,
        isFormValid,
        isSubmitting,
        formData,
        validateForm
    }), [handleFormSubmit, isFormValid, isSubmitting, formData, validateForm]);

    // Notificar al padre cuando cambien los estados importantes
    // OPTIMIZACIÓN: Usar useCallback para estabilizar onStateChange y evitar bucles
    const stableOnStateChange = React.useCallback(onStateChange, []);
    
    useEffect(() => {
        if (stableOnStateChange) {
            stableOnStateChange({
                isFormValid,
                isSubmitting,
                hasValidationErrors,
                validationErrors
            });
        }
    }, [isFormValid, isSubmitting, hasValidationErrors, validationErrors, stableOnStateChange]);

    // Inicializar el formulario cuando hay un modelo para editar (solo una vez)
    // OPTIMIZACIÓN: Usar useRef para evitar múltiples inicializaciones
    const hasInitialized = React.useRef(false);
    
    useEffect(() => {
        if (isEditing && model?.id && !isInitializing && initializeForEdit && !hasInitialized.current) {
            hasInitialized.current = true;
            initializeForEdit(model);
        }
        
        // Reset cuando cambia el modelo
        if (!model?.id) {
            hasInitialized.current = false;
        }
    }, [model?.id, isInitializing, initializeForEdit]);

    // Handler para selección de empleado (específico del admin) - memoized
    const handleEmpleadoChange = React.useCallback((empleadoId) => {
        // Asegurar que el empleadoId sea un número válido
        const numericEmpleadoId = parseInt(empleadoId, 10);
        
        if (isNaN(numericEmpleadoId) || numericEmpleadoId <= 0) {
            return;
        }
        handleInputChange('empleado_id', numericEmpleadoId);
    }, [handleInputChange]);

    // Preparar archivos para mostrar
    const existingFilesForDisplay = React.useMemo(() => {
        return isEditing && fullModel?.files ? fullModel.files : [];
    }, [isEditing, fullModel?.files]);

    const newFilesForDisplay = React.useMemo(() => {
        return formData.files || [];
    }, [formData.files]);

    // Mostrar loading si estamos inicializando o cargando datos completos
    if (isInitializing || isLoadingCompleteData) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-orange"></div>
                <span className="ml-2 text-custom-gray-dark dark:text-custom-gray-light">
                    Cargando datos de la vacación...
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* Selección de Empleado (Solo Admin) */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-bold text-custom-blue dark:text-custom-white">
                    Empleado <span className='text-custom-orange'>*</span>
                </Label>
                
                {/* Dropdown de Empleados */}
                <EmpleadoAdvanceDropdown
                    defaultValue={formData.empleado_id}
                    onChangeValue={(id, empleado) => {
                        handleEmpleadoChange(id);
                        markFieldAsTouched('empleado_id');
                    }}
                    className="w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                    placeholder="Seleccionar empleado..."
                />
            </div>

            {/* Selección de Permiso - OCULTO: Siempre es "Vacaciones" 
            <PermisoSelectionSection
                selectedPermiso={selectedPermiso}
                onPermisoSelect={handlePermisoSelect}
                maxDurationDays={maxDurationDays}
                formData={formData}
                validationErrors={validationErrors}
                markFieldAsTouched={markFieldAsTouched}
                dateRange={dateRange}
                empleadoId={formData.empleado_id}
            />
            */}

            {/* Fechas y Horarios */}
            <DateTimeSection
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                formData={formData}
                onInputChange={handleInputChange}
                canShowCheckbox={canShowCheckbox}
                canShowTimeFields={canShowTimeFields}
                shouldForceFullDay={shouldForceFullDay}
                maxDurationMs={maxDurationMs}
                selectedPermiso={selectedPermiso}
                validationErrors={validationErrors}
                markFieldAsTouched={markFieldAsTouched}
                empleadoId={formData.empleado_id} // Admin: usa el empleado seleccionado en el formulario
            />

            {/* Detalles Adicionales */}
            <AdditionalDetailsSection
                formData={formData}
                onInputChange={handleInputChange}
                canShowCheckbox={canShowCheckbox}
                validationErrors={validationErrors}
                markFieldAsTouched={markFieldAsTouched}
            />

            {/* Sección de Archivos */}
            <FileUploadSection
                existingFiles={existingFilesForDisplay}
                newFiles={newFilesForDisplay}
                onFilesAdd={handleFilesAdd}
                onFileRemove={handleFileRemove}
                onExistingFileDelete={handleExistingFileDelete}
                showDeleteDialog={showDeleteFileDialog}
                fileToDelete={fileToDelete}
                onConfirmDelete={confirmDeleteFile}
                onCancelDelete={cancelFileDelete}
                isDeletingFile={isDeletingFile}
                isEditing={isEditing}
            />

            {/* Errores de Validación */}
            {hasValidationErrors && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                        Por favor, corrige los siguientes errores:
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                {error}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Estado de carga */}
            {isSubmitting && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                    <div className="text-sm text-blue-700">
                        {isEditing ? 'Actualizando vacación...' : 'Creando vacación...'}
                    </div>
                </div>
            )}
        </div>
    );
});

FormFields.displayName = 'FormFields';

export default React.memo(FormFields);
