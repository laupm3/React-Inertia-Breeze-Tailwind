import React, { useState } from 'react';
import { Button } from "@/Components/App/Buttons/Button";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter,
    DialogDescription 
} from "@/Components/ui/dialog";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Badge } from "@/Components/ui/badge";
import Icon from '@/imports/LucideIcon';
import { useApprovalActions } from '@/hooks/useApprovalActions';

export const ApprovalActions = ({ 
    solicitudId, 
    currentStatus, 
    userApprovalTypes = [],
    existingApprovals = [],
    pendingApprovals = [],
    onApprovalComplete,
    compact = false 
}) => {
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedApprovalType, setSelectedApprovalType] = useState('');
    const [observacion, setObservacion] = useState('');
    
    const { approveRequest, rejectRequest, isLoading, error } = useApprovalActions();

    // Determinar qué tipos de aprobación puede hacer el usuario actual
    const availableApprovalTypes = userApprovalTypes.filter(type => {
        // Verificar si ya existe una aprobación de este tipo
        const hasExistingApproval = existingApprovals.some(approval => approval.tipo_aprobacion === type);
        return !hasExistingApproval;
    });

    const getApprovalTypeLabel = (type) => {
        const labels = {
            'manager': 'Supervisor/Manager',
            'hr': 'Recursos Humanos',
            'direction': 'Dirección'
        };
        return labels[type] || type;
    };

    const getApprovalStatusIcon = (approval) => {
        if (approval.aprobado) {
            return <Icon name="CheckCircle" size={16} className="text-green-500" />;
        } else {
            return <Icon name="XCircle" size={16} className="text-red-500" />;
        }
    };

    const handleApprovalAction = (action) => {
        setSelectedAction(action);
        setSelectedApprovalType(availableApprovalTypes[0] || '');
        setObservacion('');
        setIsConfirmDialogOpen(true);
    };

    const confirmApproval = async () => {
        if (!selectedApprovalType) {
            return;
        }

        let result;
        if (selectedAction === 'approve') {
            result = await approveRequest(solicitudId, selectedApprovalType, observacion || null);
        } else {
            result = await rejectRequest(solicitudId, selectedApprovalType, observacion);
        }

        if (result) {
            setIsConfirmDialogOpen(false);
            if (onApprovalComplete) {
                onApprovalComplete(result);
            }
        }
    };

    const canApprove = availableApprovalTypes.length > 0 && currentStatus !== 'Aprobado' && currentStatus !== 'Denegado';

    if (compact) {
        return (
            <div className="flex flex-col space-y-2">
                {/* Estado actual de aprobaciones */}
                {existingApprovals.length > 0 && (
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Aprobaciones realizadas:
                        </Label>
                        <div className="flex flex-wrap gap-1">
                            {existingApprovals.map((approval, index) => (
                                <Badge 
                                    key={index} 
                                    variant={approval.aprobado ? "success" : "destructive"}
                                    className="text-xs flex items-center gap-1"
                                >
                                    {getApprovalStatusIcon(approval)}
                                    {getApprovalTypeLabel(approval.tipo_aprobacion)}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                {canApprove && (
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleApprovalAction('approve')}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            <Icon name="Check" size={14} className="mr-1" />
                            Aprobar
                        </Button>
                        <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleApprovalAction('reject')}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            <Icon name="X" size={14} className="mr-1" />
                            Rechazar
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {/* Estado actual de aprobaciones */}
                <div>
                    <Label className="text-sm font-medium mb-2 block">Estado de Aprobaciones</Label>
                    <div className="space-y-2">
                        {existingApprovals.length > 0 ? (
                            existingApprovals.map((approval, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <div className="flex items-center gap-2">
                                        {getApprovalStatusIcon(approval)}
                                        <span className="text-sm font-medium">
                                            {getApprovalTypeLabel(approval.tipo_aprobacion)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {approval.approved_by_name} • {new Date(approval.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                No hay aprobaciones registradas
                            </div>
                        )}
                    </div>
                </div>

                {/* Aprobaciones pendientes */}
                {pendingApprovals.length > 0 && (
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Aprobaciones Pendientes</Label>
                        <div className="flex flex-wrap gap-1">
                            {pendingApprovals.map((type, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    <Icon name="Clock" size={12} className="mr-1" />
                                    {getApprovalTypeLabel(type)}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                {canApprove && (
                    <div className="flex gap-3">
                        <Button 
                            variant="success"
                            onClick={() => handleApprovalAction('approve')}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            <Icon name="Check" size={16} className="mr-2" />
                            Aprobar Solicitud
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={() => handleApprovalAction('reject')}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            <Icon name="X" size={16} className="mr-2" />
                            Rechazar Solicitud
                        </Button>
                    </div>
                )}

                {!canApprove && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                        {currentStatus === 'Aprobado' && "Esta solicitud ya ha sido aprobada"}
                        {currentStatus === 'Denegado' && "Esta solicitud ha sido rechazada"}
                        {availableApprovalTypes.length === 0 && currentStatus !== 'Aprobado' && currentStatus !== 'Denegado' && 
                            "No tienes permisos para aprobar esta solicitud o ya has realizado tu aprobación"}
                    </div>
                )}

                {error && (
                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                        {error}
                    </div>
                )}
            </div>

            {/* Diálogo de confirmación */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedAction === 'approve' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedAction === 'approve' 
                                ? 'Estás a punto de aprobar esta solicitud de permiso.'
                                : 'Estás a punto de rechazar esta solicitud de permiso. Por favor, proporciona una razón.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {availableApprovalTypes.length > 1 && (
                            <div>
                                <Label htmlFor="approval-type">Tipo de Aprobación</Label>
                                <Select value={selectedApprovalType} onValueChange={setSelectedApprovalType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el tipo de aprobación" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableApprovalTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {getApprovalTypeLabel(type)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="observacion">
                                {selectedAction === 'approve' ? 'Observaciones (opcional)' : 'Motivo del rechazo (obligatorio)'}
                            </Label>
                            <Textarea
                                id="observacion"
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                                placeholder={selectedAction === 'approve' 
                                    ? 'Añade cualquier observación relevante...'
                                    : 'Explica por qué se rechaza la solicitud...'
                                }
                                required={selectedAction === 'reject'}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsConfirmDialogOpen(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant={selectedAction === 'approve' ? 'success' : 'destructive'}
                            onClick={confirmApproval}
                            disabled={isLoading || (selectedAction === 'reject' && !observacion.trim())}
                        >
                            {isLoading && <Icon name="Loader2" size={16} className="mr-2 animate-spin" />}
                            {selectedAction === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ApprovalActions;
