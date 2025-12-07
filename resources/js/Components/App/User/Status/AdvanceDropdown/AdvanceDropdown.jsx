import AdvanceDropdownBase from "@/Components/App/AdvanceDropdown/AdvanceDropdown"
import { useStatusAdvanceDropdownColumns } from "@/Components/App/User/Hooks/useStatusAdvanceDropdownColumns";
import STATUS_USUARIO_COLOR_MAP from "@/Components/App/Pills/constants/StatusUsuarioMapColor";
import useApiEndpoints from "@/Components/App/User/Hooks/useApiEndpoints";
import Pill from "@/Components/App/Pills/Pill";

export default function AdvanceDropdown({
    defaultValue = null,
    onChangeValue = () => { },
    enableCreateUpdateView = false,
    enableSheetTableView = false,
}) {

    const endpoints = useApiEndpoints();

    return (
        <AdvanceDropdownBase
            defaultValue={defaultValue}
            onChangeValue={onChangeValue}
            renderSelection={(value) => (
                <Pill
                    identifier={value.name}
                    children={value.label}
                    mapColor={STATUS_USUARIO_COLOR_MAP}
                    size="text-xs"
                    textClassName="font-medium"
                />
            )}
            fetchUrl={endpoints.statuses}
            dataKey="statuses"
            columns={useStatusAdvanceDropdownColumns()}
            cacheDuration={10 * 60 * 1000} // 2 minutos
            enableCreateUpdateView={enableCreateUpdateView}
            enableSheetTableView={enableSheetTableView}
        />
    )
}