import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

/**
 * Hook para manejar archivos adjuntos
 */
export function useFileManager() {
    const [fileToDelete, setFileToDelete] = useState(null);
    const [showDeleteFileDialog, setShowDeleteFileDialog] = useState(false);
    const [isDeletingFile, setIsDeletingFile] = useState(false);

    /**
     * Eliminar archivo del servidor
     */
    const executeFileDelete = async (permisoId, fileHash) => {
        setIsDeletingFile(true);
        
        try {
            const deleteUrl = `/api/v1/user/solicitudes/${permisoId}/folder/${fileHash}`;
            const response = await axios.delete(deleteUrl);

            if (response.status === 200) {
                toast.success('Archivo eliminado correctamente');
                return true;
            }
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el archivo';
            toast.error(errorMessage);
            return false;
        } finally {
            setIsDeletingFile(false);
            setShowDeleteFileDialog(false);
            setFileToDelete(null);
        }
    };

    /**
     * Confirmar eliminación de archivo
     */
    const confirmDeleteFile = async () => {
        if (!fileToDelete) return;

        const success = await executeFileDelete(fileToDelete.permisoId, fileToDelete.file.hash);
        if (success && fileToDelete.onSuccess) {
            fileToDelete.onSuccess(fileToDelete.file);
        }
    };

    /**
     * Iniciar proceso de eliminación de archivo
     */
    const initiateFileDelete = (permisoId, file, onSuccess = null) => {
        setFileToDelete({ permisoId, file, onSuccess });
        setShowDeleteFileDialog(true);
    };

    /**
     * Cancelar eliminación de archivo
     */
    const cancelFileDelete = () => {
        setShowDeleteFileDialog(false);
        setFileToDelete(null);
    };

    /**
     * Agregar archivos al formulario - MEJORADO
     */
    const addFilesToForm = (files, currentFiles, setFormData) => {
        // Asegurarnos de que files sea un array
        const filesArray = Array.isArray(files) ? files : Array.from(files);
        
        // Filtrar archivos duplicados basándose en nombre, tamaño y timestamp
        const newFiles = filesArray.filter(file => {
            const isDuplicate = currentFiles.some(existingFile => 
                existingFile.name === file.name && 
                existingFile.size === file.size &&
                existingFile.lastModified === file.lastModified
            );
            
            return !isDuplicate;
        });

        if (newFiles.length > 0) {
            setFormData(prev => {
                const updatedFiles = [...(prev.files || []), ...newFiles];
                return {
                    ...prev,
                    files: updatedFiles
                };
            });
        }
    };

    /**
     * Eliminar archivo del formulario
     */
    const removeFileFromForm = (index, setFormData) => {
        setFormData(prev => {
            const updatedFiles = prev.files.filter((_, i) => i !== index);
            return {
                ...prev,
                files: updatedFiles
            };
        });
    };

    return {
        // Estados
        fileToDelete,
        showDeleteFileDialog,
        isDeletingFile,
        
        // Funciones
        initiateFileDelete,
        confirmDeleteFile,
        cancelFileDelete,
        addFilesToForm,
        removeFileFromForm,
        executeFileDelete
    };
}
