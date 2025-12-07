import { useDataHandler } from "../Context/DataHandlerContext";
import { useView } from "../Context/ViewContext";

export default function SheetTableView({ }) {

    const { sheetView, handleSheetView, SheetTableViewComponent } = useView();
    const { updateData } = useDataHandler();

    const { open, model } = sheetView;

    if (!model) {
        return null;
    }

    if (!SheetTableViewComponent) {
        return null;
    }

    return (
        <SheetTableViewComponent
            model={model}
            open={open}
            onOpenChange={() => handleSheetView(model)}
            onSaveData={updateData}
        />
    );
}