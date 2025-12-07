import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";
import { useDataTable } from "../../Context/DataTableContext";

export default function CreateButton({ }) {

    const { viewContext } = useDataTable();

    const {
        handleCreateUpdateView,
    } = viewContext;

    return (
        <div className="flex gap-4">
            <Button
                onClick={() => handleCreateUpdateView(null)}
                variant="primary"
            >
                <span className="hidden sm:inline">
                    Añadir registro
                </span>
                <Icon name="Plus" className="w-4 sm:ml-2" />
            </Button>
        </div>
    )
}