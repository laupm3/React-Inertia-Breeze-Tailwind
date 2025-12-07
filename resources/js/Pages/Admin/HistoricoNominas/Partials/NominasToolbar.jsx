import PageSizeSelector from "@/Components/App/DataTable/Components/Toolbar/PageSizeSelector";
import ColumnsVisibilitySelector from "@/Components/App/DataTable/Components/Toolbar/ColumnsVisibilitySelector";
import GlobalFilter from "@/Components/App/DataTable/Components/Toolbar/GlobalFilter";
import TableFilters from "@/Components/App/DataTable/Components/Table/TableFilters";
import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";

export default function NominasToolbar({ children }) {
    return (
        <div className="flex flex-col xl:flex-row gap-4 p-1 pb-4">

            <div className='flex items-center'>
                {children}
            </div>


            <div className="flex flex-wrap items-center xl:ml-auto gap-3 min-w-0">
                <TableFilters />
                <div className="w-[250px] flex-shrink">
                    <GlobalFilter />
                </div>
                <ColumnsVisibilitySelector />
                <PageSizeSelector />
                <Button
                    variant="primary"
                    onClick={() => window.location.href = route('admin.nominas.index')}
                >
                    <Icon
                        name="Plus"
                        className="w-4 h-4 mr-1"
                    />
                    Subir nómina
                </Button>
            </div>
        </div>
    )
} 