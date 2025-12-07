import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/App/Buttons/Button";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import FileUploadArea from "@/Components/App/FileUpload/FileUploadArea";
import FileViewer from "@/Components/App/FileUpload/FileViewer";
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import Icon from "@/imports/LucideIcon";

export function JustificanteUploadDialog({ 
    fichajeData,
    onUpload,
    isOpen,
    onClose,
}) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    
    // Estado para el FileViewer
    const [previewFile, setPreviewFile] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    
    // Estado para el motivo del fichaje tarde
    const [motivo, setMotivo] = useState('');

    const handleFilesAdd = (newFiles) => {
        setSelectedFiles(newFiles);
    };

    const handleFileRemove = (fileToRemove) => {
        setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const handleExistingFileDelete = (file) => {
        setFileToDelete(file);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        // Aquí implementarías la lógica para eliminar archivos existentes si los hay
        console.log('Eliminar archivo:', fileToDelete);
        setShowDeleteDialog(false);
        setFileToDelete(null);
    };

    const handleCancelDelete = () => {
        setShowDeleteDialog(false);
        setFileToDelete(null);
    };

    // Funciones para el FileViewer
    const handlePreview = (file) => {
        setPreviewFile(file);
        setIsViewerOpen(true);
    };

    const handleCloseViewer = () => {
        setIsViewerOpen(false);
        setPreviewFile(null);
    };

    const handleDownload = (file) => {
        // Para archivos nuevos (File objects)
        if (file instanceof File) {
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            // Para archivos existentes del servidor
            const endpoint = '/api/v1/files/{file}/download';
            const downloadUrl = endpoint.replace('{file}', file.hash);
            window.open(downloadUrl, '_blank');
        }
    };

    const handleUpload = async () => {
        // Validar que haya al menos un archivo o un motivo
        if (selectedFiles.length === 0 && motivo.trim() === '') {
            alert('Por favor selecciona al menos un archivo o escribe el motivo');
            return;
        }

        setIsUploading(true);
        try {
            // Incluir el motivo en los datos a enviar
            await onUpload(fichajeData?.id, selectedFiles, motivo.trim());
            
            // Resetear estado y cerrar dialog
            setSelectedFiles([]);
            setMotivo('');
            onClose();
        } catch (error) {
            console.error('Error al subir archivos:', error);
            alert('Error al subir los archivos. Inténtalo de nuevo.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            setSelectedFiles([]);
            setMotivo('');
            // También cerrar el viewer si está abierto
            if (isViewerOpen) {
                handleCloseViewer();
            }
            onClose();
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-lg bg-custom-gray-light dark:bg-custom-blackLight">
                    <DialogHeader>
                        <DialogTitle>Subir Justificante</DialogTitle>
                        <DialogDescription>
                            Selecciona el archivo de justificante o escribe el motivo de tu fichaje tardío para el día {' '} 
                            <span className="font-semibold">{fichajeData?.fecha_inicio}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Textarea para el motivo */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-medium text-custom-blackLight dark:text-custom-gray-default">
                                Motivo del fichaje tarde
                                <span className="text-xs text-custom-gray-dark font-normal ml-2">
                                    (Opcional si adjuntas documentos)
                                </span>
                            </Label>
                            <Textarea
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                placeholder="Explica brevemente el motivo de tu fichaje tarde..."
                                className="min-h-[80px] resize-none bg-custom-gray-light dark:bg-zinc-700"
                                disabled={isUploading}
                            />
                            <div className="text-xs text-gray-400 text-right">
                                {motivo.length} caracteres
                                {motivo.trim() !== '' && (
                                    <span className="text-green-600 ml-2">✓ Texto válido</span>
                                )}
                            </div>
                        </div>

                        {/* FileUploadArea */}
                        <div className="flex flex-col gap-1">
                            <Label className="text-sm font-medium text-custom-blackLight dark:text-custom-gray-default">
                                Documentos de justificación
                                <span className="text-xs text-gray-500 font-normal ml-2">
                                    (Opcional si escribes el motivo)
                                </span>
                            </Label>
                            <FileUploadArea
                                id="file-upload-justificante"
                                className="bg-custom-gray-light dark:bg-custom-blackLight"
                                multiple={true}
                                onFileChange={handleFilesAdd}
                                selectedFiles={selectedFiles}
                                onRemoveSelected={handleFileRemove}
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                text="Haga clic aquí o arrastre los documentos necesarios"
                                existingFiles={fichajeData?.justificante ? [fichajeData.justificante] : []}
                                showExistingFiles={!!fichajeData?.justificante}
                                onRemoveExisting={handleExistingFileDelete}
                                allowRemoveExisting={true}
                                showPreview={true}
                                onPreview={handlePreview}
                                downloadConfig={{
                                    endpoint: '/api/v1/files/{file}/download',
                                    fileIdField: 'hash',
                                    fileNameField: 'name'
                                }}
                            />
                        </div>

                        <div className="text-xs text-gray-500">
                            <strong>Máximo:</strong> 10 MB por archivo<br/>
                            <strong>Formatos permitidos:</strong> PDF, DOC, DOCX, XLS, XLSX, TXT, Imágenes
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isUploading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={(selectedFiles.length === 0 && motivo.trim() === '') || isUploading}
                        >
                            {isUploading ? 'Subiendo...' : 'Subir Justificante'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* FileViewer para vista previa */}
            <FileViewer
                file={previewFile}
                isOpen={isViewerOpen}
                onClose={handleCloseViewer}
                onDownload={handleDownload}
            />

            {/* File Deletion Confirmation Modal */}
            <DecisionModal
                variant="destructive"
                open={showDeleteDialog}
                onOpenChange={handleCancelDelete}
                action={handleConfirmDelete}
                title="¿Eliminar archivo?"
                content={
                    fileToDelete ? (
                        <span>
                            ¿Estás seguro de que deseas eliminar el archivo <strong>"{fileToDelete.name || fileToDelete.nombre_original}"</strong>? 
                            Esta acción no se puede deshacer.
                        </span>
                    ) : (
                        'Esta acción no se puede deshacer.'
                    )
                }
                icon={<Icon name="Trash2" className="text-red-500" />}
            />
        </>
    );
}

export default JustificanteUploadDialog;