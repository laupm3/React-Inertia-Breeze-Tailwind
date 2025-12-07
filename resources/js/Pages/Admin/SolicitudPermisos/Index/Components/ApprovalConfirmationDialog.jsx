import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import Icon from '@/imports/LucideIcon';

/**
 * Componente reutilizable para confirmación de aprobaciones/denegaciones
 * Puede usarse desde dropdowns, botones, etc.
 */
export default function ApprovalConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    solicitud,
    approvalType, // 'Direccion', 'RRHH', 'Administrador'
    action, // 'aprobar', 'denegar'
    isProcessing = false
}) {
    const [observaciones, setObservaciones] = useState('');

    const handleConfirm = () => {
        onConfirm(observaciones);
        setObservaciones(''); // Limpiar para próxima vez
    };

    const handleClose = () => {
        setObservaciones(''); // Limpiar al cerrar
        onClose();
    };

    const isApproval = action === 'aprobar';
    const actionText = isApproval ? 'Aprobar' : 'Denegar';
    const iconName = isApproval ? 'ThumbsUp' : 'ThumbsDown';
    const buttonColor = isApproval ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-custom-white dark:bg-custom-blackLight text-custom-blue dark:text-custom-white max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Icon name={iconName} className="w-5 h-5" />
                        Confirmación de acción
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                        {isApproval 
                            ? `¿Está seguro que desea aprobar esta solicitud como ${approvalType}?`
                            : `Escriba las observaciones de denegación para esta solicitud como ${approvalType}.`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Información de la solicitud */}
                    {solicitud && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm font-medium">
                                {solicitud.empleado?.nombreCompleto || 'Empleado no disponible'}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {solicitud.permiso?.nombre || 'Tipo de permiso no disponible'}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {solicitud.fecha_inicio ? new Date(solicitud.fecha_inicio).toLocaleDateString('es-ES') : ''} - {solicitud.fecha_fin ? new Date(solicitud.fecha_fin).toLocaleDateString('es-ES') : ''}
                            </p>
                        </div>
                    )}

                    {/* Campo de observaciones (obligatorio para denegación, opcional para aprobación) */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {isApproval ? 'Observaciones (opcional)' : 'Observaciones de denegación *'}
                        </label>
                        <div className="relative">
                            <Textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder={
                                    isApproval 
                                        ? "Escribe aquí las observaciones de aprobación (opcional)..."
                                        : "Escribe aquí las observaciones de denegación..."
                                }
                                className="resize-none bg-custom-gray-light dark:bg-custom-blackSemi text-custom-blue dark:text-custom-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16"
                                rows={4}
                                maxLength={250}
                            />
                            <div className="absolute bottom-2 right-3 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
                                {observaciones.length}/250
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        onClick={handleConfirm}
                        disabled={isProcessing || (!isApproval && !observaciones.trim())}
                        className={`text-white bg-custom-orange rounded-full hover:bg-custom-orange/90`}
                    >
                        {isProcessing ? (
                            <Icon name="MoreHorizontal" className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Icon name={iconName} className="w-4 h-4 mr-2" />
                        )}
                        {actionText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
