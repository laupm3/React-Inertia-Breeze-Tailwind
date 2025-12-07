import RowActionsTrigger from "./RowActionsTrigger";

export const rowActionsColumn = {
    id: 'actions',
    title: "Acciones",
    enableHiding: false,
    enableSorting: false,
    enableFiltering: false,
    header: ({ column }) => <span className="text-center">Acciones</span>,
    cell: ({ row }) => <RowActionsTrigger model={row.original} />,
}