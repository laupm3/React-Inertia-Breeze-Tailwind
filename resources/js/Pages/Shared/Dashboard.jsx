import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BlocksLayout from '@/Layouts/BlocksLayout';

import ClockIn from '@/Blocks/ClockIn';
import Events from '@/Blocks/Events/Events';
import Vacation from '@/Blocks/Vacation';
// import AccesosRapidos from '@/Blocks/AccesosRapidos';

import { Head } from '@inertiajs/react';

export default function Dashboard() {

    const blocks = [
        ClockIn,
        Events,
        Vacation,
        // AccesosRapidos
    ];

    return (
        <>
            <Head title="Dashboard" />

            <BlocksLayout blocks={blocks} />
        </>
    );
}

Dashboard.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;