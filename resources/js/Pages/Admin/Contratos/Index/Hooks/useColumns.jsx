import { useMemo, useState } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";
import { createDateFilterFn } from "@/Components/App/DataTable/Components/Header/Utils/createDateFilterFn";
import AnexosTrigger from "../../Components/AnexosTrigger";
import JornadaDetail from "@/Components/App/Contratos/AnexosDialog/Partials/JornadaDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";
import { createAnexoRowActionsColumn } from "@/Components/App/Contratos/AnexosDialog/Components/AnexoRowActionsColumn";

export function useColumns(onSaveData, onDeleteItem) {

    return useMemo(() => {
        const columnsDefinition = [
            {
                id: "expediente",
                title: "Nº Expediente",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[150px]'}
                    />
                ),
                cell: ({ row }) => (
                    <div>{row.original.n_expediente}</div>
                ),
                accessorFn: (row) => `${row.n_expediente}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const expediente = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        expediente.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "asignacion",
                title: "Asignación",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <span>{row.original.asignacion?.nombre || '-'}</span>
                ),
                accessorFn: (row) => row.asignacion?.nombre || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const asignacion = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        asignacion.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "name",
                title: "Empleado",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <EmpleadoAvatar empleado={row.original.empleado} />
                ),
                accessorFn: (row) => {
                    const empleado = row.empleado;
                    const primerApellido = empleado?.primerApellido || '';
                    const segundoApellido = empleado?.segundoApellido || '';
                    const nombre = empleado?.nombre || '';
                    return `${primerApellido} ${segundoApellido}, ${nombre}`.trim();
                },
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "tipoContrato",
                title: "Tipo de contrato",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                        labelFn={(tipoContrato) => `${tipoContrato.clave} - ${tipoContrato.nombre}`}
                    />
                ),
                cell: ({ row }) => <div className="text-center">{row.original.tipoContrato?.clave || '-'}</div>,
                accessorFn: (row) => row.tipoContrato?.clave || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const tipoContrato = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        tipoContrato.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "fechaInicio",
                title: "Fecha de inicio",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                        filterType="date"
                    />
                ),
                cell: ({ row }) => (
                    <span>{format(row.original.fechaInicio, "PP", { locale: es })}</span>
                ),
                accessorFn: (row) => row.fechaInicio || null,
                filterFn: createDateFilterFn
            },

            {
                id: "fechaFin",
                title: "Fecha de fin",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                        filterType="date"
                    />
                ),
                cell: ({ row }) => (
                    <span>{(row.original.fechaFin)
                        ? format(row.original.fechaFin, "PP", { locale: es })
                        : null
                    }</span>
                ),
                accessorFn: (row) => row.fechaFin || null,
                filterFn: createDateFilterFn
            },
            {
                id: "empresa",
                title: "Empresa",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <span>{row.original.empresa?.siglas || '-'}</span>
                ),
                accessorFn: (row) => row.empresa?.siglas || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const empresa = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        empresa.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "centro",
                title: "Centro de trabajo",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <span>{row.original.centro?.nombre || '-'}</span>
                ),
                accessorFn: (row) => row.centro?.nombre || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const centro = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        centro.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "departamento",
                title: "Departamento",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <span>{row.original.departamento?.nombre || '-'}</span>
                ),
                accessorFn: (row) => row.departamento?.nombre || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const departamento = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        departamento.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "nif",
                title: "NIF",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => <span>{row.original.empleado?.nif || '-'}</span>,
                accessorFn: (row) => row.empleado?.nif || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nif = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        nif.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "mail",
                title: "Correo electrónico",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => <span>{row.original.empleado?.email || '-'}</span>,
                accessorFn: (row) => row.empleado?.email || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const email = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        email.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "estadoEmpleado",
                title: "Estado del empleado",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => (
                    <Pill
                        identifier={row.original.empleado?.estadoEmpleado?.nombre || 'unknown'}
                        children={row.original.empleado?.estadoEmpleado?.nombre || '-'}
                        mapColor={STATUS_EMPLEADO_COLOR_MAP}
                    />
                ),
                accessorFn: (row) => row.empleado?.estadoEmpleado?.nombre || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const estadoEmpleado = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        estadoEmpleado.toLowerCase() === value.toLowerCase()
                    );
                }
            },
            {
                id: "tipoEmpleado",
                title: "Tipo de empleado",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => <span>{row.original.empleado?.tipoEmpleado?.nombre || '-'}</span>,
                accessorFn: (row) => row.empleado?.tipoEmpleado?.nombre || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const tipoEmpleado = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        tipoEmpleado.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "verAnexos",
                title: "Ver Anexos",
                enableHiding: false,
                enableSorting: false,
                enableFiltering: false,
                header: ({ column }) => <span className="text-center">Ver Anexos</span>,
                cell: ({ row }) => <AnexosTrigger contrato={row.original} onSaveData={onSaveData} />,
            },
            {
                id: "jornada",
                title: "Ver Jornada",
                enableHiding: false,
                enableSorting: false,
                enableFiltering: false,
                header: () => <div className="text-center">Ver Jornada</div>,
                cell: ({ row }) => {
                    const jornadaId = row.original.jornada?.id;
                    if (!jornadaId) return null;

                    return (
                        <div className="text-center">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        className="flex items-center gap-2 hover:bg-transparent"
                                        title={row.original.jornada?.name || ""}
                                    >
                                        Ver jornada
                                        <Icon name="ArrowUpRight" className="w-4 ml-1" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Detalle de Jornada</DialogTitle>
                                    </DialogHeader>
                                    <JornadaDetail jornadaId={jornadaId} />
                                </DialogContent>
                            </Dialog>
                        </div>
                    );
                },
            },
            createAnexoRowActionsColumn(onSaveData)
        ];
        return columnsDefinition;
    }, [onSaveData, onDeleteItem]);
}
