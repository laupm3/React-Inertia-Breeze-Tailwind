import { useState, useEffect, useCallback, useRef } from 'react';
import Icon from "@/imports/LucideIcon";
import FileUploadCard from './FileUploadCard';
import { toast } from "sonner";

const EXTENSION_TO_MIME = {
    '.pdf': ['application/pdf'],
    '.doc': ['application/msword'],
    '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    '.xls': ['application/vnd.ms-excel'],
    '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    '.txt': ['text/plain'],
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.gif': ['image/gif'],
    '.bmp': ['image/bmp'],
    '.svg': ['image/svg+xml'],
    '.webp': ['image/webp']
};

export default function FileUploadArea({
    onFileChange,
    accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt",
    multiple = false,
    id = "file-upload",
    text = "Haga clic aquí o arrastre el documento",
    className = "",
    disabled = false,
    existingFiles = [],
    selectedFiles = [],
    onDownload = null,
    onRemoveExisting = null,
    onRemoveSelected = null,
    showPreview = true,
    maxFileSize = 10 * 1024 * 1024,
    showExistingFiles = true,
    allowRemoveExisting = true,
    downloadConfig = {
        endpoint: '/api/v1/files/{file}/download',
        urlEndpoint: '/api/v1/files/{file}/url',
        fileIdField: 'hash',
        fileNameField: 'name',
    }
}) {
    const [dragActive, setDragActive] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);
    const onFileChangeRef = useRef(onFileChange);

    useEffect(() => {
        onFileChangeRef.current = onFileChange;
    }, [onFileChange]);

    const normalizeFileName = useCallback((fileName) => {
        return fileName.toLowerCase().trim();
    }, []);

    const getFileNameParts = useCallback((fileName) => {
        const normalizedName = normalizeFileName(fileName);
        const lastDotIndex = normalizedName.lastIndexOf('.');
        return lastDotIndex === -1 
            ? { basename: normalizedName, extension: '' }
            : {
                basename: normalizedName.substring(0, lastDotIndex),
                extension: normalizedName.substring(lastDotIndex)
            };
    }, [normalizeFileName]);

    const isFileDuplicate = useCallback((newFile) => {
        const newFileParts = getFileNameParts(newFile.name);
        const isDuplicate = (files) => files.some(file => {
            const parts = getFileNameParts(file.name);
            return parts.basename === newFileParts.basename && parts.extension === newFileParts.extension;
        });
        return isDuplicate(existingFiles) || isDuplicate(selectedFiles);
    }, [existingFiles, selectedFiles, getFileNameParts]);

    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const removeSelectedFile = useCallback((fileToRemove) => {
        if (onRemoveSelected) {
            const index = selectedFiles.findIndex(file => file === fileToRemove);
            if (index !== -1) onRemoveSelected(index);
        }
    }, [selectedFiles, onRemoveSelected]);

    const clearAllSelectedFiles = useCallback(() => {
        if (onFileChangeRef.current) onFileChangeRef.current([]);
    }, []);

    const validateFileType = useCallback((file) => {
        if (!accept) return true;
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
        const acceptedTypes = accept.split(',').map(type => type.trim());

        return acceptedTypes.some(acceptedType => {
            if (acceptedType.startsWith('.')) {
                return fileExtension === acceptedType.toLowerCase();
            } else if (acceptedType.includes('/*')) {
                const mimeCategory = acceptedType.split('/')[0];
                const fileMimes = EXTENSION_TO_MIME[fileExtension] || [];
                return fileMimes.some(mime => mime.startsWith(mimeCategory + '/'));
            } else if (acceptedType.includes('/')) {
                const fileMimes = EXTENSION_TO_MIME[fileExtension] || [];
                return fileMimes.includes(acceptedType);
            }
            return false;
        });
    }, [accept]);

    const validateFile = useCallback((file) => {
        if (file.size > maxFileSize) {
            return `El archivo ${file.name} excede el tamaño máximo permitido (${formatFileSize(maxFileSize)})`;
        }

        if (!validateFileType(file)) {
            const allowedExtensions = accept.split(',').map(ext =>
                ext.trim().replace(/[\*\.]/g, '').toUpperCase()
            ).join(', ');
            return `Solo se permiten archivos: ${allowedExtensions}`;
        }

        return null;
    }, [maxFileSize, formatFileSize, validateFileType]);

    const removeExistingFile = async (file) => {
        if (onRemoveExisting) {
            onRemoveExisting(file);
        } else {
            alert('Funcionalidad de eliminación pendiente de implementar en el backend');
        }
    };

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

    const handleDownload = async (file) => {
        
        if (!file || !file.hash || file.type === 'folder' || file.is_folder) {
            console.error('❌ Objeto no válido para descarga:', file);
            return;
        }
        
        if (onDownload) {
            onDownload(file);
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
            console.error('❌ Error al descargar:', error);
            toast.error("Error de descarga", {
                description: 'No se pudo descargar el archivo',
            });
        }
    };

    const handleFileChange = useCallback((e) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const validFiles = [];
            let hasErrors = false;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                const validationError = validateFile(file);
                if (validationError) {
                    toast.error("Error de validación", {
                        description: validationError,
                    });
                    hasErrors = true;
                    continue;
                }

                if (isFileDuplicate(file)) {
                    toast.warning("Archivo duplicado", {
                        description: `El archivo "${file.name}" ya está seleccionado o existe en el servidor`,
                    });
                    hasErrors = true;
                    continue;
                }

                validFiles.push(file);
            }

            if (validFiles.length > 0) {
                const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
                if (onFileChangeRef.current) {
                    onFileChangeRef.current(newFiles);
                }
            }

            if (hasErrors && validFiles.length === 0) {
                return;
            }
        }

        setFileInputKey(prev => prev + 1);
    }, [validateFile, isFileDuplicate, multiple, selectedFiles]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        if (!disabled) setDragActive(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const validFiles = [];
            let hasErrors = false;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                const validationError = validateFile(file);
                if (validationError) {
                    toast.error("Error de validación", {
                        description: validationError,
                    });
                    hasErrors = true;
                    continue;
                }

                if (isFileDuplicate(file)) {
                    toast.warning("Archivo duplicado", {
                        description: `El archivo "${file.name}" ya está seleccionado o existe en el servidor`,
                    });
                    hasErrors = true;
                    continue;
                }

                validFiles.push(file);
            }

            if (validFiles.length > 0) {
                const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
                if (onFileChangeRef.current) {
                    onFileChangeRef.current(newFiles);
                }
            }
        }
    }, [disabled, validateFile, isFileDuplicate, multiple, selectedFiles]);

    const totalFiles = (showExistingFiles ? existingFiles.length : 0) + selectedFiles.length;
    const hasFiles = totalFiles > 0;
    const shouldShowFileSection = showExistingFiles || selectedFiles.length > 0;

    useEffect(() => {
        if (existingFiles && existingFiles.length > 0) {
        }
    }, [existingFiles]);

    return (
        <div className="space-y-2 min-w-0">
            <div
                className={`group border-2 border-dashed rounded-xl transition-all duration-300 min-w-0 ${dragActive
                        ? 'border-custom-orange bg-custom-orange/10 dark:bg-custom-orange/5 scale-[1.01]'
                        : 'border-custom-gray-light dark:border-custom-gray-darker hover:bg-custom-gray-default/30 dark:hover:bg-custom-blackSemi/30 hover:border-custom-orange/50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {shouldShowFileSection && (
                    <div className="flex items-center justify-between p-4 border-b border-custom-gray-light/50 dark:border-custom-gray-darker/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-custom-blue/10 dark:bg-custom-orange/10 flex items-center justify-center">
                                <Icon name="Files" size={16} className="text-custom-blue dark:text-custom-orange" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-custom-blue dark:text-custom-white">
                                    {hasFiles
                                        ? `${totalFiles} archivo${totalFiles !== 1 ? 's' : ''}`
                                        : 'Sin archivos adjuntos'
                                    }
                                </span>
                                {showExistingFiles && existingFiles.length > 0 && selectedFiles.length > 0 && (
                                    <div className="text-xs text-custom-gray-dark dark:text-custom-gray-light">
                                        {existingFiles.length} guardado{existingFiles.length !== 1 ? 's' : ''} + {selectedFiles.length} nuevo{selectedFiles.length !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        </div>
                        {selectedFiles.length > 0 && (
                            <button
                                type="button"
                                onClick={clearAllSelectedFiles}
                                className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:underline transition-colors flex items-center gap-1"
                            >
                                <Icon name="Trash2" size={14} />
                                <span>Limpiar nuevos</span>
                            </button>
                        )}
                    </div>
                )}

                {shouldShowFileSection && (
                    <div className="p-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {showExistingFiles && existingFiles.map((file, index) => (
                                <div key={file.hash || `existing-${index}`} className="flex-shrink-0">
                                    <FileUploadCard
                                        file={file}
                                        type="existing"
                                        onDownload={handleDownload}
                                        onRemove={allowRemoveExisting ? removeExistingFile : null}
                                        showPreview={showPreview}
                                        downloadConfig={downloadConfig}
                                    />
                                </div>
                            ))}

                            {selectedFiles.map((file, index) => (
                                <div key={`selected-${index}`} className="flex-shrink-0">
                                    <FileUploadCard
                                        file={file}
                                        type="selected"
                                        onRemove={removeSelectedFile}
                                        showPreview={false}
                                        downloadConfig={downloadConfig}
                                    />
                                </div>
                            ))}

                            {!hasFiles && shouldShowFileSection && (
                                <div className="flex-shrink-0 w-full text-center py-8">
                                    <div className="text-custom-gray-dark dark:text-custom-gray-light">
                                        <Icon name="FileText" size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm font-medium">No hay archivos adjuntos</p>
                                        <p className="text-xs opacity-75 mt-1">Puede agregar archivos usando el área de subida abajo</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <label
                    htmlFor={id}
                    className={`block cursor-pointer transition-all duration-300 ${shouldShowFileSection ? 'p-4 border-t border-custom-gray-light/50 dark:border-custom-gray-darker/50' : 'p-8'
                        } ${disabled ? 'cursor-not-allowed' : ''}`}
                >
                    <div className={`flex ${shouldShowFileSection ? 'flex-row items-center justify-center gap-3' : 'flex-col items-center gap-4'} text-center`}>
                        <div className="relative">
                            <Icon
                                name="Upload"
                                size={shouldShowFileSection ? 24 : 32}
                                className={`transition-all duration-300 ${dragActive
                                        ? 'text-custom-orange -translate-y-1 scale-110'
                                        : 'text-custom-gray-dark group-hover:-translate-y-0.5 group-hover:text-custom-orange group-hover:scale-105'
                                    }`}
                            />
                            {multiple && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-custom-blue dark:bg-custom-orange rounded-full flex items-center justify-center">
                                    <Icon name="Plus" size={8} className="text-white dark:text-black" />
                                </div>
                            )}
                        </div>

                        <div className={shouldShowFileSection ? '' : 'space-y-2'}>
                            <p className={`transition-all duration-300 font-medium ${shouldShowFileSection ? 'text-sm' : 'text-base'
                                } ${dragActive
                                    ? 'text-custom-orange scale-105'
                                    : 'text-custom-gray-dark group-hover:text-custom-orange'
                                }`}>
                                {dragActive
                                    ? (multiple ? 'Suelte los archivos aquí' : 'Suelte el archivo aquí')
                                    : shouldShowFileSection
                                        ? (multiple ? 'Agregar más archivos' : 'Cambiar archivo')
                                        : text
                                }
                            </p>

                            {!shouldShowFileSection && (
                                <div className="text-sm text-custom-gray-dark dark:text-custom-gray-light space-y-1">
                                    <div>Máximo: {formatFileSize(maxFileSize)}</div>
                                    <div className="flex flex-wrap justify-center gap-1 text-xs">
                                        {accept.split(',').slice(0, 4).map((ext, i) => (
                                            <span key={i} className="bg-custom-gray-default dark:bg-custom-blackSemi px-2 py-1 rounded">
                                                {ext.trim().replace(/[\*\.]/g, '').toUpperCase()}
                                            </span>
                                        ))}
                                        {accept.split(',').length > 4 && (
                                            <span className="text-custom-gray-dark dark:text-custom-gray-light">+{accept.split(',').length - 4} más</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <input
                        key={fileInputKey}
                        id={id}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept={accept}
                        multiple={multiple}
                        disabled={disabled}
                    />
                </label>
            </div>
        </div>
    );
}
