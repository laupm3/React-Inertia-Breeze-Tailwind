import AdvanceDropdownBase from "@/Components/App/AdvanceDropdown/AdvanceDropdown";
import { useAdvanceDropdownColumns } from "../Hooks/useAdvanceDropdownColumns";

import CreateUpdateDialog from "@/Components/App/Turnos/CreateUpdateDialog/CreateUpdateDialog";
import Icon from "@/imports/LucideIcon";

export default function AdvanceDropdown({
    defaultValue = null,
    onChangeValue = () => {},
    enableCreateUpdateView = false,
    enableSheetTableView = false,
    handleResponse = () => {},
}) {
    return (
        <AdvanceDropdownBase
            defaultValue={defaultValue}
            onChangeValue={onChangeValue}
            renderSelection={(value) => (
            <span className="flex items-center">
                <div className="inline-block w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: value.color }} />
                {value.nombre}
            </span>)}
            fetchUrl={route("api.v1.admin.turnos.index")}
            dataKey="turnos"
            columns={useAdvanceDropdownColumns()}
            enableCreateUpdateView={enableCreateUpdateView}
            enableSheetTableView={enableSheetTableView}
            CreateUpdateViewComponent={CreateUpdateDialog}
            cacheDuration={2 * 60 * 10} // 2 minutos
            handleResponse={handleResponse}
        />
    );
}
