import AdvanceDropdownBase from "@/Components/App/AdvanceDropdown/AdvanceDropdown"

export default function AdvanceDropdown({
    defaultValue = null,
    onChangeValue = () => { },
    value = null,
    onValueChange = () => { },
    error = null,
    enableCreateUpdateView = false,
    enableSheetTableView = false,
}) {
    
    // Manejar tanto onChangeValue como onValueChange para compatibilidad
    const handleChange = (newValue) => {
        onChangeValue(newValue);
        onValueChange(newValue);
    };

    const columns = [
        {
            id: "nombre",
            title: "Nombre",
            enableHiding: false,
            enableSorting: true,
            enableFiltering: true,
            header: ({ column }) => <span>Nombre</span>,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.nombre}</span>
                    {row.original.descripcion && (
                        <span className="text-sm text-muted-foreground">
                            {row.original.descripcion}
                        </span>
                    )}
                </div>
            ),
            accessorFn: (row) => row.nombre,
        },
        {
            id: "tipo",
            title: "Tipo",
            enableHiding: true,
            enableSorting: true,
            enableFiltering: true,
            header: ({ column }) => <span>Tipo</span>,
            cell: ({ row }) => (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {row.original.tipo || 'General'}
                </span>
            ),
            accessorFn: (row) => row.tipo || 'General',
        }
    ];

    return (
        <AdvanceDropdownBase
            defaultValue={defaultValue}
            value={value}
            onChangeValue={handleChange}
            renderSelection={(selectedValue) => (
                <div className="flex flex-col">
                    <span className="font-medium">{selectedValue?.nombre}</span>
                    {selectedValue?.descripcion && (
                        <span className="text-sm text-muted-foreground">
                            {selectedValue.descripcion}
                        </span>
                    )}
                </div>
            )}
            fetchUrl={route('api.v1.admin.permisos.index')}
            dataKey="permisos"
            columns={columns}
            enableCreateUpdateView={enableCreateUpdateView}
            enableSheetTableView={enableSheetTableView}
            cacheDuration={5 * 60 * 1000} // 5 minutos (los permisos cambian menos frecuentemente)
            placeholder="Seleccionar tipo de permiso..."
            searchPlaceholder="Buscar tipo de permiso..."
            error={error}
        />
    )
}
