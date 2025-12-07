import { useView } from "../Context/ViewContext";

export default function SheetTableView() {

    const {
        sheetView,
        handleSheetView,
        enableSheetTableView,
        SheetTableViewComponent
    } = useView();

    const { open, model } = sheetView;

    if (!model) {
        return null;
    }

    if (!enableSheetTableView) {
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