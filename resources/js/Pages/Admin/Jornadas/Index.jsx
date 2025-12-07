import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from "@/Components/DataTable/DataTable";

import { columns } from "@/Pages/Admin/Jornadas/Partials/Columns";
import TableToolbar from '@/Pages/Admin/Jornadas/Partials/TableToolbar';

export default function Index({ jornadas }) {
    return (
        <>
            <Head title="Jornadas" />
            <div className="max-w-full mx-auto py-7 xl:px-8 px-4">
                <DataTable
                    columns={columns}
                    records={jornadas}
                    toolbarComponent={TableToolbar}
                />
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;