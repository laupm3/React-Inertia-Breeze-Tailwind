import React, { useMemo } from 'react';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import Icon from "@/imports/LucideIcon";
import { useDataHandler } from '@/Pages/Admin/Vacaciones/Index/Context/DataHandlerContext';
import FormFields from '@/Components/App/Vacacion/CreateUpdateDialog/Partials/FormFields';
import { useForm } from "@inertiajs/react";
import { defaultValues } from "../../Schema/ModelSchema";

/**
 * Portal del diálogo completamente autónomo que maneja create/edit
 * Usa hooks del admin para la lógica del formulario
 */
export default function DialogPortal({ model, onOpenChange }) {
    const { 
        closeAllViews,
        updateData
    } = useDataHandler();

    // Referencia para acceder a métodos del FormFields
    const formFieldsRef = React.useRef();

    // Formulario básico para compatibilidad (aunque los hooks del admin manejan todo)
    const form = useForm(defaultValues);
    
    // Computar si estamos en modo edición
    const isEditing = useMemo(() => !!model, [model]);

    /**
     * Función de actualización del formulario (para compatibilidad) - memoized
     */
    const updateForm = React.useCallback((data) => {
        if (typeof data === 'object') {
            form.setData(prevData => {
                const newData = { ...prevData, ...data };
                return newData;
            });
        }
    }, [form.setData]);

    /**
     * Manejar envío del formulario - memoized
     */
    const handleSubmit = React.useCallback(async () => {
        if (formFieldsRef.current && formFieldsRef.current.handleFormSubmit) {
            try {
                const result = await formFieldsRef.current.handleFormSubmit((response) => {
                    try {
                        // Actualizar la tabla con los datos de la respuesta
                        if (response && response.data && response.data.solicitud) {
                            updateData(response.data.solicitud);
                        }
                        
                        // Cerrar el modal
                        closeAllViews();
                    } catch (callbackError) {
                        console.error('Error in success callback:', callbackError);
                        // Asegurar que el modal se cierre incluso si hay errores en el callback
                        try {
                            closeAllViews();
                        } catch (closeError) {
                            console.error('Error closing modal:', closeError);
                        }
                    }
                });
                
                return result;
            } catch (error) {
                console.error('Submit error:', error);
                return false;
            }
        } else {
            console.warn('FormFields ref not available');
            return false;
        }
    }, [closeAllViews, updateData]);

    /**
     * Estados del formulario obtenidos directamente de la ref
     */
    const [isFormValid, setIsFormValid] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Función para actualizar el estado cuando cambie el FormFields - memoized
    const updateFormState = React.useCallback(() => {
        if (formFieldsRef.current) {
            const newIsValid = formFieldsRef.current.isFormValid || false;
            const newIsSubmitting = formFieldsRef.current.isSubmitting || false;
            
            // Solo actualizar si realmente cambió
            if (newIsValid !== isFormValid) {
                setIsFormValid(newIsValid);
            }
            if (newIsSubmitting !== isSubmitting) {
                setIsSubmitting(newIsSubmitting);
            }
        }
    }, []); // OPTIMIZACIÓN: Eliminar dependencias que causan recreación constante

    // Callback para recibir cambios de estado desde FormFields - memoized
    const handleFormStateChange = React.useCallback((newState) => {
        // Usar functional updates para evitar dependencias
        setIsFormValid(prev => {
            if (newState.isFormValid !== prev) {
                return newState.isFormValid;
            }
            return prev;
        });
        
        setIsSubmitting(prev => {
            if (newState.isSubmitting !== prev) {
                return newState.isSubmitting;
            }
            return prev;
        });
    }, []); // OPTIMIZACIÓN: Sin dependencias para evitar recreación

    // Actualizar estado cuando se monta el componente - SIN SETINTERVAL
    React.useEffect(() => {
        // Ejecutar una vez al montar para inicializar estado
        updateFormState();
    }, []); // Solo una vez al montar

    return (
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col bg-white dark:bg-custom-blackLight">
            <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-xl font-bold text-custom-blue dark:text-custom-white">
                    <Icon 
                        name={isEditing ? "Pencil" : "Plus"} 
                        className="inline mr-2" 
                        size={20} 
                    />
                    {isEditing ? 'Editar Solicitud de Vacaciones' : 'Nueva Solicitud de Vacaciones'}
                </DialogTitle>
                <DialogDescription className="text-custom-gray-dark dark:text-custom-gray-light">
                    {isEditing 
                        ? 'Modifica los detalles de la solicitud de vacaciones.' 
                        : 'Complete los detalles para crear una nueva solicitud de vacaciones.'
                    }
                </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2">
                <FormFields 
                    ref={formFieldsRef}
                    form={form} 
                    updateForm={updateForm} 
                    model={model} 
                    isLoading={isSubmitting}
                    error={form.errors}
                    onStateChange={handleFormStateChange}
                />
            </div>

            <DialogFooter className="flex-shrink-0 flex flex-col sm:flex-row gap-2 pt-4 border-t border-custom-gray-light dark:border-custom-gray-darker">
                <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto rounded-full bg-custom-orange hover:bg-custom-blue text-white"
                >
                    <Icon 
                        name={isSubmitting ? "Loader2" : (isEditing ? "Save" : "Plus")} 
                        className={`mr-2 ${isSubmitting ? 'animate-spin' : ''}`} 
                        size={16} 
                    />
                    {isSubmitting 
                        ? (isEditing ? 'Guardando...' : 'Creando...') 
                        : (isEditing ? 'Guardar Cambios' : 'Crear Vacaciones')
                    }
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
