import RowActionsTrigger from "./Partials/RowActionsTrigger"

export const rowActionsColumn = {
    id: 'actions',
    title: "Acciones",
    enableHiding: false,
    enableSorting: false,
    enableFiltering: false,
    cell: ({ row }) => <RowActionsTrigger model={row.original} />,
}