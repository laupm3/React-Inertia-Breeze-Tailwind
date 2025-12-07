import { useState } from "react";
import { Button } from "@/Components/App/Buttons/Button";
import AnexosDialog from "@/Components/App/Contratos/AnexosDialog/AnexosDialog";
import CreateUpdateDialog from "@/Components/App/Contratos/CreateUpdateDialog/CreateUpdateDialog";
import SheetTable from "@/Components/App/Contratos/SheetTable/SheetTable";
import axios from "axios";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function ActionsCell({ row, onSaveData, onDelete }) {
    const contrato = row.original;
    const [anexosDialogOpen, setAnexosDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = () => setEditDialogOpen(true);
    const handleDelete = () => setDeleteDialogOpen(true);
    const handleAddAnexo = () => setAnexosDialogOpen(true);
    const handleInfo = () => setInfoDialogOpen(true);

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await axios.delete(route('api.v1.admin.contratos.destroy', { contrato: contrato.id }));
            toast.success('Contrato eliminado correctamente');
            onDelete(contrato.id);
            setDeleteDialogOpen(false);
        } catch (error) {
            toast.error('Error al eliminar el contrato');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleInfo}>Información</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleEdit}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleAddAnexo}>Añadir anexo</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AnexosDialog
                open={anexosDialogOpen}
                model={contrato.id}
                onOpenChange={setAnexosDialogOpen}
                onSaveData={onSaveData}
            />

            <CreateUpdateDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                model={contrato}
                onSaveData={onSaveData}
            />

            <SheetTable
                open={infoDialogOpen}
                onOpenChange={setInfoDialogOpen}
                model={contrato}
                enableToView={infoDialogOpen}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar contrato?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar este contrato? Esta acción eliminará permanentemente el contrato del empleado <strong>{contrato.empleado?.nombre} {contrato.empleado?.primerApellido}</strong> con número de expediente <strong>{contrato.n_expediente}</strong>.
                            <br /><br />
                            <span className="text-red-600 font-medium">Esta acción no se puede deshacer.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar contrato'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
