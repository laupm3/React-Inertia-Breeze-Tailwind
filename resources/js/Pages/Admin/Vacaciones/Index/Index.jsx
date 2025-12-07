import { Head } from '@inertiajs/react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateUpdateView from './Partials/CreateUpdateView';
import { DataHandlerContextProvider, useDataHandler } from './Context/DataHandlerContext';
import { ViewContextProvider } from './Context/ViewContext';
import DataTablePortal from './Partials/DataTablePortal';
import SheetTableView from './Partials/SheetTableView';
import DeleteView from './Partials/DeleteView';
import PermisoCalendar from './Components/Calendar/PermisoCalendar';
import PermisoEventFilter from './Components/Calendar/PermisoEventFilter';
import PermisoStatusFilter from './Components/Calendar/PermisoStatusFilter';

import { useState } from 'react';

import { Button } from '@/Components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';

function VacacionesContent() {
    const [currentView, setCurrentView] = useState('table');
    
    // Estados para los filtros del calendario
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    
    // Usar los datos del contexto unificado para ambas vistas
    const { data: vacacionesData } = useDataHandler();

    // Funciones para manejar los cambios en los filtros
    const handleEmployeeFilterChange = (employees) => {
        setSelectedEmployees(employees);
    };

    const handleStatusFilterChange = (statuses) => {
        setSelectedStatuses(statuses);
    };

    // Convertir empleados seleccionados a IDs para el calendario
    const filteredEmployeeIds = selectedEmployees.map(emp => String(emp.id));

    return (
        <>
            <div className="mb-4 flex flex-col md:flex-row gap-4 md:justify-end md:items-center">
                {/* Filtros del calendario - solo mostrar en vistas de calendario */}
                {(currentView === 'month' || currentView === 'week') && (
                    <div className="flex flex-col sm:flex-row gap-2">
                        <PermisoEventFilter
                            allEvents={vacacionesData}
                            onFilterChange={handleEmployeeFilterChange}
                            currentSelectedEmployees={selectedEmployees}
                            className="w-full sm:w-auto min-w-[200px]"
                        />
                        <PermisoStatusFilter
                            allEvents={vacacionesData}
                            onFilterChange={handleStatusFilterChange}
                            currentSelectedStatuses={selectedStatuses}
                            className="w-full sm:w-auto min-w-[180px]"
                        />
                    </div>
                )}

                {/* Tabs de cambio de vista */}
                <Tabs value={currentView} onValueChange={setCurrentView} className="ml-auto">
                    <TabsList className="flex gap-1 bg-custom-white dark:bg-custom-blackLight">
                        <TabsTrigger
                            value="table"
                            className="px-4 py-2 data-[state=active]:bg-custom-gray-default text-custom-blackSemi dark:data-[state=active]:bg-custom-blackSemi dark:text-gray-200 hover:bg-custom-gray-light dark:hover:bg-custom-gray-semiDark"
                        >
                            Tabla
                        </TabsTrigger>
                        |
                        <TabsTrigger
                            value="month"
                            className="px-4 py-2 data-[state=active]:bg-custom-gray-default text-custom-blackSemi dark:data-[state=active]:bg-custom-blackSemi dark:text-gray-200 hover:bg-custom-gray-light dark:hover:bg-custom-gray-semiDark"
                        >
                            Mes
                        </TabsTrigger>
                        <TabsTrigger
                            value="week"
                            className="px-4 py-2 data-[state=active]:bg-custom-gray-default text-custom-blackSemi dark:data-[state=active]:bg-custom-blackSemi dark:text-gray-200 hover:bg-custom-gray-light dark:hover:bg-custom-gray-semiDark"
                        >
                            Semana
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>


            {/* Vistas principales condicionales */}
            {currentView === 'table' && (
                <DataTablePortal />
            )}
            {currentView === 'month' && (
                <PermisoCalendar
                    initialView="dayGridMonth"
                    solicitudesApi={vacacionesData}
                    filteredEmployeeIds={filteredEmployeeIds}
                    filteredStatuses={selectedStatuses}
                />
            )}
            {currentView === 'week' && (
                <PermisoCalendar
                    initialView="dayGridWeek"
                    solicitudesApi={vacacionesData}
                    filteredEmployeeIds={filteredEmployeeIds}
                    filteredStatuses={selectedStatuses}
                />
            )}

            {/* Vistas modales/laterales que deben estar siempre disponibles para el contexto */}
            <CreateUpdateView />
            <SheetTableView />
            <DeleteView />
        </>
    );
}

export default function Index() {
    return (
        <>
            <Head title="Gestión de Vacaciones" />
            <div className="max-w-full mx-auto py-7 xl:px-8 px-4 overflow-hidden">
                <DataHandlerContextProvider>
                    <ViewContextProvider>
                        <VacacionesContent />
                    </ViewContextProvider>
                </DataHandlerContextProvider>
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;