import { toast } from 'sonner';
import { Button } from "@/Components/App/Buttons/Button";

import Icon from "@/imports/LucideIcon";

/**
 * @component NotificationPermissionToast
 * @description Componente optimizado con clases nativas de Tailwind
 * Menos código CSS personalizado, más clases estándar
 */
export const NotificationPermissionToast = {
    /**
     * Toast principal de recomendación
     */
    showRecommendation: () => {
        const toastId = toast(
            <div className="w-full p-2 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <Icon name="Bell" className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-red-900 mb-2">
                            ¡Activa las notificaciones!
                        </h3>
                        <div className="text-sm text-red-800 space-y-2">
                            <p className="font-medium text-red-700">
                                📅 Nunca te pierdas un evento importante
                            </p>
                            <ul className="text-xs text-red-700 space-y-1">
                                <li>• Recibe avisos cuando el navegador esté minimizado</li>
                                <li>• Notificaciones de nuevos eventos del calendario</li>
                                <li>• Alertas importantes del sistema</li>
                            </ul>

                            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                <p className="text-sm font-medium text-red-900 mb-1 flex items-center">
                                    <Icon name="Lightbulb" className="w-4 h-4 mr-1" />
                                    ¿Cómo activar?
                                </p>
                                <ol className="text-xs text-red-800 space-y-1">
                                    <li>1. Haz clic en el candado 🔓 o dialogo 💬 la barra de direcciones</li>
                                    <li>2. Busca "Notificaciones" y selecciona "Permitir"</li>
                                    <li>3. ¡Listo! Ya recibirás notificaciones importantes</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={async () => {
                            try {
                                const permission = await Notification.requestPermission();
                                if (permission === 'granted') {
                                    toast.dismiss(toastId);
                                    toast.success(
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                <Icon name="Check" className="w-3 h-3 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm text-green-900">
                                                    ¡Notificaciones activadas!
                                                </div>
                                                <div className="text-xs text-green-800">
                                                    Ya recibirás alertas importantes
                                                </div>
                                            </div>
                                        </div>, {
                                        duration: 4000,
                                        style: {
                                            backgroundColor: '#fee2e2',
                                            border: 'none',
                                        }
                                    }
                                    );
                                } else {
                                    toast.info(
                                        <div className="flex items-start gap-3">
                                            <Icon name="Info" className="w-5 h-5 text-red-600 flex-shrink-0" />
                                            <div className="text-sm text-red-800">
                                                También puedes activarlas manualmente haciendo clic en el candado 🔒
                                            </div>
                                        </div>,
                                        {
                                            duration: 6000,
                                            style: {
                                                backgroundColor: '#fee2e2',
                                                border: 'none',
                                            }
                                        }
                                    );
                                }
                            } catch (error) {
                                toast.error(
                                    <div className="flex items-start gap-3">
                                        <Icon name="AlertCircle" className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        <div className="text-sm text-red-800">
                                            Error al solicitar permisos. Inténtalo manualmente desde el candado 🔒
                                        </div>
                                    </div>,
                                    {
                                        duration: 5000,
                                        style: { backgroundColor: '#fee2e2', border: 'none' }
                                    }
                                );
                            }
                        }}
                    >
                        <Icon name="Bell" className="w-4 h-4 mr-1" />
                        Activar ahora
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toast.dismiss(toastId)}
                    >
                        Después
                    </Button>
                </div>            </div>,
            {
                duration: Infinity,
                position: 'top-center',
                style: {
                    width: '420px',
                    backgroundColor: '#fee2e2',
                    border: `2px solid ${document.documentElement.classList.contains('dark') ? '#FB7D16' : '#002048'}`,
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
            }
        );

        return toastId;
    },

    /**
     * Toast cuando las notificaciones están bloqueadas
     */
    showBlocked: () => {
        const toastId = toast(
            <div className="w-full p-2 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <Icon name="BellOff" className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-red-700 mb-2">
                            Notificación bloqueada
                        </h3>
                        <div className="text-sm text-gray-700  space-y-2">
                            <p className="text-gray-800">
                                Se intentó enviar una notificación pero están deshabilitadas.
                            </p>
                            <div className="bg-red-50 border border-red-200  rounded-lg p-3">
                                <p className="text-sm font-medium text-red-800 mb-1 flex items-center">
                                    <Icon name="Settings" className="w-4 h-4 mr-1" />
                                    Para activarlas:
                                </p>
                                <ol className="text-xs text-red-700 space-y-1">
                                    <li>1. Haz clic en el candado 🔒 en la barra de direcciones</li>
                                    <li>2. Busca "Notificaciones" → Cambiar a "Permitir"</li>
                                    <li>3. Recarga la página</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                            toast.info(
                                <div className="flex items-start gap-3">
                                    <Icon name="Info" className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        Busca el ícono 🔒 en la barra de direcciones → Configuración del sitio → Notificaciones → Permitir
                                    </div>
                                </div>, {
                                duration: 8000,
                                style: { backgroundColor: '#BBD2EC', border: 'none' }
                            }
                            );
                        }}
                    >
                        <Icon name="ExternalLink" className="w-4 h-4 mr-1" />                        Ver instrucciones
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600"
                        onClick={() => toast.dismiss(toastId)}
                    >
                        Entendido
                    </Button>
                </div>            </div>,
            {
                duration: Infinity,
                position: 'top-center',
                style: {
                    width: '400px',
                    backgroundColor: '#fee2e2',
                    border: '2px solid #ef4444',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
            }
        );

        return toastId;
    },

    /**
     * Toast cuando rechaza permisos
     */
    showRejected: () => {
        const toastId = toast(
            <div className="w-full p-2 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <Icon name="X" className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-red-900 mb-2">
                            Notificaciones rechazadas
                        </h3>
                        <div className="text-sm text-red-700 space-y-2">
                            <p className="text-red-800">
                                Has rechazado las notificaciones. Sin ellas, podrías perderte eventos importantes.
                            </p>
                            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                <p className="text-sm font-medium text-red-900 mb-1 flex items-center">
                                    <Icon name="RotateCcw" className="w-4 h-4 mr-1" />
                                    Para cambiar tu decisión:
                                </p>
                                <p className="text-xs text-red-800">
                                    Configuración del navegador → Privacidad → Configuración del sitio → Notificaciones → Permitir
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                        onClick={() => {
                            toast.info(
                                <div className="flex items-start gap-3">
                                    <Icon name="Settings" className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <div className="text-sm text-red-800">
                                        Ve a la configuración del navegador para cambiar los permisos
                                    </div>
                                </div>,
                                {
                                    duration: 6000,
                                    style: { backgroundColor: '#fee2e2', border: 'none' }
                                }
                            );
                        }}
                    >
                        <Icon name="Settings" className="w-4 h-4 mr-1" />                        Configurar
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600"
                        onClick={() => toast.dismiss(toastId)}
                    >
                        Entendido
                    </Button>
                </div>
            </div>, {
            duration: Infinity,
            position: 'top-center',
            style: {
                width: '400px',
                backgroundColor: '#fee2e2',
                border: '2px solid #f97316',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
        }
        );

        return toastId;
    },

    /**
     * Toast navegador incompatible
     */
    showUnsupported: () => {
        const toastId = toast(
            <div className="w-full p-2 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                        <Icon name="AlertTriangle" className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-red-800 mb-2">
                            Navegador no compatible
                        </h3>
                        <div className="text-sm text-red-700 space-y-2">
                            <p className="text-red-800">
                                Tu navegador no soporta notificaciones del sistema.
                            </p>
                            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                <p className="text-sm font-medium text-red-800 mb-1">
                                    Recomendamos usar:
                                </p>
                                <div className="text-xs text-red-700 space-y-1">
                                    <p>• Chrome (recomendado) • Firefox • Edge • Opera</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                <div className="flex justify-end">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600"
                        onClick={() => toast.dismiss(toastId)}
                    >
                        Entendido
                    </Button>
                </div>
            </div>, {
            duration: Infinity,
            position: 'top-center',
            style: {
                width: '380px',
                backgroundColor: '#fee2e2',
                border: '2px solid #9ca3af',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
        }
        );

        return toastId;
    },
};
