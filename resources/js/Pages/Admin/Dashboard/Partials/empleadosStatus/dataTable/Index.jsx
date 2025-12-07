import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateUpdateView from './Partials/CreateUpdateView';
import { ViewContextProvider } from './Context/ViewContext';
import { DataHandlerContextProvider } from './Context/DataHandlerContext';
import DataTablePortal from './Partials/DataTablePortal';
import ContratosVigentesEmpleadoView from './Partials/ContratosVigentesEmpleadoView';
import SheetTableView from './Partials/SheetTableView';
import CreateUpdateViewComponent from '@/Components/App/Empleado/CreateUpdateDialog/CreateUpdateDialog';
import SheetTableViewComponent from '@/Components/App/Empleado/SheetTable/SheetTable';

export default function Index({ data, content, filter }) {
    return (
        <>
            <Head title="Administración de empleados" />
            <div className=" overflow-y-auto">
                <ViewContextProvider
                    CreateUpdateViewComponent={CreateUpdateViewComponent}
                    SheetTableViewComponent={SheetTableViewComponent}
                >
                    <DataHandlerContextProvider data={data}>
                        <DataTablePortal content={content} filter={filter} />
                        <CreateUpdateView />
                        <SheetTableView />
                        <ContratosVigentesEmpleadoView />
                    </DataHandlerContextProvider>
                </ViewContextProvider>
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;