import GlobalFilter from "@/Components/App/DataTable/Components/Toolbar/GlobalFilter";
import TableFilters from "@/Components/App/DataTable/Lite/Components/Toolbar/TableFilters";
import AllSelector from "@/Components/App/DataTable/Components/Toolbar/AllSelector";

export default function CustomToolbar() {
    return (
        <div className="min-w-full max-w-full pt-2 px-2 pb-1 sticky top-0 z-10 bg-custom-white dark:bg-custom-blackSemi border-none">
            {/* Fila superior con filtros y buscador */}
            <div className="flex items-center justify-between xl:ml-auto min-w-0 w-full gap-2.5">
                <TableFilters />
                <div className="flex-1 w-full">
                    <GlobalFilter />
                </div>
            </div>
            
            {/* Checkbox Seleccionar a todos*/}
            <div className="pt-2 pb-1 px-1">
                <AllSelector />
            </div>
        </div>
    )
}
