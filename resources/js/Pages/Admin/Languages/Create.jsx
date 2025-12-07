import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CreateLanguageForm from './Partials/CreateLanguageForm';

export default function Create() {
    return (
        <>
            <Head title="Manage Languages" />

            <CreateLanguageForm />
        </>
    );
};

Create.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;