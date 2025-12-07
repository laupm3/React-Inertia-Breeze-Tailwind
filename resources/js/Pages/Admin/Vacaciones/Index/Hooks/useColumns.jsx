import { useMemo, useState } from "react";

import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import Pill from "@/Components/App/Pills/Pill";
import { rowActionsColumn } from "../Components/RowActionsColumn";
import ApprovalStatusPill from "../Components/ApprovalStatusPill";

import VACACIONES_COLOR_MAP from "@/Components/App/Pills/constants/VacacionesMapColor";
import STATUS_PERMISO_COLOR_MAP from "@/Components/App/Pills/constants/StatusPermisoMapColor";

export function useColumns() {

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "empleado",
                title: "Empleado",
                enableHiding:true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => <EmpleadoAvatar empleado={row.original.empleado} />,
                accessorFn: (row) => `${row.empleado.primerApellido} ${row.empleado.segundoApellido}, ${row.empleado.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "permiso",
                title: "Tipo",
                enableHiding:true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn:false,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) =>
                    <div>
                        <Pill
                            identifier="Vacaciones"
                            children="Vacaciones"
                            mapColor={VACACIONES_COLOR_MAP}
                            size="xs"
                        />
                    </div>,
                accessorFn: (row) => "Vacaciones",
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const tipoPermiso = "Vacaciones";
                    return selectedValues.some((value) =>
                        tipoPermiso.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "motivo",
                title: "Motivo",
                enableHiding:true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: false,
                header: ({ }) => (
                    <div className=" max-w-[250px]">Motivo</div>
                ),
                cell: ({ row }) => {
                    const motivo = row.original.motivo;
                    const [isHovering, setIsHovering] = useState(false);

                    return (
                        <div
                            className="relative"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <span
                                className="block max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap cursor-default "
                            >
                                {motivo}
                            </span>
                            {isHovering && (
                                <div
                                    className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 min-w-[250px] max-w-md bg-white border dark:bg-custom-blackSemi border-gray-300 dark:border-custom-blackLight rounded-lg shadow-xl"
                                    style={{ whiteSpace: 'normal' }}
                                >
                                    <p className="text-sm text-gray-700 dark:text-white">{motivo}</p>
                                </div>
                            )}
                        </div>
                    );
                },
                accessorFn: (row) => row.motivo,
                filterFn: (row, columnId, selectedValues) => {
                    // If filtering is ever enabled, ensure it works with the full 'motivo'
                    if (!selectedValues.length) return true;
                    const motivoText = row.original.motivo; // Access original full motivo for filtering
                    return selectedValues.some(value =>
                        motivoText.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "fecha_inicio",
                title: "Fecha inicio",
                enableHiding:true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: false,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => {
                    const date = new Date(row.original.fecha_inicio);
                    const day = date.getDate();
                    const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
                    const year = date.getFullYear();
                    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                    return `${day} ${capitalizedMonthName} ${year}`;
                },
                accessorFn: (row) => row.fecha_inicio,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fecha = row.getValue(columnId);
                    return selectedValues.includes(fecha);
                }
            },
            {
                id: "fecha_fin",
                title: "Fecha fin",
                enableHiding:true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: false,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => {
                    const date = new Date(row.original.fecha_fin);
                    const day = date.getDate();
                    const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
                    const year = date.getFullYear();
                    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                    return `${day} ${capitalizedMonthName} ${year}`;
                },
                accessorFn: (row) => row.fecha_fin,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fecha = row.getValue(columnId);
                    return selectedValues.includes(fecha);
                }
            },
            {
                id: "estadoSolicitud",
                title: "Estado",
                enableHiding:true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => {
                    const estado = row.original.estado.nombre;
                    return (
                        <Pill
                            identifier={estado}
                            children={estado}
                            mapColor={STATUS_PERMISO_COLOR_MAP}
                            size="sm"
                        />
                    );
                },
                accessorFn: (row) => row.estado.nombre,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const estado = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        estado.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "tipo_aprobacion_manager",
                title: "Manager",
                enableHiding:true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => {
                    const managerAprobacion = row.original.aprobaciones?.find(
                        (ap) => ap.tipo_aprobacion === 'manager'
                    );
                    return <ApprovalStatusPill aprobacion={managerAprobacion} />;
                },
                accessorFn: (originalRow) => {
                    const managerAprobacion = originalRow.aprobaciones?.find(
                        (ap) => ap.tipo_aprobacion === 'manager'
                    );
                    if (managerAprobacion && managerAprobacion.approvedBy) {
                        const approverName = managerAprobacion.approvedBy.empleado?.nombreCompleto || managerAprobacion.approvedBy.name;
                        const status = managerAprobacion.aprobado ? 'Aprobado' : 'Rechazado';
                        return `${status} - ${approverName}`;
                    }
                    return "-";
                },
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues || !selectedValues.length) {
                        return true;
                    }
                    const approverName = row.getValue(columnId);
                    const nameToCompare = (typeof approverName === 'string' ? approverName : (approverName ? String(approverName) : "")).toLowerCase();

                    return selectedValues.some(filterItem => {
                        const filterString = (typeof filterItem === 'string' ? filterItem : (filterItem ? String(filterItem) : "")).toLowerCase();
                        if (filterString === "") {
                            return true;
                        }
                        return nameToCompare.includes(filterString);
                    });
                }
            },
            {
                id: "tipo_aprobacion_hr",
                title: "RRHH",
                enableHiding:true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => {
                    const hrAprobacion = row.original.aprobaciones?.find(
                        (ap) => ap.tipo_aprobacion === 'hr'
                    );
                    return <ApprovalStatusPill aprobacion={hrAprobacion} />;
                },
                accessorFn: (originalRow) => {
                    const hrAprobacion = originalRow.aprobaciones?.find(
                        (ap) => ap.tipo_aprobacion === 'hr'
                    );
                    if (hrAprobacion && hrAprobacion.approvedBy) {
                        const approverName = hrAprobacion.approvedBy.empleado?.nombreCompleto || hrAprobacion.approvedBy.name;
                        const status = hrAprobacion.aprobado ? 'Aprobado' : 'Rechazado';
                        return `${status} - ${approverName}`;
                    }
                    return "-";
                },
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues || !selectedValues.length) {
                        return true;
                    }
                    const approverName = row.getValue(columnId);
                    const nameToCompare = (typeof approverName === 'string' ? approverName : (approverName ? String(approverName) : "")).toLowerCase();

                    return selectedValues.some(filterItem => {
                        const filterString = (typeof filterItem === 'string' ? filterItem : (filterItem ? String(filterItem) : "")).toLowerCase();
                        if (filterString === "") {
                            return true;
                        }
                        return nameToCompare.includes(filterString);
                    });
                }
            },
            {
                id: "tipo_aprobacion_direction",
                title: "Dirección",
                enableHiding:true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => {
                    const directionAprobacion = row.original.aprobaciones?.find(
                        (ap) => ap.tipo_aprobacion === 'direction'
                    );
                    return <ApprovalStatusPill aprobacion={directionAprobacion} />;
                },
                accessorFn: (originalRow) => {
                    const directionAprobacion = originalRow.aprobaciones?.find(
                        (ap) => ap.tipo_aprobacion === 'direction'
                    );
                    if (directionAprobacion && directionAprobacion.approvedBy) {
                        const approverName = directionAprobacion.approvedBy.empleado?.nombreCompleto || directionAprobacion.approvedBy.name;
                        const status = directionAprobacion.aprobado ? 'Aprobado' : 'Rechazado';
                        return `${status} - ${approverName}`;
                    }
                    return "-";
                },
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues || !selectedValues.length) {
                        return true;
                    }
                    const approverName = row.getValue(columnId);
                    const nameToCompare = (typeof approverName === 'string' ? approverName : (approverName ? String(approverName) : "")).toLowerCase();

                    return selectedValues.some(filterItem => {
                        const filterString = (typeof filterItem === 'string' ? filterItem : (filterItem ? String(filterItem) : "")).toLowerCase();
                        if (filterString === "") {
                            return true;
                        }
                        return nameToCompare.includes(filterString);
                    });
                }
            },

            , rowActionsColumn
        ];

        return columnsDefinition;
    }, []); // Dependencia del useMemo
}