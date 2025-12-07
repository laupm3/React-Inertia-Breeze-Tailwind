import GlobalFilter from "../../../Components/Toolbar/GlobalFilter";
import TableFilters from "./TableFilters";

export default function Toolbar() {
    return (
        <div className="min-w-full max-w-full pt-2 px-2 pb-1 sticky top-0 z-10 bg-custom-white dark:bg-custom-blackSemi border-none">
            {/* Fila derecha con todos los controles en línea */}
            <div className="flex items-center justify-between xl:ml-auto min-w-0 w-full gap-2.5">
                <TableFilters />
                <div className="flex-1 w-full">
                    <GlobalFilter />
                </div>
            </div>
        </div>
    )
}