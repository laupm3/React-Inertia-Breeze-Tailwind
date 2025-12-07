import { useEffect, useState } from 'react';
import axios from 'axios';

import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { 
    DateTimeSection, 
    AdditionalDetailsSection 
} from '@/Pages/User/Vacaciones/Components/FormSections';
import { FileUploadSection } from '@/Pages/User/Vacaciones/Components/FileUploadSection';

// Hooks (FileManager,FormValidation,PermisoApi,PermisoForm y PermisoFormManager)
import { usePermisoFormManager } from '@/Pages/User/Vacaciones/Hooks/usePermisoFormManager';
import { useFileManager } from '@/Pages/User/Vacaciones/Hooks/useFileManager';
import { useFormValidation } from '@/Pages/User/Vacaciones/Hooks/useFormValidation';
import { usePermisoApi } from '@/Pages/User/Vacaciones/Hooks/usePermisoApi';


/**
 * CreateUpdateDialog Component - Versión Refactorizada
 * 
 * Modal dialog para crear y editar solicitudes de vacaciones
 * Completamente modular usando hooks especializados y componentes reutilizables
 * 
 * @param {Object} props
 * @param {boolean} props.open - Control de visibilidad del modal
 * @param {Function} props.onOpenChange - Handler para abrir/cerrar modal
 * @param {Object|null} props.permisoToEdit - Datos de las vacaciones para editar (null para crear)
 * @param {Function} props.onSuccess - Callback después de crear/actualizar
 */
