import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ViewContextProvider } from './Context/ViewContext';
import { DataHandlerContextProvider } from './Context/DataHandlerContext';
import DataTablePortal from './Partials/DataTablePortal';
export default function Index() {
    return (
        <>
            <Head title="Gestión Administrativa Brevo" />
            <div className="max-w-full mx-auto py-7 xl:px-8 px-4 overflow-hidden">
                <ViewContextProvider>
                    <DataHandlerContextProvider>
                        <DataTablePortal />
                    </DataHandlerContextProvider>
                </ViewContextProvider>
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;