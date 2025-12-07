import { useView } from "../Context/ViewContext";
import SheetTable from "@/Components/App/Empleado/SheetTable/SheetTable";

export default function SheetTableView({ }) {

    const { sheetView, handleSheetView } = useView();

    const { open, model } = sheetView;

    if (!model) {
        return null;
    }

    return (
        <SheetTable
            model={model}
            open={open}
            onOpenChange={() => handleSheetView(model)}
        />
    );
}