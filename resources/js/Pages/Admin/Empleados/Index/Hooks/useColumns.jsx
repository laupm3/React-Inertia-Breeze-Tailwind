import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";

import { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import ColumnFilter from "@/Components/App/DataTable/Components/Columns/ColumnFilter";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";
import ContratosVigentesTrigger from "../../Components/ContratosVigentesTrigger";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";
import { es, is, ro } from "date-fns/locale";
import { createDateFilterFn } from "@/Components/App/DataTable/Components/Header/Utils/createDateFilterFn";
import { format } from "date-fns";
import UserAvatar from "@/Components/App/User/UserAvatar";
import { useDataHandler } from "../Context/DataHandlerContext";

export function useColumns() {
    const { auth } = usePage().props;
    const { canViewHealthObservations } = useDataHandler();

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "empleado",
                title: "Nombre completo",
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
                cell: ({ row }) => <EmpleadoAvatar empleado={row.original} />,
                accessorFn: (row) => `${row.primerApellido} ${row.segundoApellido}, ${row.nombre}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;
                    
                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                );
            },
            sortingFn: (rowA, rowB, columnId) => {
                const a = rowA.getValue(columnId) || "";
                const b = rowB.getValue(columnId) || "";
                return a.localeCompare(b, 'es', { sensitivity: 'base' });
            }
        },
        {
            id: "email",
            title: "Email corporativo",
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
            cell: ({ row }) => row.original.email,
            accessorFn: (row) => row.email,
            filterFn: (row, columnId, selectedValues) => {
                if (!selectedValues.length) return true;

                const email = row.getValue(columnId);
                return selectedValues.some((value) =>
                    email.toLowerCase().includes(value.toLowerCase())
                );
            }
        },
            {
                id: "tipoDocumento",
                title: "Tipo de documento",
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
                cell: ({ row }) => row.original.tipoDocumento.nombre,
                accessorFn: (row) => row.tipoDocumento.nombre,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const tipoDocumento = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        tipoDocumento.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "nif",
                title: "Nº de documento",
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
                cell: ({ row }) => row.original.nif,
                accessorFn: (row) => row.nif,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nif = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        nif.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "caducidad",
                title: "Caducidad doc.",
                enableHiding: true,
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
                    <span>{(row.original.caducidadNif)
                        ? format(row.original.caducidadNif, "PP", { locale: es })
                        : null
                    }</span>
                ),
                accessorFn: (row) => `${row.caducidadNif}`,
                filterFn: createDateFilterFn
            },
            {
                id: "estadoEmpleado",
                title: "Estado del empleado",
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
                        identifier={row.original.estadoEmpleado.nombre}
                        children={row.original.estadoEmpleado.nombre}
                        mapColor={STATUS_EMPLEADO_COLOR_MAP}
                    />
                ),
                accessorFn: (row) => row.estadoEmpleado.nombre,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const estadoEmpleado = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        estadoEmpleado.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "niss",
                title: "NISS",
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
                cell: ({ row }) => row.original.niss,
                accessorFn: (row) => row.niss,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const niss = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        niss.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "emailSecundario",
                title: "Email personal",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                isHidden: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => row.original.emailSecundario,
                accessorFn: (row) => row.emailSecundario,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const emailSecundario = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        emailSecundario.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "telefono",
                title: "Teléfono",
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
                cell: ({ row }) => row.original.telefono,
                accessorFn: (row) => row.telefono,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const telefono = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        telefono.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "telefonoPersonal",
                title: "Tel. personal",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                isHidden: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => row.original.telefono_personal_movil,
                accessorFn: (row) => row.telefono_personal_movil,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const telefono_personal_movil = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        telefono_personal_movil.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "telefonoPersonalFijo",
                title: "Tel. personal fijo",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                isHidden: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => row.original.telefono_personal_fijo,
                accessorFn: (row) => row.telefono_personal_fijo,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const telefono_personal_fijo = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        telefono_personal_fijo.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "extension",
                title: "Ext. Centrex",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                isHidden: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => row.original.extension_centrex,
                accessorFn: (row) => row.extension_centrex,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const extension = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        extension.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "fechaNacimiento",
                title: "Fecha nacimiento",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                isHidden: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                        filterType="date"
                    />
                ),
                cell: ({ row }) => (
                    <span>{(row.original.fechaNacimiento)
                        ? format(row.original.fechaNacimiento, "PP", { locale: es })
                        : null
                    }</span>
                ),
                accessorFn: (row) => `${row.fechaNacimiento}`,
                filterFn: createDateFilterFn
            },
            {
                id: "contactoEmergencia",
                title: "Contacto emergencia",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                isHidden: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => row.original.contactoEmergencia,
                accessorFn: (row) => row.contactoEmergencia,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const contactoEmergencia = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        contactoEmergencia.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "telefonoEmergencia",
                title: "Tel. emergencia",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                isHidden: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => row.original.telefonoEmergencia,
                accessorFn: (row) => row.telefonoEmergencia,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const telefonoEmergencia = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        telefonoEmergencia.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "observacionesSalud",
                title: "Observaciones salud",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                isHidden: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[300px]'}
                    />
                ),
                cell: ({ row }) => (
                    <span className="text-sm">
                        {row.original.observacionesSalud || (
                            <span className="text-gray-400 italic">Sin observaciones</span>
                        )}
                    </span>
                ),
                accessorFn: (row) => row.observacionesSalud || '',
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const observaciones = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        observaciones.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "user",
                title: "Usuario asociado",
                enableHiding: true,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                isHidden: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[250px]'}
                    />
                ),
                cell: ({ row }) => {
                    return (row.original.user)
                        ? (
                            <UserAvatar user={row.original.user} />)
                        : (
                            <span className="text-gray-400 text-sm italic">No asignado</span>
                        )
                },
                accessorFn: (row) => `${row?.user?.name}`,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const fullname = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        fullname.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "contratosVigentes",
                title: "Contratos vigentes",
                enableHiding: true,
                enableSorting: false,
                sortUndefined: 'last',
                enableFiltering: false,
                header: ({ column }) => <span className="text-center">Contratos vigentes</span>,
                cell: ({ row }) => <ContratosVigentesTrigger empleado={row.original} />
            },
            {
                id: "empresas",
                title: "Empresas",
                enableHiding: true,
                enableSorting: false,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        key={`filter${column.id}`}
                        column={column}
                        labelFn={(empresa) => `${empresa.nombre}`}
                        valueFn={(empresa) => empresa.nombre}
                    />
                ),
                accessorFn: (row) => {
                    if (!row.empresas) return [];
                    return row.empresas.map(empresa => empresa.nombre.toLowerCase())
                },
                // Filtro personalizado para verificar si alguna de las empresas coincide
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreEmpresas = row.getValue(columnId);

                    return selectedValues.some((value) => {
                        return nombreEmpresas.some((empresa) => empresa.includes(value.toLowerCase()));
                    });
                }
            },
            {
                id: "departamentos",
                title: "Departamentos",
                enableHiding: false,
                enableSorting: false,
                sortUndefined: 'last',
                enableFiltering: true,
                hideColumn: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        key={`filter${column.id}`}
                        column={column}
                        labelFn={(departamento) => `${departamento.nombre}`}
                        valueFn={(departamento) => departamento.nombre}
                        className={'min-w-[150px] max-w-[250px]'}
                    />
                ),
                accessorFn: (row) => {
                    if (!row.departamentos) return [];
                    return row.departamentos.map(departamento => departamento.nombre.toLowerCase())
                },
                // Filtro personalizado para verificar si alguna de las empresas coincide
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const nombreDepartamentos = row.getValue(columnId);

                    return selectedValues.some((value) => {
                        return nombreDepartamentos.some((departamento) => departamento.includes(value.toLowerCase()));
                    });
                }
            },
            rowActionsColumn
        ];

        // Filtrar columnas basado en la información del backend
        const filteredColumns = columnsDefinition.filter(column => {
            // Si es la columna de observaciones de salud y el usuario no puede verlas, ocultarla
            if (column.id === 'observacionesSalud' && !canViewHealthObservations) {
                return false;
            }
            return true;
        });
        
        return filteredColumns;
    }, [auth.user, canViewHealthObservations]); // Dependencia del useMemo
}