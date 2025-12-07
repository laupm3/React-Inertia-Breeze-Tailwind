import { useMemo } from "react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import Pill from "@/Components/App/Pills/Pill";
import { STATUS_USUARIO_COLOR_MAP } from "@/Components/App/Pills/constants/StatusUsuarioMapColor";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";
import UserAvatar from "@/Components/App/User/UserAvatar";
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";
import { createDateFilterFn } from "@/Components/App/DataTable/Components/Header/Utils/createDateFilterFn";

export function useColumns() {
    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "empleado",
                title: "Nombre",
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
                cell: ({ row }) => <UserAvatar user={row.original} />,
                accessorFn: (row) => `${row.name}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
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
                cell: ({ row }) => <span>{row.original.email}</span>,
                accessorFn: (row) => `${row.email}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const email = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        email.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "rol",
                title: "Rol",
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
                cell: ({ row }) => <span>{row.original?.role?.name || "Sin rol"}</span>,
                accessorFn: (row) => `${row.role?.name}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const role = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        role.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "status",
                title: "Estado",
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
                cell: ({ row }) => (
                    <Pill
                        identifier={row.original.status.name}
                        children={row.original.status.label}
                        mapColor={STATUS_USUARIO_COLOR_MAP}
                        size="text-xs"
                        textClassName="font-medium"
                    />
                ),
                accessorFn: (row) => `${row.status.label}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const status = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        status.toLowerCase() === value.toLowerCase()
                    );
                }
            },
            {
                id: "empleado_asociado",
                title: "Empleado asociado",
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
                cell: ({ row }) => {
                    const empleado = row.original.empleado;
                    if (!empleado) {
                        return <span className="text-gray-500">Sin empleado asociado</span>;
                    }
                    return <EmpleadoAvatar empleado={empleado} />;
                },
                accessorFn: (row) => {
                    const empleado = row.empleado;
                    if (!empleado) return 'Sin empleado asociado';
                    
                    const nombre = empleado?.nombre || '';
                    const primerApellido = empleado?.primerApellido || '';
                    const segundoApellido = empleado?.segundoApellido || '';
                    return `${nombre} ${primerApellido} ${segundoApellido}`.trim();
                },
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const empleadoName = row.getValue(columnId);
                    if (!empleadoName) return false;
                    
                    return selectedValues.some((value) =>
                        empleadoName.toLowerCase() === value.toLowerCase()
                    );
                }
            },
            {
                id: "created_at",
                title: "Fecha de alta",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                        filterType="date"
                    />
                ),
                cell: ({ row }) => <span>{row.original?.created_at || 'Sin fecha de alta'}</span>,
                accessorFn: (row) => row.created_at || '',
                filterFn: createDateFilterFn
            },
            {
                id: "delete_at",
                title: "Fecha de baja",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                        filterType="date"
                    />
                ),
                cell: ({ row }) => <span>{row.original?.deleted_at || 'Sin fecha de baja'}</span>,
                accessorFn: (row) => row.deleted_at || '',
                filterFn: createDateFilterFn
            },
            rowActionsColumn
        ];
        return columnsDefinition;
    }, []);
}