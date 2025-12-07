import { useMemo } from "react";

import AdvancedHeader from "@/Components/App/DataTable/Components/Header/AdvancedHeader";
import { rowSelectionColumn } from "@/Components/App/DataTable/Components/Columns/RowSelectionColumn";
import Pill from "@/Components/App/Pills/Pill";
import { rowActionsColumn } from "@/Components/App/DataTable/Components/Columns/RowActionsColumn";
import WeightIndicator from "@/Components/App/Navigation/WeightIndicator";
import BOOLEAN_COLOR_MAP from "@/Components/App/Pills/constants/BooleanMapColor";

import Icon from "@/imports/LucideIcon";

export function useColumns(data = []) {

    return useMemo(() => {
        const columnsDefinition = [
            rowSelectionColumn,
            {
                id: "name",
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
                cell: ({ row }) => {
                    const level = row.original.level || 0;
                    const hasChildren = row.original.children && row.original.children.length > 0;
                    
                    return (
                        <div className="flex items-center">
                            {/* Contenedor con indentación */}
                            <div 
                                className="flex items-center w-full py-1 px-2"
                                style={{ marginLeft: `${level * 24}px` }}
                            >
                                {/* Icono de flecha para niveles > 0 */}
                                {level > 0 && (
                                    <Icon 
                                        name="CornerDownRight" 
                                        className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" 
                                    />
                                )}
                                
                                {/* Nombre del elemento */}
                                <span className={`${level === 0 ? 'font-semibold' : 'font-normal'}`}>
                                    {row.original.name}
                                </span>
                                
                                {/* Badge para elementos con hijos */}
                                {hasChildren && (
                                    <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                        {row.original.children.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                },
                accessorFn: (row) => row.name,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const name = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        name.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {  
                id:"description",
                title: "Descripción",
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
                cell: ({ row }) => <span>{row.original.description}</span>,
                accessorFn: (row) => row.description,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const description = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        description.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id:"route_name",
                title: "Ruta",
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
                cell: ({ row }) => <span>{row.original.route_name || 'Contenedor'}</span>,
                accessorFn: (row) => row.route_name,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;

                    const routeName = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        routeName.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "icon",
                title: "Icono",
                enableHiding: false,
                enableSorting: false,
                enableFiltering: false,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[100px]'}
                    />
                ),
                cell: ({ row }) => {
                    const iconName = row.original.icon || 'MapPin';
                    return (
                        <div className="flex justify-center">
                            <Icon name={iconName} className="w-6 h-6 text-custom-orange" />
                        </div>
                    );
                },
                accessorFn: (row) => row.icon,
            },
            {
                id: "weight",
                title: "Peso",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: false,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[120px]'}
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <WeightIndicator weight={row.original.weight} />
                    </div>
                ),
                accessorFn: (row) => row.weight,
            },
            {
                id: "permission",
                title: "Permiso",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[200px]'}
                    />
                ),
                cell: ({ row }) => {
                    const permission = row.original.permission;
                    
                    if (!permission) {
                        return (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                <Icon name="Shield" className="w-3 h-3 mr-1" />
                                Sin permiso
                            </span>
                        );
                    }
                    
                    return (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <Icon name="ShieldCheck" className="w-3 h-3 mr-1.5" />
                            {permission.name}
                        </span>
                    );
                },
                accessorFn: (row) => {
                    const permission = row.permission;
                    return permission ? permission.title : 'Sin permiso';
                },
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;
                    const permissionValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        permissionValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "is_important",
                title: "¿Es importante?",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[120px]'}
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <Pill 
                            identifier={row.original.is_important ? 'Sí' : 'No'}
                            mapColor={BOOLEAN_COLOR_MAP}
                            size="text-xs"
                            textClassName="font-medium"
                        >
                            {row.original.is_important ? 'Sí' : 'No'}
                        </Pill>
                    </div>
                ),
                accessorFn: (row) => row.is_important,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;
                    const isImportant = row.getValue(columnId);
                    return selectedValues.includes(isImportant ? 'Sí' : 'No');
                }
            },
            {
                id: "is_recent",
                title: "¿Es reciente?",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[120px]'}
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <Pill 
                            identifier={row.original.is_recent ? 'Sí' : 'No'}
                            mapColor={BOOLEAN_COLOR_MAP}
                            size="text-xs"
                            textClassName="font-medium"
                        >
                            {row.original.is_recent ? 'Sí' : 'No'}
                        </Pill>
                    </div>
                ),
                accessorFn: (row) => row.is_recent,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;
                    const isRecent = row.getValue(columnId);
                    return selectedValues.includes(isRecent ? 'Sí' : 'No');
                }
            },
            {
                id: "requires_employee",
                title: "¿Requiere empleado?",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: true,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[140px]'}
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <Pill 
                            identifier={row.original.requires_employee ? 'Sí' : 'No'}
                            mapColor={BOOLEAN_COLOR_MAP}
                            size="text-xs"
                            textClassName="font-medium"
                        >
                            {row.original.requires_employee ? 'Sí' : 'No'}
                        </Pill>
                    </div>
                ),
                accessorFn: (row) => row.requires_employee,
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;
                    const requiresEmployee = row.getValue(columnId);
                    return selectedValues.includes(requiresEmployee ? 'Sí' : 'No');
                }
            },
            {
                id: "parent_id",
                title: "Padre",
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
                cell: ({ row }) => {
                    const parentId = row.original.parent_id;
                    if (!parentId) {
                        return <span className="text-gray-500">Sin padre</span>;
                    }
                    
                    // Buscar el nombre del padre en los datos
                    const parent = data.find(item => item.id === parentId);
                    const parentName = parent ? parent.name : `ID: ${parentId}`;
                    
                    return (
                        <div className="flex items-center gap-2">
                            <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                {parentName}
                            </span>
                        </div>
                    );
                },
                accessorFn: (row) => {
                    const parentId = row.parent_id;
                    if (!parentId) return 'Sin padre';
                    const parent = data.find(item => item.id === parentId);
                    return parent ? parent.name : `ID: ${parentId}`;
                },
                filterFn: (row, columnId, selectedValues) => {
                    if (!selectedValues.length) return true;
                    const parentValue = row.getValue(columnId);
                    return selectedValues.some((value) =>
                        parentValue.toLowerCase().includes(value.toLowerCase())
                    );
                }
            },
            {
                id: "created_at",
                title: "Fecha de creación",
                enableHiding: false,
                enableSorting: true,
                sortUndefined: 'last',
                enableFiltering: false,
                header: ({ column }) => (
                    <AdvancedHeader
                        column={column}
                        className={'max-w-[150px]'}
                    />
                ),
                cell: ({ row }) => {
                    const date = new Date(row.original.created_at);
                    return (
                        <span className="text-sm text-gray-600">
                            {date.toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    );
                },
                accessorFn: (row) => row.created_at,
            },
            rowActionsColumn
        ];

        return columnsDefinition;
    }, [data]); // Dependencia del useMemo para recalcular cuando cambien los datos
}