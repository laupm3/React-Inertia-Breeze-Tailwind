import AdvanceDropdownBase from "@/Components/App/AdvanceDropdown/AdvanceDropdown"
import { useAdvanceDropdownColumns } from "../Hooks/useAdvanceDropdownColumns"
import EmpleadoAvatar from "../EmpleadoAvatar"

import CreateUpdateDialog from "@/Components/App/Empleado/CreateUpdateDialog/CreateUpdateDialog";
import SheetTable from "@/Components/App/Empleado/SheetTable/SheetTable";

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
            renderSelection={(value) => <EmpleadoAvatar empleado={value} />}
            fetchUrl={route('api.v1.admin.empleados.index')}
            dataKey="empleados"
            columns={useAdvanceDropdownColumns()}
            enableCreateUpdateView={enableCreateUpdateView}
            enableSheetTableView={enableSheetTableView}
            CreateUpdateViewComponent={CreateUpdateDialog}
            SheetTableViewComponent={SheetTable}
            cacheDuration={2 * 60 * 1000} // 2 minutos
        />
    )
}