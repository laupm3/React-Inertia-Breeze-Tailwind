import { useView } from "../Context/ViewContext";
import { SheetTable as SheetTableBase } from "@/Components/DataTable/SheetTable";

export default function SheetTable({ }) {

    const {
        isSheetOpen,
        setIsSheetOpen
    } = useView();

    return (
        <SheetTableBase
            title={'Soy un pescado 🐟'}
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            className={"min-w-[600px]"}
            descriptionContent={
                <></>
            }
        />
    );
}