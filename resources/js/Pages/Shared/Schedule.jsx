import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import Calendar from '@/Components/FullCalendar/FullCalendarComponent';
import {UserCalendarInfo} from '@/Components/FullCalendar/UserCalendarInformation';

export default function Schedule() {
    return (
        <>
            <Head title="Schedule" />

            <div className="max-w-7xl mx-auto p-2 md:p-7 space-y-8">
                <UserCalendarInfo />
                <Calendar />
            </div>
        </>

    );
}

Schedule.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;