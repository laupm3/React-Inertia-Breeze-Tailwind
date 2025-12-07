import { useState, useEffect } from 'react';
import DataTableSkeleton from '@/Components/App/Skeletons/DataTableSkeleton';
import { useColumns } from '../Hooks/useColumns';
import { DataTable } from '@/Components/App/DataTable/Partials/DataTable';
import { DataTableContextProvider } from '@/Components/App/DataTable/Context/DataTableContext';
import { useDataHandler } from '../Context/DataHandlerContext';
import BlockCard from '@/Components/OwnUi/BlockCard';
import { useView } from '../Context/ViewContext';
import Toolbar from './Toolbar';
import { RangeZone } from '../Components/RangeZone';
import SheetTable from '@/Components/App/Horarios/SheetTable/SheetTable'
import CreateUpdateDialog from '@/Components/App/Horarios/CreateUpdateDialog/CreateUpdateDialog';
import DeleteDialog from '@/Components/App/Horarios/DeleteDialog/DeleteDialog';

export default function DataTablePortal({ }) {
    const {
        horarios,
        setHorarios,
        loading,
    } = useDataHandler();

    const viewContext = useView();
    const columns = useColumns();

    const [dataForUpdate, setDataForUpdate] = useState({ updated: [], created: [] });

    useEffect(() => {
        if (!dataForUpdate) return;

        const { updated, created } = dataForUpdate;

        if ((!updated?.length) && (!created?.length)) return;

        setHorarios(prev => {
            const nuevosHorarios = [...prev];

            const procesar = (tipo, items) => {
                items.forEach(item => {
                    const empleadoId = item.empleado?.id;
                    const fecha = item.fecha_inicio;
                    const horarioId = item.id;

                    if (!empleadoId || !fecha) return;

                    const empleadoIndex = nuevosHorarios.findIndex(e => e.empleado?.id === empleadoId);
                    if (empleadoIndex === -1) return;

                    const empleado = { ...nuevosHorarios[empleadoIndex] };
                    const horariosPorFecha = { ...empleado.horarios };

                    const horariosDelDia = [...(horariosPorFecha[fecha] ?? [])];

                    const indexHorario = horariosDelDia.findIndex(h => h.id === horarioId);

                    if (tipo === 'updated' && indexHorario !== -1) {
                        horariosDelDia[indexHorario] = { ...horariosDelDia[indexHorario], ...item };
                    } else if (tipo === 'created') {
                        horariosDelDia.push({ ...item });
                    }

                    horariosPorFecha[fecha] = horariosDelDia;
                    empleado.horarios = horariosPorFecha;
                    nuevosHorarios[empleadoIndex] = empleado;
                });
            };

            if (Array.isArray(updated)) procesar('updated', updated);
            if (Array.isArray(created)) procesar('created', created);

            return nuevosHorarios;
        });
    }, [dataForUpdate]);

    const [sheetTable, setSheetTable] = useState(null);
    const [dialog, setDialog] = useState(null);
    const [deleteHorarios, setDeleteHorarios] = useState([]);

    const dialogIds = dialog?.filter(d => d.horarioId !== null).map(d => d.horarioId) ?? [];;

    if (loading) {
        return <DataTableSkeleton rows={10} columns={6} />
    }

    const transformarPorEmpleado = (data) => {
        const empleados = new Map();

        data?.forEach(({ key, horarioId, empleado, date }) => {
            const { id, nombre, profile_photo_url } = empleado;

            if (!empleados.has(id)) {
                empleados.set(id, {
                    empleado_id: id,
                    nombre,
                    profile_photo_url,
                    fechas: []
                });
            }

            const empleadoObj = empleados.get(id);

            // Busca si ya existe la fecha
            let fechaObj = empleadoObj.fechas.find(f => f.date === date);

            // Si no existe, la creamos
            if (!fechaObj) {
                fechaObj = {
                    date,
                    horarios: []
                };
                empleadoObj.fechas.push(fechaObj);
            }

            // ✅ Verificamos que el horarioId sea válido antes de insertar
            if (horarioId) {
                const yaExiste = fechaObj.horarios.some(h => h.horarioId === horarioId);

                if (!yaExiste) {
                    fechaObj.horarios.push({
                        key,
                        horarioId
                    });
                }
            }
        });

        return Array.from(empleados.values());
    };

    const eliminarHorariosPorId = (idsAEliminar = []) => {
        if (!Array.isArray(idsAEliminar) || idsAEliminar.length === 0) return;

        const nuevosHorarios = horarios.map(empleado => {
            const nuevosHorariosPorFecha = {};

            Object.entries(empleado.horarios).forEach(([fecha, listaHorarios]) => {
                const nuevaLista = listaHorarios.filter(h => !idsAEliminar.includes(h.id));

                if (nuevaLista.length > 0) {
                    nuevosHorariosPorFecha[fecha] = nuevaLista;
                }
            });

            return {
                ...empleado,
                horarios: nuevosHorariosPorFecha,
            };
        });

        setHorarios(nuevosHorarios);
    };

    return (
        <>
            <DataTableContextProvider
                key={horarios.length}
                data={horarios}
                columnsDef={columns}
                debug={false}
                entity="horarios"
                config={
                    {
                        getRowId: (row) => row.empleado.id,
                    }
                }
                initialState={{
                }}
                viewContext={viewContext}
                customToolbar={Toolbar} // Componente Toolbar personalizado opcional
            >
                <BlockCard title={'Horarios Administración'}>
                    <RangeZone setSheetTable={setSheetTable} setDialog={setDialog} setDeleteHorarios={setDeleteHorarios}>
                        <DataTable />
                    </RangeZone>
                </BlockCard>
            </DataTableContextProvider >

            {/* Información */}
            <SheetTable
                open={sheetTable !== null}
                onOpenChange={() => setSheetTable(null)}
                model={sheetTable}
            />

            {/* Dialog para crear/actualizar horarios */}
            <CreateUpdateDialog
                open={dialog !== null}
                onOpenChange={() => setDialog(null)}
                data={transformarPorEmpleado(dialog)}
                model={dialogIds}
                dataForUpdate={dataForUpdate}
                setDataForUpdate={setDataForUpdate}
                onDelete={eliminarHorariosPorId}
            />

            {/* eliminación de horarios */}
            <DeleteDialog
                open={deleteHorarios.length > 0}
                onOpenChange={() => setDeleteHorarios([])}
                model={deleteHorarios}
                onDelete={eliminarHorariosPorId}
            />
        </>
    )
}
