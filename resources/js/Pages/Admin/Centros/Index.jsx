import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from "@/Components/DataTable/DataTable";
import { columns } from "@/Pages/Admin/Centros/Partials/Columns";
import TableToolbar from '@/Pages/Admin/Centros/Partials/TableToolbar';

import { Head } from '@inertiajs/react';

export default function Index({ centers }) {
    return (
        <>
            <Head title="Centros" />

            <div className="max-w-7xl mx-auto py-7">
                <DataTable
                    columns={columns}
                    records={centers}
                    entity="centros"
                    toolbarComponent={(props) => <TableToolbar {...props} entity="centros" centers={centers} />}
                />
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout children={page} />;