import { useState } from "react";
import { useDataHandler } from "../Context/DataHandlerContext";
import Icon from "@/imports/LucideIcon";
import ApprovalConfirmationDialog from "./ApprovalConfirmationDialog";

export default function ApprovalActionsFooter({ 
    solicitud, 
    onClose = null,
    className = "px-6 py-4 border-t dark:border-gray-700" 
}) {
    const { userApprovalTypes, getApprovalTypeInfo, handleDropdownAction, isProcessingApproval } = useDataHandler();
    const [confirmationDialog, setConfirmationDialog] = useState({
        isOpen: false,
        approvalType: null,
        action: null
    });

    if (!solicitud) return null;

    const estadoNombre = solicitud.estado?.nombre;
    const isFinalized = ["Aprobado", "Denegado"].includes(estadoNombre);

    // Función para abrir el diálogo de confirmación
    const openConfirmationDialog = (approvalType, action) => {
        setConfirmationDialog({
            isOpen: true,
            approvalType,
            action
        });
    };

    // Función para cerrar el diálogo de confirmación
    const closeConfirmationDialog = () => {
        setConfirmationDialog({
            isOpen: false,
            approvalType: null,
            action: null
        });
    };

    // Función para confirmar la acción
    const handleConfirmAction = (observaciones) => {
        handleDropdownAction(solicitud, confirmationDialog.approvalType, confirmationDialog.action, observaciones);
        closeConfirmationDialog();
        
        // Cerrar el diálogo padre si se proporciona la función
        if (onClose) {
            setTimeout(() => onClose(), 1000); // Pequeño delay para mostrar el resultado
        }
    };

    // Función para obtener información de aprobación existente
    const getApprovalInfo = () => {
        if (!solicitud.aprobaciones || solicitud.aprobaciones.length === 0) {
            return {};
        }

        const approvalsByType = {};
        solicitud.aprobaciones.forEach(aprobacion => {
            approvalsByType[aprobacion.tipo_aprobacion] = {
                ...aprobacion,
                typeInfo: getApprovalTypeInfo(aprobacion.tipo_aprobacion)
            };
        });
        
        return approvalsByType;
    };

    // Función para verificar si un tipo específico ya fue aprobado/denegado
    const getApprovalStatusForType = (approvalType) => {
        const approvalsByType = getApprovalInfo();
        return approvalsByType[approvalType] || null;
    };

    const approvalsByType = getApprovalInfo();

    // Si está finalizada, mostrar información de la aprobación/denegación final
    if (isFinalized && Object.keys(approvalsByType).length > 0) {
        const finalApproval = Object.values(approvalsByType).find(approval => 
            approval.aprobado === (estadoNombre === "Aprobado")
        ) || Object.values(approvalsByType)[0];
        
        const isApproved = estadoNombre === "Aprobado";
        
        return (
            <div className={className}>
                <div className="w-full max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className={`flex items-center gap-3 ${isApproved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            <Icon 
                                name={isApproved ? "CheckCircle2" : "XCircle"} 
                                size={24} 
                            />
                            <span className="font-medium text-lg">
                                {isApproved ? 'Solicitud Aprobada' : 'Solicitud Denegada'}
                            </span>
                        </div>
                        
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <div className="flex items-center gap-2 justify-center">
                                <Icon name={finalApproval.typeInfo.icon} size={18} />
                                <span>Por {finalApproval.typeInfo.label}</span>
                            </div>
                            
                            {finalApproval.usuario_aprobador && (
                                <div className="text-base font-medium text-gray-700 dark:text-gray-200">
                                    {finalApproval.usuario_aprobador.name}
                                </div>
                            )}
                            
                            {finalApproval.fecha_aprobacion && (
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                    {new Date(finalApproval.fecha_aprobacion).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            )}
                            
                            {finalApproval.observacion && (
                                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm italic max-w-md mx-auto">
                                    "{finalApproval.observacion}"
                                </div>
                            )}
                        </div>

                        {/* Mostrar resumen de todas las aprobaciones */}
                        {Object.keys(approvalsByType).length > 1 && (
                            <div className="mt-6 w-full">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                                    Historial de Aprobaciones:
                                </div>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {Object.values(approvalsByType).map((approval, index) => (
                                        <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${approval.aprobado ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
                                            <Icon name={approval.typeInfo.icon} size={14} />
                                            <span>{approval.typeInfo.label}</span>
                                            <Icon name={approval.aprobado ? "Check" : "X"} size={14} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Si no está finalizada, mostrar interfaz de aprobación con estados detallados
    if (!isFinalized && userApprovalTypes && userApprovalTypes.length > 0) {
        return (
            <>
                <div className={className}>
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-6">
                            Estado de Aprobaciones
                        </div>
                        
                        {/* Grid responsivo para las aprobaciones */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                            {userApprovalTypes
                                .sort((a, b) => getApprovalTypeInfo(a).order - getApprovalTypeInfo(b).order)
                                .map((approvalType) => {
                                    const typeInfo = getApprovalTypeInfo(approvalType);
                                    const existingApproval = getApprovalStatusForType(approvalType);
                                    
                                    // Si ya existe aprobación para este tipo, mostrar estado
                                    if (existingApproval) {
                                        const isApproved = existingApproval.aprobado;
                                        return (
                                            <div key={approvalType} className="flex flex-col items-center gap-3 w-full max-w-[200px]">
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}>
                                                    <Icon name={isApproved ? "Check" : "X"} size={24} className="text-white" />
                                                </div>
                                                <div className="flex flex-col items-center text-center space-y-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Icon name={typeInfo.icon} size={16} className="text-gray-600 dark:text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {typeInfo.label}
                                                        </span>
                                                    </div>
                                                    <div className={`text-sm font-semibold ${isApproved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {isApproved ? 'Aprobado' : 'Denegado'}
                                                    </div>
                                                    {existingApproval.usuario_aprobador && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-full break-words">
                                                            por {existingApproval.usuario_aprobador.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // Si no existe aprobación, mostrar botones
                                    return (
                                        <div key={approvalType} className="flex flex-col items-center gap-3 w-full max-w-[200px]">
                                            <div className="flex items-center gap-3 justify-center">
                                                <button 
                                                    onClick={() => openConfirmationDialog(approvalType, 'aprobar')}
                                                    disabled={isProcessingApproval}
                                                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                                    title={`Aprobar como ${typeInfo.label}`}
                                                >
                                                    {isProcessingApproval ? (
                                                        <Icon name="MoreHorizontal" size={20} className="animate-spin" />
                                                    ) : (
                                                        <Icon name="ThumbsUp" size={20} />
                                                    )}
                                                </button>
                                                
                                                <button 
                                                    onClick={() => openConfirmationDialog(approvalType, 'denegar')}
                                                    disabled={isProcessingApproval}
                                                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                                    title={`Denegar como ${typeInfo.label}`}
                                                >
                                                    {isProcessingApproval ? (
                                                        <Icon name="MoreHorizontal" size={20} className="animate-spin" />
                                                    ) : (
                                                        <Icon name="ThumbsDown" size={20} />
                                                    )}
                                                </button>
                                            </div>
                                            
                                            <div className="flex flex-col items-center text-center space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Icon name={typeInfo.icon} size={16} className="text-gray-600 dark:text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {typeInfo.label}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Pendiente
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        
                        {/* Mostrar aprobaciones existentes de otros tipos si las hay */}
                        {Object.keys(approvalsByType).length > 0 && (
                            <div className="mt-6 text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {Object.keys(approvalsByType).length === 1 
                                        ? "1 aprobación registrada" 
                                        : `${Object.keys(approvalsByType).length} aprobaciones registradas`
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Diálogo de confirmación reutilizable */}
                <ApprovalConfirmationDialog
                    isOpen={confirmationDialog.isOpen}
                    onClose={closeConfirmationDialog}
                    onConfirm={handleConfirmAction}
                    solicitud={solicitud}
                    approvalType={confirmationDialog.approvalType}
                    action={confirmationDialog.action}
                    isProcessing={isProcessingApproval}
                />
            </>
        );
    }

    // Si no tiene permisos o no hay datos, no mostrar nada
    return null;
}
