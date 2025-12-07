import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets';

// Importación de Partials
import EmpleadosStatus from './Partials/empleadosStatus/EmpleadosStatus';
import UsuariosActivos from './Partials/usuariosActivos/UsuariosActivos';
import EmpleadosDepartamento from './Partials/empleadosDepartamento/EmpleadosDepartamento';
import Fichajes from './Partials/fichajes/Fichajes';
import Justificantes from './Partials/justificantes/Justificantes';
import Vacaciones from './Partials/vacaciones/Vacaciones';
import Permisos from './Partials/permisos/Permisos';
import EmpleadosSinAntiguedad from './Partials/empleadosSinAntiguedad/EmpleadosSinAntiguedad';
import FinalizacionContratos from './Partials/FinalizaContratos/FinalizacionContratos';
import CaducidadDocumentos from './Partials/caducidadDocumentos/CaducidadDocumentos';

export default function Index({ auth }) {
    // 1. Recogemos el nuevo contador de usuarios conectados del hook.
    const { widgetsData, currentDate, connectedUsersCount } = useDashboardWidgets();

    return (
        // 2. El componente se centra solo en renderizar.
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Panel de Administración</h2>}
        >
            <Head title="Panel de Administración" />

            <h2 className='text-xl sm:text-2xl mt-6 sm:mt-10 ml-4 sm:ml-10 font-bold text-custom-blackLight dark:text-custom-white'>
                Panel de Control
            </h2>

            <div className="w-full pt-8 pb-4 px-4 sm:px-6 xl:px-10 space-y-8">
                <section>
                    {/* Los datos ahora vienen del objeto widgetsData */}
                    <EmpleadosStatus data={widgetsData.employeeStatuses} />
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* 3. Pasamos el nuevo contador al componente `UsuariosActivos`.
                        Usamos el operador '??' por si 'activeUsers' es nulo al principio. */}
                    <UsuariosActivos data={{ ...widgetsData.activeUsers, connected_count: connectedUsersCount }} date={currentDate} />
                    <EmpleadosDepartamento data={widgetsData.employeesByDepartment} date={currentDate} />
                    <Fichajes data={widgetsData.clockingsStats} date={currentDate} />
                    <Justificantes data={widgetsData.justificationsStats} />
                    <Vacaciones data={widgetsData.pendingVacations} />
                    <Permisos data={widgetsData.pendingPermissions} date={currentDate} />
                </div>

                {/* <div>
                    <EmpleadosSinAntiguedad data={widgetsData.newEmployees} />
                </div> */}

                <div className="flex flex-col 2xl:flex-row gap-6">
                    <FinalizacionContratos data={widgetsData.expiringContracts} date={currentDate} />

                    <CaducidadDocumentos data={widgetsData.expiringDocuments} date={currentDate} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
