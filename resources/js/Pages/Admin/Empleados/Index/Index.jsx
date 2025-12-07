import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateUpdateView from './Partials/CreateUpdateView';
import { ViewContextProvider } from './Context/ViewContext';
import { DataHandlerContextProvider } from './Context/DataHandlerContext';
import DataTablePortal from './Partials/DataTablePortal';
import ContratosVigentesEmpleadoView from './Partials/ContratosVigentesEmpleadoView';
import SheetTableView from './Partials/SheetTableView';
import DeleteView from './Partials/DeleteView';
import CreateUpdateViewComponent from '@/Components/App/Empleado/CreateUpdateDialog/CreateUpdateDialog';
import SheetTableViewComponent from '@/Components/App/Empleado/SheetTable/SheetTable';
import DeleteViewComponent from '@/Components/App/Empleado/DeleteDialog/DeleteDialog';

export default function Index() {
    return (
        <>
            <Head title="Administración de empleados" />
            <div className="max-w-full mx-auto py-7 xl:px-8 px-4 overflow-hidden">
                <ViewContextProvider
                    CreateUpdateViewComponent={CreateUpdateViewComponent}
                    SheetTableViewComponent={SheetTableViewComponent}
                    DeleteViewComponent={DeleteViewComponent}
                >
                    <DataHandlerContextProvider>
                        <DataTablePortal />
                        <CreateUpdateView />
                        <SheetTableView />
                        <ContratosVigentesEmpleadoView />
                        <DeleteView />
                    </DataHandlerContextProvider>
                </ViewContextProvider>
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;