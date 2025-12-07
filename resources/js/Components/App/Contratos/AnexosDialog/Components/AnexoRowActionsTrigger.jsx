import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye, FileText } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import AnexosDialog from "../AnexosDialog";
import CreateUpdateDialog from "@/Components/App/Contratos/CreateUpdateDialog/CreateUpdateDialog";
import DeleteDialog from "@/Components/App/Contratos/DeleteDialog/DeleteDialog";
import { useDataHandler } from "@/Pages/Admin/Contratos/Index/Context/DataHandlerContext";
import SheetTable from "@/Components/App/Contratos/SheetTable/SheetTable";

export default function AnexoRowActionsTrigger({
    contrato,
    onSaveData,
    canDelete = true,
    showEditActions = true
}) {
    const [anexosDialogOpen, setAnexosDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Usar el contexto global de contratos
    const { deleteItem, fetchData } = useDataHandler();

    const handleEdit = () => {
        setEditDialogOpen(true);
    };

    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const handleView = () => {
        setInfoDialogOpen(true);
    };

    const handleAnexos = () => {
        setAnexosDialogOpen(true);
    };

    const handleEditSuccess = (updatedContrato) => {
        setEditDialogOpen(false);
        // Solo refrescar si es necesario (cuando se actualiza un contrato)
        fetchData();
        if (onSaveData) {
            onSaveData();
        }
    };

    const handleDeleteSuccess = (deletedContrato) => {
        setDeleteDialogOpen(false);
        // Solo eliminar del estado local - NO recargar la tabla
        deleteItem(contrato.id);
        // Ejecutar callback adicional si existe
        if (onSaveData) {
            onSaveData();
        }
    };

    const handleAnexosSuccess = () => {
        setAnexosDialogOpen(false);
        // Solo refrescar si se modificaron anexos
        fetchData();
        if (onSaveData) {
            onSaveData();
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleView}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                    </DropdownMenuItem>
                    
                    {showEditActions && (
                        <DropdownMenuItem onClick={handleEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={handleAnexos}>
                        <FileText className="mr-2 h-4 w-4" />
                        Anexos
                    </DropdownMenuItem>
                    
                    {canDelete && (
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Diálogos */}
            <CreateUpdateDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                model={contrato}
                onSaveData={handleEditSuccess}
            />

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                model={contrato}
                onDelete={handleDeleteSuccess}
            />

            <AnexosDialog
                open={anexosDialogOpen}
                onOpenChange={setAnexosDialogOpen}
                model={contrato.id}
                onSaveData={handleAnexosSuccess}
            />

            <SheetTable
                open={infoDialogOpen}
                onOpenChange={setInfoDialogOpen}
                model={contrato}
                enableToView={true}
            />
        </>
    );
} 