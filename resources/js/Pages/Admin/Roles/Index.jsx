import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from "@/Components/DataTable/DataTable";
import { columns } from "@/Pages/Admin/Roles/Partials/Columns";
import TableToolbar from '@/Pages/Admin/Roles/Partials/TableToolbar';

import { Head } from '@inertiajs/react';

export default function Index({ roles }) {
    return (
        <>
            <Head title="Roles" />

            <div className="max-w-full mx-auto py-7 xl:px-8 px-4">
                <DataTable
                    columns={columns}
                    records={roles}
                    toolbarComponent={TableToolbar}
                />
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;