import { useDataTable } from "../../../Context/DataTableContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";

export default function RowActionsTrigger({
    model
}) {

    const { viewContext } = useDataTable();

    const {
        handleCreateUpdateView,
        handleSheetView,
        handleDestroyView,
        CreateUpdateViewComponent,
        SheetTableViewComponent,
        DeleteViewComponent
    } = viewContext;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="btn hover:bg-custom-gray-semiLight dark:hover:bg-custom-blackSemi/50 rounded-full h-6 w-6 flex items-center justify-center focus:outline-none focus:ring-0 focus:ring-offset-0"
                >
                    <Icon name="Ellipsis" className="w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="dark:bg-custom-blackSemi"
                onClick={(e => e.stopPropagation())}
            >
                {SheetTableViewComponent &&
                    <DropdownMenuItem
                        onSelect={() => handleSheetView(model)}
                    >
                        <Icon name="Info" className="w-4 mr-2" /> Información
                    </DropdownMenuItem>
                }
                {CreateUpdateViewComponent &&
                    <DropdownMenuItem
                        onSelect={() => handleCreateUpdateView(model)}
                    >
                        <Icon name="SquarePen" className="w-4 mr-2" /> Editar
                    </DropdownMenuItem>
                }
                {DeleteViewComponent &&
                    <DropdownMenuItem
                        className="text-red-500 font-bold hover:!bg-red-500/40 hover:!text-red-500"
                        onSelect={() => handleDestroyView(model)}
                    >
                        <Icon name="X" className="w-4 mr-2" /> Eliminar
                    </DropdownMenuItem>
                }
                {/* Add more DropdownMenuItem as needed */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}