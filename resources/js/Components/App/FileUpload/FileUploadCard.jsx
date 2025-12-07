import React, { useState, useCallback, memo } from 'react';
import Icon from "@/imports/LucideIcon";
import ExtensionIcon from "@/Components/App/ExtensionIcon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { toast } from "sonner";

const FileUploadCard = memo(function FileUploadCard({ 
    file, 
    type = 'existing',
    onDownload,
    onRemove,
    onPreview,
    showPreview = false,
    downloadConfig = {
        endpoint: '/api/v1/files/{file}/download',
        urlEndpoint: '/api/v1/files/{file}/url',
        fileIdField: 'hash',
        fileNameField: 'name',
    }
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const formatFileSize = useCallback((bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const getFileExtension = useCallback((fileName, extension = null) => {
        return extension || fileName.toLowerCase().split('.').pop() || '';
    }, []);

    const handleDefaultDownload = useCallback(async (file) => {
        if (!file || !file.hash || file.type === 'folder' || file.is_folder) {
            toast.error("Error de descarga", {
                description: "El elemento seleccionado no es un archivo válido para descargar",
            });
            return;
        }
        
        try {
            // Intentar primero con URL firmada
            try {
                const response = await window.axios.get(`/api/v1/files/${file.hash}/url`);
                
                if (response.data.url) {
                    await downloadFile(response.data.url, file.name || 'archivo');
                } else {
                    throw new Error('No se obtuvo URL válida');
                }
            } catch (urlError) {
                // Fallback: descarga directa
                await downloadFile(`/api/v1/files/${file.hash}/download`, file.name || 'archivo');
            }
            
            toast.success("Descarga iniciada", {
                description: `Descargando "${file.name}"`,
            });
        } catch (error) {
            toast.error("Error de descarga", {
                description: 'No se pudo descargar el archivo',
            });
        }
    }, []);

    const downloadFile = async (url, fileName) => {
        const response = await window.axios.get(url, {
            responseType: 'blob',
            timeout: 30000
        });

        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    };

    const isExisting = type === 'existing';
    const canDownload = (onDownload || isExisting) && file && file.hash && file.type !== 'folder' && !file.is_folder;

    return (
        <div className="relative bg-custom-white dark:bg-custom-blackLight rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group min-w-0 max-w-none border border-custom-gray-light dark:border-custom-gray-darker" style={{ width: '180px' }}>
            {/* Nombre del archivo arriba */}
            <div className="p-2 pb-1 border-b border-custom-gray-light dark:border-custom-gray-darker">
                <h4 className="font-medium text-sm truncate text-custom-blackSemi dark:text-custom-white" title={file.name}>
                    {file.name}
                </h4>
            </div>

            {/* Contenido principal con icono */}
            <div className="p-3 flex items-center justify-center">
                <div className="w-16 h-16 rounded-lg bg-custom-gray-default dark:bg-custom-blackSemi flex items-center justify-center">
                    <ExtensionIcon 
                        extension={getFileExtension(file.name, file.extension)}
                        size={32}
                        className="transition-all duration-200"
                    />
                </div>
            </div>

            {/* Footer con peso del archivo y acciones */}
            <div className="px-3 pb-2 border-t border-custom-gray-light dark:border-custom-gray-darker bg-custom-gray-default/30 dark:bg-custom-blackSemi/50 rounded-b-xl">
                <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-custom-gray-dark dark:text-custom-gray-light font-medium">
                        {formatFileSize(file.size)}
                    </span>
                    
                    {/* Menú de acciones */}
                    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="w-6 h-6 rounded-full bg-custom-white dark:bg-custom-blackLight shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 border border-custom-gray-light dark:border-custom-gray-darker"
                                title="Opciones"
                            >
                                <Icon name="Ellipsis" size={12} className="text-custom-gray-dark dark:text-custom-gray-light" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {showPreview && onPreview && (
                                <DropdownMenuItem 
                                    onClick={() => onPreview(file)}
                                    className="flex items-center gap-2 text-custom-blue dark:text-custom-white cursor-pointer"
                                >
                                    <Icon name="Eye" size={14} />
                                    <span>Vista previa</span>
                                </DropdownMenuItem>
                            )}
                            {canDownload && (
                                <DropdownMenuItem 
                                    onClick={() => onDownload ? onDownload(file) : handleDefaultDownload(file)}
                                    className="flex items-center gap-2 text-custom-green dark:text-custom-green cursor-pointer"
                                >
                                    <Icon name="Download" size={14} />
                                    <span>Descargar</span>
                                </DropdownMenuItem>
                            )}
                            {onRemove && (
                                <DropdownMenuItem 
                                    onClick={() => onRemove(file)}
                                    className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
                                >
                                    <Icon name="Trash2" size={14} />
                                    <span>{isExisting ? 'Eliminar' : 'Quitar'}</span>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="absolute -top-1 -left-1">
                <div className={`w-3 h-3 rounded-full border-2 border-custom-white dark:border-custom-blackLight ${
                    isExisting 
                        ? 'bg-green-500' 
                        : 'bg-custom-orange animate-pulse'
                }`} title={isExisting ? "Archivo guardado" : "Pendiente de subir"}></div>
            </div>
        </div>
    );
});

export default FileUploadCard;
