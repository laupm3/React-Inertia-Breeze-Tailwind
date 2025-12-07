import { Button } from "@/Components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import Icon from '@/imports/LucideIcon';

/**
 * Componente de acciones para los anexos del contrato.
 * 
 * Proporciona un menú desplegable con las opciones disponibles:
 * - Información: Abre el SheetTable del empleado/contrato
 * - Editar: Abre el dialog de edición del contrato
 * - Añadir Anexo: Crea un nuevo anexo
 * - Eliminar: Elimina el anexo actual (si hay más de uno)
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onEdit - Función para abrir el dialog de edición
 * @param {Function} props.onDelete - Función para eliminar el anexo actual
 * @param {Function} props.onAdd - Función para añadir un nuevo anexo
 * @param {Function} props.onInfo - Función para mostrar información del contrato/empleado
 * @param {Object} props.empleado - Datos del empleado (opcional, para validaciones futuras)
 * @param {boolean} props.canDelete - Si se puede eliminar el anexo actual
 * @param {boolean} props.showEditActions - Si se deben mostrar los botones de editar y eliminar
 * @returns {JSX.Element} Componente de acciones del anexo
 */
export default function AnexoActions({ 
    onEdit, 
    onDelete, 
    onAdd, 
    onInfo,
    canDelete = true,
    showEditActions = true // Nueva prop para controlar la visibilidad de editar/eliminar
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Icon name="Ellipsis" className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onInfo}>
                    <Icon name="Info" className="h-4 w-4" />
                    Información
                </DropdownMenuItem>
                {showEditActions && (
                    <DropdownMenuItem onSelect={onEdit}>
                        <Icon name="SquarePen" className="h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={onAdd}>
                    <Icon name="Plus" className="h-4 w-4" />
                    Añadir Anexo
                </DropdownMenuItem>
                {showEditActions && canDelete && (
                    <DropdownMenuItem 
                        onSelect={onDelete} 
                        className="text-red-500 dark:text-red-400"
                    >
                        <Icon name="Trash" className="h-4 w-4" />
                        Eliminar
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 