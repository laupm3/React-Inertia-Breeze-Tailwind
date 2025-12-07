import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";
import { useView } from "../Index/Context/ViewContext";

export default function ContratosVinculadosTrigger({ asignacion }) {

    const { handleSheetView } = useView();

    return (
        <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-transparent font-normal underline"
            onClick={() => handleSheetView(asignacion)}
        >
            {`${asignacion.contratosVigentes.length} contratos`}
            <Icon name="ArrowUpRight" className="w-4 ml-1" />
        </Button>
    )
}