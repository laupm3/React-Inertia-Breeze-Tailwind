import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateUpdateView from './Partials/CreateUpdateView';
import { ViewContextProvider } from './Context/ViewContext';
import { DataHandlerContextProvider } from './Context/DataHandlerContext';
import DataTablePortal from './Partials/DataTablePortal';
import SheetTableView from './Partials/SheetTableView';
import DeleteView from './Partials/DeleteView';
import CreateUpdateViewComponent from '@/Components/App/Role/CreateUpdateDialog/CreateUpdateDialog';
import SheetTableViewComponent from '@/Components/App/Role/SheetTable/SheetTable';
import DeleteViewComponent from '@/Components/App/Role/DeleteDialog/DeleteDialog';

export default function Index() {
    return (
        <>
            <Head title="Administración de roles" />
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
                        <DeleteView />
                    </DataHandlerContextProvider>
                </ViewContextProvider>
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;