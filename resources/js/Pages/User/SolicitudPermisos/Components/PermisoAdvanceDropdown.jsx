import Pill from "@/Components/App/Pills/Pill";
import STATUS_TIPO_PERMISO_COLOR_MAP from "@/Components/App/Pills/constants/StatusTipoPermisoMapColor";
import AdvanceDropdown from "@/Components/App/AdvanceDropdown/AdvanceDropdown";

export default function PermisoAdvanceDropdown({
    value,
    onChange,
    className,
    ...props
}) {
    return (
        <AdvanceDropdown
            defaultValue={value}
            onChangeValue={(id, objeto) => {
                onChange(objeto);
            }} 
            fetchUrl={route('api.v1.admin.permisos.index')}
            dataKey="permisos"
            getItemId={permiso => permiso.id}
            renderSelection={permiso =>
                permiso ? (
                    <Pill
                        identifier={permiso.nombre}
                        mapColor={STATUS_TIPO_PERMISO_COLOR_MAP}
                        size="sm"
                        className="ml-0.5 -m-1.5 pointer-events-none"
                    >
                        {permiso.nombre || permiso.descripcion || `Permiso ID: ${permiso.id}`}
                    </Pill>
                ) : "Elige un tipo de permiso"
            }
            columns={[
                {
                    id: "nombre",
                    title: "Nombre del Permiso",
                    enableHiding: false,
                    enableSorting: true,
                    enableFiltering: true,
                    accessorFn: row => row.nombre,
                    cell: ({ row }) => (
                        <div className="flex items-center gap-2 pointer-events-none">
                            <Pill
                                identifier={row.original.nombre}
                                mapColor={STATUS_TIPO_PERMISO_COLOR_MAP}
                                size="xs"
                                className="pointer-events-none"
                            >
                                {row.original.nombre}
                            </Pill>
                        </div>
                    ),
                },
                {
                    id: "duracion",
                    title: "Duración Máx.",
                    enableHiding: false,
                    enableSorting: true,
                    enableFiltering: false,
                },
            ]}
            className={className}
            {...props}
        />
    );
}
