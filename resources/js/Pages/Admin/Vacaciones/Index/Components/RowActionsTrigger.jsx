import { useState } from "react";
import { useDataTable } from "@/Components/App/DataTable/Context/DataTableContext";
import { useDataHandler } from "../Context/DataHandlerContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuPortal
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import ApprovalConfirmationDialog from "./ApprovalConfirmationDialog";

export default function RowActionsTrigger({ model }) {

    const { viewContext } = useDataTable();
    const { 
        userApprovalTypes, 
        getApprovalTypeInfo, 
        handleDropdownAction, 
        isProcessingApproval,
        handleDeleteView
    } = useDataHandler();
    const [confirmationDialog, setConfirmationDialog] = useState({
        isOpen: false,
        approvalType: null,
        action: null
    });

    const {
        handleCreateUpdateView,
        handleSheetView
    } = viewContext;

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
        handleDropdownAction(model, confirmationDialog.approvalType, confirmationDialog.action, observaciones);
        closeConfirmationDialog();
    };

    // Función para renderizar los items de aprobación dinámicamente
    const renderApprovalItems = (action) => {
        if (!userApprovalTypes || userApprovalTypes.length === 0) {
            return null;
        }

        return userApprovalTypes
            .sort((a, b) => getApprovalTypeInfo(a).order - getApprovalTypeInfo(b).order)
            .map((approvalType) => {
                const typeInfo = getApprovalTypeInfo(approvalType);
                
                return (
                    <DropdownMenuItem 
                        key={approvalType}
                        onSelect={() => openConfirmationDialog(approvalType, action)}
                        disabled={isProcessingApproval}
                    >
                        {isProcessingApproval ? (
                            <Icon name="MoreHorizontal" className="w-4 mr-2 animate-spin" />
                        ) : (
                            <Icon name={typeInfo.icon} className="w-4 mr-2" />
                        )}
                        {typeInfo.label}
                    </DropdownMenuItem>
                );
            });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild >
                    <button className="btn">
                        <Icon name="Ellipsis" className="w-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-custom-blackSemi" side="bottom" align="end">
                {/* Solo mostrar opciones de aprobación si el usuario tiene tipos de aprobación */}
                {userApprovalTypes && userApprovalTypes.length > 0 && (
                    <>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Icon name="ThumbsUp" className="w-4 mr-2" /> Aprobar como
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="dark:bg-custom-blackSemi">
                                    {renderApprovalItems('aprobar')}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Icon name="ThumbsDown" className="w-4 mr-2" /> Denegar como
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="dark:bg-custom-blackSemi">
                                    {renderApprovalItems('denegar')}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </>
                )}
                
                <DropdownMenuItem
                    onSelect={() => handleCreateUpdateView(model)}
                >
                    <Icon name="SquarePen" className="w-4 mr-2" /> Editar
                </DropdownMenuItem>
                
                <DropdownMenuItem
                    className="text-red-500 font-bold hover:!bg-red-500/40 hover:!text-red-500"
                    onSelect={() => handleDeleteView(model)}
                >
                    <Icon name="X" className="w-4 mr-2" /> Eliminar
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Diálogo de confirmación reutilizable */}
            <ApprovalConfirmationDialog
                isOpen={confirmationDialog.isOpen}
                onClose={closeConfirmationDialog}
                onConfirm={handleConfirmAction}
                solicitud={model}
                approvalType={confirmationDialog.approvalType}
                action={confirmationDialog.action}
                isProcessing={isProcessingApproval}
            />
        </>
    );
}