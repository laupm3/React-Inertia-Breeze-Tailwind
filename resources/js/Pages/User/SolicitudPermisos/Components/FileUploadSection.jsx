import { Label } from '@/Components/ui/label';
import FileUploadArea from "@/Components/App/FileUpload/FileUploadArea";
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import Icon from "@/imports/LucideIcon";

/**
 * Componente principal para manejo de archivos - SIMPLIFICADO
 */
export function FileUploadSection({ 
    existingFiles = [],
    newFiles = [],
    onFilesAdd,
    onFileRemove,
    onExistingFileDelete,
    showDeleteDialog,
    fileToDelete,
    onConfirmDelete,
    onCancelDelete,
    isDeletingFile,
    isEditing = false  // Nueva prop para saber si estamos editando
}) {

    return (
        <div className="flex flex-col gap-1">
            <Label className="text-sm font-bold text-custom-blue dark:text-custom-white">
                Documentos de justificación
                <span className="ml-2 text-xs text-custom-gray-dark dark:text-custom-gray-light font-normal">
                    (Opcional - Puede adjuntar múltiples archivos)
                </span>
            </Label>
            <FileUploadArea
                id="file-upload-permisos"
                multiple={true}
                onFileChange={onFilesAdd}
                selectedFiles={newFiles}
                onRemoveSelected={onFileRemove}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                text="Haga clic aquí o arrastre los documentos necesarios"
                existingFiles={existingFiles}
                showExistingFiles={isEditing}
                onRemoveExisting={onExistingFileDelete}
                allowRemoveExisting={isEditing}
                downloadConfig={{
                    endpoint: '/api/v1/files/{file}/download',
                    fileIdField: 'hash',
                    fileNameField: 'name'
                }}
            />

            {/* File Deletion Confirmation Modal */}
            <DecisionModal
                variant="destructive"
                open={showDeleteDialog}
                onOpenChange={onCancelDelete}
                action={onConfirmDelete}
                title="¿Eliminar archivo?"
                content={
                    fileToDelete ? (
                        <span>
                            ¿Estás seguro de que deseas eliminar el archivo <strong>"{fileToDelete.file?.name || fileToDelete.name || 'archivo seleccionado'}"</strong>? 
                            Esta acción no se puede deshacer.
                        </span>
                    ) : (
                        'Esta acción no se puede deshacer.'
                    )
                }
                icon={<Icon name="Trash2" className="text-red-500" />}
            />
        </div>
    );
}
