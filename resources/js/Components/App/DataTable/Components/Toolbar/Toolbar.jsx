import CreateButton from "./CreateButton";
import PageSizeSelector from "./PageSizeSelector";
import ColumnsVisibilitySelector from "./ColumnsVisibilitySelector";
import GlobalFilter from "./GlobalFilter";
import TableFilters from "../Table/TableFilters";
import ImportExportDropdown from "./ImportExportDropdown";

export default function Toolbar({ children, entity = '', simplified = false }) {
    return (
        <div className="flex flex-col xl:flex-row gap-4 p-1 pb-4">
            {/* Fila izquierda con DateRangeSelectors */}
            <div className='flex items-center'>
                {children}
            </div>

            {/* Fila derecha con todos los controles en línea */}
            <div className="flex flex-wrap items-start md:items-center xl:ml-auto gap-3 min-w-0">
                <TableFilters />
                <div className="w-[250px] flex-shrink">
                    <GlobalFilter />
                </div>
                <ColumnsVisibilitySelector />
                {!simplified && (
                    <>
                        <PageSizeSelector />
                        <ImportExportDropdown entity={entity} />
                        <CreateButton />
                    </>
                )}
            </div>
        </div>
    );
}