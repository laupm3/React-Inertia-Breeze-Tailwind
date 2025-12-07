import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";
import { useView } from "../Index/Context/ViewContext";

export default function ContratosVigentesTrigger({ empleado }) {

    const { handleContratosVigentesView } = useView();

    return (
        <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-transparent"
            onClick={() => handleContratosVigentesView(empleado)}
        >
            Ver contratos
            <Icon name="ArrowUpRight" className="w-4 ml-1" />
        </Button>
    )
}