import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from "@/Components/DataTable/DataTable";
import { columns } from "@/Pages/Admin/Empresas/Partials/Columns";
import TableToolbar from '@/Pages/Admin/Empresas/Partials/TableToolbar';
export default function Index({ empresas }) {
    return (
        <>
            <Head title="Empresas" />
            <div className="max-w-full mx-auto py-7 xl:px-8 px-4">
                <DataTable
                    columns={columns}
                    records={empresas}
                    entity="empresas"
                    toolbarComponent={(props) => <TableToolbar {...props} entity="empresas" />}
                />
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;