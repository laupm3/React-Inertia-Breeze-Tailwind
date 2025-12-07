import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/Components/App/Buttons/Button';

/**
 * Componente para manejar el estado de las exportaciones en cola
 * 
 * @param {boolean} isVisible - Si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onFinish - Función llamada cuando la exportación termina
 * @param {function} onDownload - Función llamada cuando se descarga el archivo
 * @param {string} filename - Nombre del archivo a exportar
 * @param {number} estimatedTime - Tiempo estimado en segundos
 * @param {string} checkStatusUrl - URL para verificar el estado
 * @param {string} entity - Entidad siendo exportada
 */
const ExportQueueHandler = ({ 
    isVisible, 
    onClose,
    onFinish,
    onDownload,
    filename, 
    estimatedTime, 
    checkStatusUrl,
    entity = 'empleados'
}) => {
    const [status, setStatus] = useState('processing');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('Preparando exportación...');
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [error, setError] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [hasAutoDownloaded, setHasAutoDownloaded] = useState(false);
    
    const intervalRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const echoChannelRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    const cleanupListeners = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        if (echoChannelRef.current) {
            echoChannelRef.current.stopListening('.notification');
        }
        if (window.Echo) {
            const userId = document.querySelector('meta[name="user-id"]')?.getAttribute('content');
            if (userId) {
                window.Echo.leave(`App.Models.User.${userId}`);
            }
        }
    };

    useEffect(() => {
        if (filename) {
            startMonitoring();
            setupEchoListener();
            startPolling();
        }
        return () => {
            cleanupListeners();
        };
    }, [filename]);

    useEffect(() => {
        if (isVisible) {
            const timer = setInterval(() => {
                setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isVisible]);

    useEffect(() => {
        if (status === 'completed' && downloadUrl && !hasAutoDownloaded) {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.info(`La descarga de ${filename} ha comenzado.`);
            if (onDownload) onDownload(filename);
            setHasAutoDownloaded(true);
            setProgress(100);
            setTimeout(() => { onClose(); }, 2000);
        }
    }, [status, downloadUrl, filename, onDownload, hasAutoDownloaded, onClose]);

    const setupEchoListener = () => {
        if (window.Echo) {
            const userId = document.querySelector('meta[name="user-id"]')?.getAttribute('content');
            if (userId) {
                const channel = window.Echo.private(`App.Models.User.${userId}`);
                echoChannelRef.current = channel;
                
                channel.notification((notification) => {
                    if (notification.type === 'App\\Notifications\\SystemNotification' && 
                        notification.data?.exportType === entity) {
                        const { status: notificationStatus, message: notificationMessage, downloadUrl: notificationDownloadUrl } = notification.data;
                        setStatus(notificationStatus);
                        setMessage(notificationMessage);
                        if (notificationStatus === 'completed') {
                            setProgress(100);
                            setStatus('completed');
                            setDownloadUrl(notificationDownloadUrl);
                            setMessage('¡Exportación completada!');
                            toast.success('¡Exportación completada! El archivo está listo para descargar.');
                            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                        } else if (notificationStatus === 'failed') {
                            setError(notificationMessage);
                            toast.error('Error en la exportación: ' + notificationMessage);
                            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                        }
                    }
                });
            }
        }
    };

    const startPolling = async () => {
        pollingIntervalRef.current = setInterval(async () => {
            try {
                console.log(`[Polling] Verificando archivo: ${filename}`);
                const response = await axios.get(`/api/v1/admin/export/${entity}/recent-files`, { 
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) return;
                if (!response.data || !Array.isArray(response.data.files)) return;
                const foundFile = response.data.files.find(file => file.filename === filename);
                if (foundFile) {
                    setStatus('completed');
                    setProgress(100);
                    setDownloadUrl(foundFile.downloadUrl);
                    setMessage('¡Exportación completada!');
                    toast.success('¡Exportación completada! El archivo está listo para descargar.');
                    clearInterval(pollingIntervalRef.current);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                }
            } catch (error) {
                if (error.response && error.response.status === 401) return;
            }
        }, 3000);
    };

    const startMonitoring = () => {
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + (100 / (estimatedTime * 10));
                return Math.min(newProgress, 95);
            });
        }, 100);
        intervalRef.current = progressInterval;
    };

    const handleHideModal = () => {
        cleanupListeners();
        onClose();
    };
    
    const handleFinishAndClose = () => {
        cleanupListeners();
        
        if (onFinish) {
            onFinish(filename);
        }
        onClose();
    };

    const handleDownloadClick = () => {
        if (onDownload) onDownload(filename);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Exportación en Proceso
                    </h3>
                    <button
                        onClick={handleHideModal}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {message}
                    </p>
                    
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Tiempo transcurrido: {formatTime(timeElapsed)}</span>
                        <span>Tiempo estimado: {formatTime(estimatedTime)}</span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-custom-orange h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${status === 'completed' ? 100 : progress}%` }}
                        />
                    </div>
                    
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {status === 'completed' ? '100% completado' : `${Math.round(progress)}% completado`}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {status === 'completed' && downloadUrl && (
                    <div className="my-4 text-center">
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 font-medium">
                            ¡Exportación completada!
                        </p>
                        <Button
                            asChild
                            variant="primary"
                            className="w-full"
                            onClick={handleDownloadClick}
                        >
                            <a 
                                href={downloadUrl} 
                                download={filename}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Volver a descargar
                            </a>
                        </Button>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="flex items-center justify-center my-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-custom-orange"></div>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            Procesando...
                        </span>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        onClick={status === 'completed' ? handleFinishAndClose : handleHideModal}
                        variant="secondary"
                    >
                        {status === 'completed' ? 'Finalizar' : 'Cerrar'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExportQueueHandler; 