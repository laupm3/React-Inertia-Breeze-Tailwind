import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataHandlerContextProvider } from './Context/DataHandlerContext';
import DataTablePortal from './Partials/DataTablePortal';
import { UserInformation } from './Components/UserInformation';


export default function Index() {
    return (
        <>
            <Head title="Fichajes" />
            <div className="max-w-full mx-auto py-7 xl:px-8 px-4 overflow-hidden">
                <DataHandlerContextProvider>
                    <UserInformation />
                    <DataTablePortal />
                </DataHandlerContextProvider>
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;