import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from "@/Components/DataTable/DataTable";

import { columns } from "@/Pages/Admin/Turnos/Partials/Columns";
import TableToolbar from '@/Pages/Admin/Turnos/Partials/TableToolbar';

export default function Index({ turnos }) {

    return (
        <>
            <Head title="Turnos" />
            <div className="max-w-full mx-auto py-7 xl:px-8 px-4">
                <DataTable
                    columns={columns}
                    records={turnos}
                    toolbarComponent={TableToolbar}
                />
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
