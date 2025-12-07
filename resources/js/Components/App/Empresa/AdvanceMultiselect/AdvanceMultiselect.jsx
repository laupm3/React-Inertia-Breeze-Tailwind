import AdvanceMultiselectBase from "@/Components/App/AdvanceMultiselect/AdvanceDropdown"
import { useAdvanceDropdownColumns } from "../Hooks/useAdvanceDropdownColumns"

import CreateUpdateDialog from "@/Components/App/Empleado/CreateUpdateDialog/CreateUpdateDialog";
import SheetTable from "@/Components/App/Empleado/SheetTable/SheetTable";

export default function AdvanceMultiselect({
    defaultValue = [],
    onChangeValue = () => { },
    enableCreateUpdateView = false,
    enableSheetTableView = false,
}) {
    return (
        <AdvanceMultiselectBase
            defaultValue={defaultValue}
            onChangeValue={onChangeValue}
            renderSelection={(values) => {
                if (!values || values.length === 0) return "Selecciona empresas";
                if (values.length === 1) return <span>{values[0].nombre}</span>;
                return <span>{values.length} empresas seleccionadas</span>;
            }}
            fetchUrl={route('api.v1.admin.empresas.index')}
            dataKey="empresas"
            columns={useAdvanceDropdownColumns()}
            enableCreateUpdateView={enableCreateUpdateView}
            enableSheetTableView={enableSheetTableView}
            CreateUpdateViewComponent={CreateUpdateDialog}
            SheetTableViewComponent={SheetTable}
            cacheDuration={2 * 60 * 1000} // 2 minutos
        />
    )
}
