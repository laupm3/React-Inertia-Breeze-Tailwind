import { useDataHandler } from "../Context/DataHandlerContext";
import SheetTableViewComponent from '@/Components/App/Vacacion/SheetTable/SheetTable';

/**
 * Vista unificada para sheet que usa el contexto unificado
 * 
 * @returns {JSX.Element}
 */
export default function SheetTableView({ }) {

    const { viewStates, handleSheetView } = useDataHandler();

    const { open, model } = viewStates.sheet;

    if (!model) {
        return null;
    }

    return (
        <SheetTableViewComponent
            model={model}
            open={open}
            onOpenChange={() => handleSheetView(model)}
        />
    );
}