import AnexoRowActionsTrigger from "./AnexoRowActionsTrigger";

export const createAnexoRowActionsColumn = (onSaveData) => ({
    id: 'actions',
    title: "Acciones",
    enableHiding: false,
    enableSorting: false,
    enableFiltering: false,
    header: ({ column }) => <span className="text-center">Acciones</span>,
    cell: ({ row }) => (
        <div className="flex justify-center">
            <AnexoRowActionsTrigger 
                contrato={row.original} 
                onSaveData={onSaveData}
            />
        </div>
    ),
}); 