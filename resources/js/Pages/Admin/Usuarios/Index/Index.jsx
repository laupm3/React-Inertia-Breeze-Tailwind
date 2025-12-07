import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateUpdateView from './Partials/CreateUpdateView';
import { ViewContextProvider, useView } from './Context/ViewContext';
import { DataHandlerContextProvider } from './Context/DataHandlerContext';
import DataTablePortal from './Partials/DataTablePortal';
import SheetTableView from './Partials/SheetTableView';
import DeleteView from './Partials/DeleteView';
import CreateUpdateViewComponent from '@/Components/App/User/CreateUpdateDialog/CreateUpdateDialog';
import SheetTableViewComponent from '@/Components/App/User/SheetTable/SheetTable';
import DeleteViewComponent from '@/Components/App/User/DeleteDialog/DeleteDialog';

// Un componente wrapper para acceder al contexto
const MainContent = () => {
    const { createUpdateView, destroyView } = useView();

    return (
        <DataHandlerContextProvider>
            <DataTablePortal />
            <CreateUpdateView key={createUpdateView.model ? `edit-${createUpdateView.model.id}` : 'create'} />
            <SheetTableView />
            <DeleteView key={destroyView.model ? `delete-${destroyView.model.id}` : 'delete'} />
        </DataHandlerContextProvider>
    );
}

export default function Index() {
    return (
        <>
            <Head title="Usuarios" />
            <div className="max-w-full mx-auto py-7 xl:px-8 px-4 overflow-hidden">
                <ViewContextProvider
                    CreateUpdateViewComponent={CreateUpdateViewComponent}
                    SheetTableViewComponent={SheetTableViewComponent}
                    DeleteViewComponent={DeleteViewComponent}
                >
                    <MainContent />
                </ViewContextProvider>
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;