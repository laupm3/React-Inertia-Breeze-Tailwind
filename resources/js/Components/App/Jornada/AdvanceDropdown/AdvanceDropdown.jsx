import AdvanceDropdownBase from "@/Components/App/AdvanceDropdown/AdvanceDropdown"
import { useAdvanceDropdownColumns } from "../Hooks/useAdvanceDropdownColumns"

import CreateUpdateDialog from "@/Components/App/Jornada/CreateUpdateDialog/CreateUpdateDialog";
import SheetTable from "@/Components/App/Jornada/SheetTable/SheetTable";

export default function AdvanceDropdown({
    defaultValue = null,
    onChangeValue = () => { },
    enableCreateUpdateView = false,
    enableSheetTableView = false,
}) {
    return (
        <AdvanceDropdownBase
            defaultValue={defaultValue}
            onChangeValue={onChangeValue}
            // renderSelection={(value) => <EmpleadoAvatar empleado={value} />}
            fetchUrl={route('api.v1.admin.jornadas.index')}
            dataKey="jornadas"
            columns={useAdvanceDropdownColumns()}
            enableCreateUpdateView={enableCreateUpdateView}
            enableSheetTableView={enableSheetTableView}
            CreateUpdateViewComponent={CreateUpdateDialog}
            SheetTableViewComponent={SheetTable}
            cacheDuration={5 * 60 * 1000} // 5 minutos
            openInDialog={true}
        />
    )
}