import AdvanceMultiselectBase from "@/Components/App/AdvanceMultiselect/AdvanceMultiselect"
import { useAdvanceMultiselectColumns } from "@/Blocks/Events/hooks/useAdvanceMultiselectColumns"
import UserAvatarGroup from "./UserAvatarGroup"

export default function AdvanceMultiselect({
    defaultValue = [],
    onChangeValue = () => { },
    enableCreateUpdateView = false,
    enableSheetTableView = false,
    placeholder = "Selecciona usuarios",
    transformData = (data) => data
}) {
    return (
        <AdvanceMultiselectBase
            defaultValue={defaultValue}
            onChangeValue={onChangeValue}
            placeholder={placeholder}
            renderSelection={(values) => (
                <UserAvatarGroup 
                    users={values} 
                    maxVisible={3} 
                    placeholder={placeholder}
                />
            )}
            fetchUrl={route('api.v1.shared.users.index')}
            dataKey="users"
            columns={useAdvanceMultiselectColumns()}
            enableCreateUpdateView={enableCreateUpdateView}
            enableSheetTableView={enableSheetTableView}
            cacheDuration={2 * 60 * 1000} // 2 minutos
            transformData={transformData}
        />
    )
}
