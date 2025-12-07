import {
    Dialog as DialogBase,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from "react";
import { useForm, usePage } from "@inertiajs/react";
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import Icon from "@/imports/LucideIcon";
import CentroSelect from "@/Components/App/Centro/CentroSelect";
import FormDefaultValues from "@/Pages/Admin/Turnos/constants/FormDefaultValues";
import axios from "axios";
import turnoSchema from "@/Pages/Admin/Turnos/Schema/turnoSchema";
import { LoadingSpinner } from "@/Components/LoadingSpinner";
import { Alert } from "@/Components/ui/alert";

export default function CreateUpdateDialog({ dataId, open, onOpenChange }) {
    const { t } = useTranslation('datatable');
    const [turno, setTurno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    const form = useForm(FormDefaultValues);

    //funcion para obtener el turno
    //si el turno existe se obtiene, si no se muestra un error
    const fetchTurno = useCallback(async () => {
        if (!dataId) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(route('api.v1.admin.turnos.show', { id: dataId }));
            if (response.status === 200) {
                setTurno(response.data.turno);
                sincronizeValues(response.data.turno);
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [dataId]);

    useEffect(() => {
        fetchTurno();
    }, [fetchTurno]);

    //funcion para sincronizar los valores del turno
    const sincronizeValues = useCallback((turno) => {
        if (!turno) return;

        const { id, nombre, color, horaFin, horaInicio, centro_id, descansoInicio, descansoFin, descripcion, centro } = turno;

        form.setData({
            id,
            nombre: nombre || '',
            color: color || '#FB7D16',
            hora_inicio: horaInicio || '',
            hora_fin: horaFin || '',
            centro_id: centro?.id,
            descripcion: descripcion || '',
            descanso_inicio: descansoInicio || '',
            descanso_fin: descansoFin || ''
        });

        setIsBreak(!!descansoInicio && !!descansoFin);
    }, [form]);

    //funcion para crear o actualizar turno
    //si el turno existe se actualiza, si no se crea
    const handleUpdateCreate = useCallback(() => {
        const result = turnoSchema(t).safeParse(form.data);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            Object.keys(errors).forEach((key) => {
                form.setError(key, errors[key][0]);
            });
            return;
        }

        if (turno) {
            form.put(route('admin.turnos.update', { id: turno.id }), {
                onSuccess: () => {
                    onOpenChange(false);
                }
            });
        } else {
            form.post(route('admin.turnos.store'), {
                onSuccess: () => {
                    form.reset();
                    onOpenChange(false);
                },
                errorBag: 'updateOrCreateTurno'
            });
        }
    }, [turno, form, onOpenChange]);

    const title = dataId ? "Editar Turno" : "Crear Turno";

    return (
        <>
            <DialogBase
                open={open}
                onOpenChange={onOpenChange}
            >
                <DialogContent className="sm:max-w-[625px] flex flex-col bg-custom-white dark:bg-custom-blackLight">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>

                    {loading && !error && <LoadingSpinner />}
                    {error && <Alert variant={'destructive'}>Error al cargar los datos del turno</Alert>}

                    {!loading && !error && (
                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto p-4 max-h-[60vh]">
                            {/* Nombre y Color */}
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                        Nombre del Turno <span className="text-custom-orange">*</span>
                                    </span>
                                    <Input
                                        placeholder="Turno de mañana 40 horas..."
                                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                        value={form.data.nombre || ''}
                                        onChange={(e) => form.setData('nombre', e.target.value)}
                                    />
                                    {form.errors.nombre && <span className="text-xs text-red-500">{form.errors.nombre}</span>}
                                </div>
                                <div className="col-span-1 flex flex-col gap-2">
                                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                        Color
                                    </span>
                                    <div className="relative">
                                        <input
                                            type="color"
                                            className="h-10 w-42 rounded-xl border-none"
                                            value={form.data.color || '#FB7D16'}
                                            onChange={(e) => form.setData('color', e.target.value)}
                                            id="color"
                                        />
                                        <label
                                            className="absolute -top-6 -right-5 p-2.5 bg-custom-white dark:bg-custom-blackLight rounded-full"
                                            for="color"
                                        >
                                            <Icon name="Pipette" size="20" className="bg-custom-white dark:bg-custom-blackLight" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    Descripción
                                </span>
                                <Input
                                    placeholder="Loren Ipsum..."
                                    className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                    value={form.data.descripcion || ''}
                                    onChange={(e) => form.setData('descripcion', e.target.value)}
                                />
                                {form.errors.descripcion && <span className="text-xs text-red-500">{form.errors.descripcion}</span>}
                            </div>

                            <Separator className="bg-custom-blackSemi dark:bg-custom-white" />

                            {/* Centro asociado */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    Centro asociado <span className="text-custom-orange">*</span>
                                </span>
                                <CentroSelect
                                    fetchUrl={route('api.v1.admin.centros.index')}
                                    onSelect={(centro) => form.setData('centro_id', centro.id)}
                                    prevCentroId={form.data.centro_id}
                                />
                                {form.errors.centro_id && <span className="text-xs text-red-500">{form.errors.centro_id}</span>}
                            </div>

                            <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
                            <h3 className="font-bold">Horario</h3>

                            {/* Horario */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                        Hora de inicio <span className="text-custom-orange">*</span>
                                    </span>
                                    <Input
                                        type="time"
                                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                        value={form.data.hora_inicio || ''}
                                        onChange={(e) => form.setData('hora_inicio', e.target.value)}
                                    />
                                    {form.errors.hora_inicio && <span className="text-xs text-red-500">{form.errors.hora_inicio}</span>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                        Hora de fin <span className="text-custom-orange">*</span>
                                    </span>
                                    <Input
                                        type="time"
                                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                        value={form.data.hora_fin || ''}
                                        onChange={(e) => form.setData('hora_fin', e.target.value)}
                                    />
                                    {form.errors.hora_fin && <span className="text-xs text-red-500">{form.errors.hora_fin}</span>}
                                </div>
                            </div>

                            {/* Toggle para descanso */}
                            <button
                                className="flex flex-row items-center gap-3 text-sm font-semibold text-custom-blue dark:text-custom-white"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsBreak(!isBreak);
                                }}
                                type="button"
                            >
                                {isBreak ? (
                                    <Icon name="X" size="16" />
                                ) : (
                                    <Icon name="Plus" size="16" />
                                )}
                                {isBreak ? 'Quitar descanso' : 'Añadir descanso'}
                            </button>

                            {/* Descanso condicional */}
                            {isBreak && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                            Inicio del descanso
                                        </span>
                                        <Input
                                            type="time"
                                            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                            value={form.data.descanso_inicio || ''}
                                            onChange={(e) => form.setData('descanso_inicio', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                            Fin del descanso
                                        </span>
                                        <Input
                                            type="time"
                                            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                            value={form.data.descanso_fin || ''}
                                            onChange={(e) => form.setData('descanso_fin', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex justify-end gap-4 mt-4 px-4 pb-4">
                        <DialogClose
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-hidden hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-black dark:text-custom-white rounded-full"
                        >
                            Cancelar
                        </DialogClose>
                        <Button
                            className="bg-custom-orange hover:bg-custom-blue text-custom-white dark:text-custom-black dark:hover:bg-custom-white rounded-full"
                            onClick={() => setOpenModal(true)}
                        >
                            {turno ? 'Guardar cambios' : 'Crear turno'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogBase>

            <DecisionModal
                variant="confirm"
                open={openModal}
                onOpenChange={() => setOpenModal(!openModal)}
                action={handleUpdateCreate}
                title={turno ? '¿Estás seguro de actualizar este turno?' : '¿Estás seguro de crear este turno?'}
                content={
                    turno
                        ? 'Esta acción actualizará el turno en el sistema.'
                        : 'Esta acción creará un nuevo turno en el sistema.'
                }
                icon={<Icon name="TriangleAlert" className="text-custom-orange" />}
            />
        </>
    );
}
