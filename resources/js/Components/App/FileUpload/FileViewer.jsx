import { useState, useEffect, useRef, useMemo } from 'react';
import Icon from "@/imports/LucideIcon";

const FILE_TYPES = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
    video: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
    audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
    office: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    text: ['txt', 'rtf', 'md']
};

const FILE_ICONS = {
    image: 'Image',
    pdf: 'FileText',
    video: 'Video',
    audio: 'Music',
    office: 'FileSpreadsheet',
    text: 'FileText',
    default: 'File'
};

export default function FileViewer({ file, isOpen, onClose, onDownload }) {
    const [imageError, setImageError] = useState(false);
    const [pdfError, setPdfError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [imageZoom, setImageZoom] = useState(1);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
    const [pdfLoading, setPdfLoading] = useState(true);
    const [previewUrls, setPreviewUrls] = useState({});
    const imageRef = useRef(null);
    const containerRef = useRef(null);

    const fileType = useMemo(() => {
        if (!file?.extension) return null;
        const ext = file.extension.toLowerCase();
        if (ext === 'pdf') return 'pdf';
        return Object.keys(FILE_TYPES).find(type => FILE_TYPES[type].includes(ext)) || 'default';
    }, [file?.extension]);

    const { isImage, isPdf, isVideo, isAudio, isOfficeDoc, isText } = useMemo(() => ({
        isImage: fileType === 'image',
        isPdf: fileType === 'pdf',
        isVideo: fileType === 'video',
        isAudio: fileType === 'audio',
        isOfficeDoc: fileType === 'office',
        isText: fileType === 'text'
    }), [fileType]);

    const resetStates = () => {
        setImageError(false);
        setPdfError(false);
        setIsLoading(true);
        setPdfLoading(true);
        setImageZoom(1);
        setImagePosition({ x: 0, y: 0 });
        setIsDragging(false);
    };

    useEffect(() => {
        if (file) resetStates();
    }, [file]);

    useEffect(() => {
        if (file?.hash && !previewUrls[file.hash]) {
            generateSignedUrl(file, true).then(url => {
                if (url) setPreviewUrls(prev => ({ ...prev, [file.hash]: url }));
            });
        }
    }, [file]);

    useEffect(() => {
        if (!isOpen) {
            setImageZoom(1);
            setImagePosition({ x: 0, y: 0 });
            setIsDragging(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging && imageZoom > 1) {
                const { clientX, clientY } = e;
                const deltaX = clientX - lastMousePosition.x;
                const deltaY = clientY - lastMousePosition.y;
                
                setImagePosition(prev => ({
                    x: prev.x + deltaX,
                    y: prev.y + deltaY
                }));
                
                setLastMousePosition({ x: clientX, y: clientY });
            }
        };

        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
        } else {
            document.body.style.cursor = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
        };
    }, [isDragging, imageZoom, lastMousePosition]);

    useEffect(() => {
        const handleWheel = (e) => {
            if (file && isImage && imageRef.current && containerRef.current?.contains(e.target)) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                setImageZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
            }
        };

        if (isOpen && file && isImage) {
            document.addEventListener('wheel', handleWheel, { passive: false });
            return () => document.removeEventListener('wheel', handleWheel);
        }
    }, [isOpen, file, isImage]);

    if (!isOpen || !file) return null;

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName, extension = null) => {
        const ext = extension || fileName.toLowerCase().split('.').pop();
        if (ext === 'pdf') return FILE_ICONS.pdf;
        const type = Object.keys(FILE_TYPES).find(t => FILE_TYPES[t].includes(ext));
        return FILE_ICONS[type] || FILE_ICONS.default;
    };

    const generateSignedUrl = async (file, isPreview = false) => {
        try {
            // Usar la nueva ruta del DownloadController
            const response = await fetch(`/api/v1/files/${file.hash}/url`);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error generando URL firmada:', error);
            return null;
        }
    };

    const handleDownloadWithSignedUrl = async (file) => {
        try {
            // Intentar primero con URL firmada
            const signedUrl = await generateSignedUrl(file, false);
            if (signedUrl) {
                const link = document.createElement('a');
                link.href = signedUrl;
                link.download = file.name;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Fallback: descarga directa
                const link = document.createElement('a');
                link.href = `/api/v1/files/${file.hash}/download`;
                link.download = file.name;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            if (onDownload) {
                onDownload(file);
            } else {
                alert('Error al descargar el archivo. Por favor, inténtalo de nuevo.');
            }
        }
    };

    const getPreviewUrl = (file) => {
        if (file.hash && previewUrls[file.hash]) return previewUrls[file.hash];
        if (file.hash) return `/files/${file.hash}/signed-route/generate?preview=true`;
        return file.preview || file.url || null;
    };

    const handleZoomIn = () => setImageZoom(prev => Math.min(prev * 1.3, 5));
    const handleZoomOut = () => setImageZoom(prev => Math.max(prev / 1.3, 0.5));
    const handleResetZoom = () => {
        setImageZoom(1);
        setImagePosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        if (imageZoom > 1) {
            setIsDragging(true);
            setLastMousePosition({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handleImageLoad = () => {
        setIsLoading(false);
        setImageError(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setImageError(true);
    };

    const handlePdfLoad = () => setPdfLoading(false);
    const handlePdfError = () => {
        setPdfLoading(false);
        setPdfError(true);
    };

    const getFileMetadata = () => {
        const metadata = [];
        
        if (file.size) {
            metadata.push({ label: 'Tamaño', value: formatFileSize(file.size) });
        }
        
        if (file.extension) {
            metadata.push({ label: 'Tipo', value: file.extension.toUpperCase() });
        }
        
        if (file.created_at) {
            metadata.push({ label: 'Subido', value: new Date(file.created_at).toLocaleDateString() });
        }
        
        return metadata;
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-custom-blackLight rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-custom-gray-light dark:border-custom-gray-darker bg-custom-gray-default dark:bg-custom-blackSemi gap-3 sm:gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Icon 
                            name={getFileIcon(file.name, file.extension)} 
                            size={24} 
                            className="text-custom-blue dark:text-custom-orange flex-shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-medium text-custom-blue dark:text-custom-white truncate">
                                {file.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-custom-gray-dark dark:text-custom-gray-light">
                                <span className="flex-shrink-0">{formatFileSize(file.size)}</span>
                                {file.description && (
                                    <>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="truncate max-w-[200px]">{file.description}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <button
                            onClick={() => handleDownloadWithSignedUrl(file)}
                            className="text-custom-green hover:bg-custom-green/10 rounded-lg p-2 transition-colors"
                            title="Descargar"
                        >
                            <Icon name="Download" size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="text-custom-gray-dark hover:text-red-500 transition-colors rounded-lg p-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <Icon name="X" size={20} className="sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div ref={containerRef} className="p-3 sm:p-4 max-h-[calc(95vh-120px)] sm:max-h-[calc(95vh-100px)] overflow-auto">
                    {isImage ? (
                        <div className="relative">
                            {!imageError && (
                                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg p-1">
                                    <button
                                        onClick={handleZoomOut}
                                        disabled={imageZoom <= 0.5}
                                        className="p-1.5 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Reducir zoom"
                                    >
                                        <Icon name="ZoomOut" size={16} />
                                    </button>
                                    <span className="text-white text-xs px-2 min-w-[3rem] text-center">
                                        {Math.round(imageZoom * 100)}%
                                    </span>
                                    <button
                                        onClick={handleZoomIn}
                                        disabled={imageZoom >= 5}
                                        className="p-1.5 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Aumentar zoom"
                                    >
                                        <Icon name="ZoomIn" size={16} />
                                    </button>
                                    <button
                                        onClick={handleResetZoom}
                                        className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
                                        title="Restablecer zoom"
                                    >
                                        <Icon name="RotateCcw" size={16} />
                                    </button>
                                </div>
                            )}

                            {isLoading && !imageError && (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
                                </div>
                            )}

                            <div className="flex justify-center items-center min-h-[60vh] sm:min-h-[70vh] overflow-hidden">
                                {!imageError ? (
                                    <img
                                        ref={imageRef}
                                        src={getPreviewUrl(file)}
                                        alt={file.name}
                                        className={`max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg shadow-lg transition-transform select-none ${
                                            imageZoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                                        }`}
                                        style={{
                                            transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                                            transformOrigin: 'center center'
                                        }}
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                        onMouseDown={handleMouseDown}
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <Icon name="ImageOff" size={48} className="text-custom-gray-dark dark:text-custom-gray-light mb-4" />
                                        <p className="text-lg text-custom-gray-dark dark:text-custom-gray-light mb-2">
                                            Error al cargar la imagen
                                        </p>
                                        <p className="text-sm text-custom-gray-dark dark:text-custom-gray-light mb-4">
                                            No se pudo cargar la imagen. Intenta descargarla para verla.
                                        </p>
                                        <button
                                            onClick={() => handleDownloadWithSignedUrl(file)}
                                            className="flex items-center gap-2 px-4 py-2 bg-custom-blue hover:bg-custom-blue/90 text-white rounded-lg transition-colors"
                                        >
                                            <Icon name="Download" size={16} />
                                            <span>Descargar imagen</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!imageError && !isLoading && (
                                <div className="text-center mt-4 text-sm text-custom-gray-dark dark:text-custom-gray-light">
                                    <p>Usa la rueda del ratón para hacer zoom • Arrastra para mover la imagen cuando esté ampliada</p>
                                </div>
                            )}
                        </div>
                    ) : isPdf ? (
                        <div className="relative">
                            {pdfLoading && !pdfError && (
                                <div className="absolute inset-0 flex justify-center items-center bg-custom-gray-default/50 dark:bg-custom-blackSemi/50 backdrop-blur-sm z-10">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
                                        <p className="text-sm text-custom-gray-dark dark:text-custom-gray-light">Cargando PDF...</p>
                                    </div>
                                </div>
                            )}

                            {!pdfError ? (
                                <div className="relative">
                                    <iframe
                                        src={getPreviewUrl(file)}
                                        className="w-full h-[60vh] sm:h-[70vh] rounded-lg border border-custom-gray-light dark:border-custom-gray-darker"
                                        title={`Preview of ${file.name}`}
                                        onLoad={handlePdfLoad}
                                        onError={handlePdfError}
                                    />
                                    
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg p-1">
                                        <a
                                            href={getPreviewUrl(file)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-2 py-1 text-white hover:bg-white/20 rounded text-xs transition-colors"
                                            title="Abrir en nueva pestaña"
                                        >
                                            <Icon name="ExternalLink" size={14} />
                                            <span>Abrir</span>
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Icon name="FileX" size={48} className="text-custom-gray-dark dark:text-custom-gray-light mb-4" />
                                    <p className="text-lg text-custom-gray-dark dark:text-custom-gray-light mb-2">
                                        Error al cargar el PDF
                                    </p>
                                    <p className="text-sm text-custom-gray-dark dark:text-custom-gray-light mb-4">
                                        No se pudo cargar el PDF en el navegador. Intenta descargarlo para verlo.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <a
                                            href={previewUrls[file.hash] || `/files/${file.hash}/preview`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-custom-blue hover:bg-custom-blue/90 text-white rounded-lg transition-colors"
                                        >
                                            <Icon name="ExternalLink" size={16} />
                                            <span>Abrir en nueva pestaña</span>
                                        </a>
                                        <button
                                            onClick={() => handleDownloadWithSignedUrl(file)}
                                            className="flex items-center gap-2 px-4 py-2 bg-custom-green hover:bg-custom-green/90 text-white rounded-lg transition-colors"
                                        >
                                            <Icon name="Download" size={16} />
                                            <span>Descargar PDF</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : isVideo ? (
                        <div className="flex justify-center items-center min-h-[60vh] sm:min-h-[70vh]">
                            <video
                                src={getPreviewUrl(file)}
                                controls
                                className="max-w-full max-h-[60vh] sm:max-h-[70vh] rounded-lg shadow-lg"
                                preload="metadata"
                                onError={handleImageError}
                            >
                                Tu navegador no soporta la reproducción de video.
                            </video>
                        </div>
                    ) : isAudio ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Icon name="Music" size={64} className="text-custom-blue dark:text-custom-orange mb-6" />
                            <h3 className="text-xl font-medium text-custom-blue dark:text-custom-white mb-4">
                                {file.name}
                            </h3>
                            <audio
                                src={getPreviewUrl(file)}
                                controls
                                className="mb-6 w-full max-w-md"
                                preload="metadata"
                            >
                                Tu navegador no soporta la reproducción de audio.
                            </audio>
                            <div className="text-sm text-custom-gray-dark dark:text-custom-gray-light">
                                {formatFileSize(file.size)} • {file.extension?.toUpperCase()}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Icon 
                                name={getFileIcon(file.name, file.extension)} 
                                size={64} 
                                className="text-custom-gray-dark dark:text-custom-gray-light mb-6" 
                            />
                            
                            <h3 className="text-xl font-medium text-custom-blue dark:text-custom-white mb-2">
                                {file.name}
                            </h3>
                            
                            <p className="text-custom-gray-dark dark:text-custom-gray-light mb-6 max-w-md">
                                {isOfficeDoc 
                                    ? 'Documento de Office. Descarga el archivo para abrirlo con la aplicación correspondiente.'
                                    : isText
                                    ? 'Archivo de texto. La vista previa no está disponible en el navegador.'
                                    : 'Vista previa no disponible para este tipo de archivo.'
                                }
                            </p>

                            <div className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-lg p-4 mb-6 max-w-sm w-full">
                                <h4 className="text-sm font-medium text-custom-blue dark:text-custom-white mb-3">
                                    Información del archivo
                                </h4>
                                <div className="space-y-2">
                                    {getFileMetadata().map((item, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm">
                                            <span className="text-custom-gray-dark dark:text-custom-gray-light">
                                                {item.label}:
                                            </span>
                                            <span className="text-custom-blue dark:text-custom-white font-medium">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {onDownload && (
                                <button
                                    onClick={() => handleDownloadWithSignedUrl(file)}
                                    className="flex items-center gap-2 px-6 py-3 bg-custom-blue hover:bg-custom-blue/90 text-white rounded-lg transition-colors text-base font-medium"
                                >
                                    <Icon name="Download" size={20} />
                                    <span>Descargar archivo</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
