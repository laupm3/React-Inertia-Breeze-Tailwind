import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from "@/Components/DataTable/DataTable";
import { columns } from "./Partials/Columns";
import TableToolbar from './Partials/TableToolbar';


export default function Index({ departamentos }) {

    return (
        <>
            <Head title="Departamentos" />
            <div className=" max-h-screen max-w-screen m-12 py-7 bg-custom-white dark:bg-custom-blackLight">
                <DataTable
                    columns={columns}
                    records={departamentos}
                    entity="departamentos"
                    toolbarComponent={(props) => <TableToolbar {...props} entity="departamentos" />}
                />
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;