export default function CreateUpdateDialog({
    open,
    onOpenChange,
    permisoToEdit = null,
    onSuccess
}) {
    // Estado para datos completos del permiso (cuando se edita)
    const [permisoCompleto, setPermisoCompleto] = useState(null);
    const [isLoadingPermiso, setIsLoadingPermiso] = useState(false);

    // Hook para manejo del formulario
    const {
        formData,
        dateRange,
        selectedPermiso,
        isInitializing,
        isEditing,
        maxDurationMs,
        maxDurationDays,
        canShowCheckbox,
        canShowTimeFields,
        shouldForceFullDay,
        resetForm,
        initializeFormForEdit,
        handleInputChange,
        handlePermisoSelect,
        handleDateRangeChange,
        setFormData
    } = usePermisoFormManager(permisoToEdit);

    // Hook para manejo de archivos
    const {
        fileToDelete,
        showDeleteFileDialog,
        isDeletingFile,
        initiateFileDelete,
        confirmDeleteFile,
        cancelFileDelete,
        addFilesToForm,
        removeFileFromForm,
        executeFileDelete
    } = useFileManager();

    // Hook para validaciones
    const {
        isFormValid,
        validationErrors,
        hasValidationErrors,
        markFieldAsTouched
    } = useFormValidation(formData, selectedPermiso);

    // Hook para operaciones de API
    const {
        isSubmitting,
        handleSubmit: submitForm
    } = usePermisoApi();

    /**
     * Cargar datos completos de las vacaciones para edición
     */
    const loadPermisoCompleto = async (permisoId) => {
        try {
            setIsLoadingPermiso(true);
            const response = await axios.get(`/api/v1/user/vacaciones/${permisoId}`);
            const permiso = response.data.solicitudPermiso;
            setPermisoCompleto(permiso);
            return permiso;
        } catch (error) {
            console.error('Error al cargar vacaciones completas:', error);
            return null;
        } finally {
            setIsLoadingPermiso(false);
        }
    };

    /**
     * Inicializar formulario cuando se edita
     */
    useEffect(() => {
        if (open && isEditing && permisoToEdit?.id) {
            loadPermisoCompleto(permisoToEdit.id).then(permisoCompleto => {
                if (permisoCompleto) {
                    initializeFormForEdit(permisoCompleto);
                }
            });
        } else if (open && !isEditing) {
            resetForm();
        }
    }, [open, permisoToEdit?.id]);

    /**
     * Resetear estados cuando se cierra el modal
     */
    useEffect(() => {
        if (!open) {
            // Resetear todo el estado cuando se cierra el modal
            resetForm();
            setPermisoCompleto(null);
            // Resetear también los estados del file manager si es necesario
        }
    }, [open, resetForm]);

    /**
     * Manejar envío del formulario
     */
    const handleFormSubmit = async () => {
        if (!isFormValid || hasValidationErrors) {
            return;
        }

        try {
            await submitForm(formData, isEditing, permisoToEdit?.id);
            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            // El error ya se maneja en el hook usePermisoApi
            console.error('Form submission error:', error);
        }
    };

    /**
     * Manejar adición de archivos - CORREGIDO para manejo completo de lista
     */
    const handleFilesAdd = (files) => {
        // Asegurar que siempre sea un array
        const filesArray = Array.isArray(files) ? files : (files ? [files] : []);
        
        // Actualizar directamente con la nueva lista completa de archivos
        setFormData(prev => ({
            ...prev,
            files: filesArray
        }));
    };

    /**
     * Manejar eliminación de archivo nuevo
     */
    const handleFileRemove = (index) => {
        removeFileFromForm(index, setFormData);
    };

    /**
     * Manejar eliminación de archivo existente
     */
    const handleExistingFileDelete = (file) => {
        if (permisoToEdit?.id) {
            initiateFileDelete(permisoToEdit.id, file, (deletedFile) => {
                // Actualizar estado local removiendo el archivo eliminado
                setPermisoCompleto(prev => {
                    if (!prev) {
                        return prev;
                    }
                    
                    const updatedFiles = prev.files.filter(f => {
                        // Estrategia de filtrado más robusta:
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
            });
        }
    };

    // Determinar si el botón de envío debe estar deshabilitado
    const isSubmitDisabled = !isFormValid || hasValidationErrors || isInitializing || isSubmitting;

    // Usar permisoCompleto si existe, sino permisoToEdit como fallback
    const existingFilesForDisplay = (permisoCompleto?.files || permisoToEdit?.files || []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='bg-custom-white dark:bg-custom-blackLight max-w-3xl w-full max-h-[90vh] flex flex-col'>
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>
                        {isEditing ? 'Editar Vacaciones' : 'Solicitar Vacaciones'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? 'Modifica los datos de tu solicitud de vacaciones existente.' 
                            : 'Completa el formulario para solicitar nuevas vacaciones.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {/* Loading State */}
                    {isEditing && isLoadingPermiso ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-orange"></div>
                            <span className="ml-2 text-custom-gray-dark dark:text-custom-gray-light">
                                Cargando datos de las vacaciones...
                            </span>
                        </div>
                    ) : (
                        <form className="space-y-3 pr-2">
                            {/* Sección de fechas y horarios */}
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
                                empleadoId={null} // Usuario: no se pasa empleadoId, usa el del contexto auth
                            />

                            {/* Sección de detalles adicionales */}
                            <AdditionalDetailsSection
                                formData={formData}
                                onInputChange={handleInputChange}
                            />

                            {/* Sección de archivos */}
                            <FileUploadSection
                                existingFiles={existingFilesForDisplay}
                                newFiles={formData.files || []}
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
                        </form>
                    )}
                </div>

                <DialogFooter className="px-6 pb-4 pt-6 flex justify-end gap-4 flex-shrink-0 border-t border-custom-gray-light dark:border-custom-gray-darker">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className="bg-hidden hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-black dark:text-custom-white rounded-full"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleFormSubmit}
                        disabled={isSubmitDisabled}
                        className="bg-custom-orange hover:bg-custom-blue text-custom-white dark:text-custom-black dark:hover:bg-custom-white rounded-full"
                    >
                        {isSubmitting 
                            ? (isEditing ? 'Actualizando...' : 'Creando...') 
                            : (isEditing ? 'Guardar Cambios' : 'Solicitar Vacaciones')
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
