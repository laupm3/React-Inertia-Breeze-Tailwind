
import TableFilters from "@/Components/App/DataTable/Components/Table/TableFilters";
import DateRangeSelectors from "../Components/DateRangeSelectors";
import GlobalFilter from "@/Components/App/DataTable/Components/Toolbar/GlobalFilter";
import ColumnsVisibilitySelector from "@/Components/App/DataTable/Components/Toolbar/ColumnsVisibilitySelector";
import PageSizeSelector from "@/Components/App/DataTable/Components/Toolbar/PageSizeSelector";
import ImportExportDropdown from "@/Components/App/DataTable/Components/Toolbar/ImportExportDropdown";
import { useDataHandler } from '../Context/DataHandlerContext';
import { Button } from '@/Components/App/Buttons/Button';
import Icon from '@/imports/LucideIcon';

export default function Toolbar({ }) {
    const {
        toggleShowAllEmployees,
        showingAllEmployees,
    } = useDataHandler();

    return (
        <div className="flex flex-col xl:flex-row gap-4 p-1 pb-4">
            {/* Fila izquierda con DateRangeSelectors */}
            <div className="flex-none">
                <DateRangeSelectors />
            </div>

            {/* Fila derecha con todos los controles en línea */}
            <div className="flex flex-wrap items-center xl:ml-auto gap-3 min-w-0">
                <TableFilters />
                <div className="w-[250px] flex-shrink">
                    <GlobalFilter />
                </div>
                <ColumnsVisibilitySelector />
                <PageSizeSelector />
                <ImportExportDropdown entity="horarios" />
                <Button
                    onClick={toggleShowAllEmployees}
                    variant="secondary"
                    className="xl:ml-auto"
                >
                    {showingAllEmployees ? (
                        <>
                            <Icon name="EyeOff" className="w-4 mr-2" />
                            <p>Ocultar vacios</p>
                        </>
                    ) : (
                        <>
                            <Icon name="Eye" className="w-4 mr-2" />
                            <p>Mostrar todos</p>
                        </>
                    )}

                </Button>
            </div>
        </div>
    )
}
