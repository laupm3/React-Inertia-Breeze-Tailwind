import {
    Dialog as DialogBase,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/Components/ui/dialog";
import Icon from "@/imports/LucideIcon";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";
import { useTranslation } from 'react-i18next';
import EmpleadoSelect from "@/Components/App/Empleado/EmpleadoSelect";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "@inertiajs/react";
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import GoogleSearch from "@/Components/App/Direccion/GoogleSearch";

import EmpresaSelect from "@/Components/App/Empresa/EmpresaSelect";
import StatusSelect from "@/Components/App/Centro/StatusSelect";
import axios from "axios";
import DefaultValuesForm from "@/Pages/Admin/Centros/Constants/DefaultValuesForm";
import centroSchema from "@/Pages/Admin/Centros/Schema/centroSchema";

export default function CreateUpdateDialog({ dataId, open, onOpenChange }) {
    const { t } = useTranslation('datatable');
    const [centro, setCentro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const form = useForm(DefaultValuesForm);

    const fetchCentro = useCallback(async () => {
        try {
            const response = await axios.get(route('api.v1.admin.centros.show', { id: dataId }));
            if (response.status === 200) {
                setCentro(response.data.centro);
                sincronizeValues(response.data.centro);
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
        if (dataId) {
            fetchCentro();
        }
    }, [dataId, fetchCentro]);

    const sincronizeValues = useCallback((centro) => {
        const { id, nombre, email, telefono, responsable, coordinador, direccion, estado, empresa, departamentos } = centro;
        form.setData({
            id,
            nombre,
            email,
            telefono,
            responsable_id: responsable?.id,
            coordinador_id: coordinador?.id,
            empresa_id: empresa?.id,
            estado_id: estado?.id,
            departamento_ids: departamentos.map(departamento => departamento.id),
            direccion: direccion,
        });
    }, [dataId, form]);

    const handleUpdateCreate = useCallback(() => {
        const result = centroSchema(t).safeParse(form.data);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            Object.keys(errors).forEach((key) => {
                form.setError(key, errors[key][0]);
            });
            return;
        }

        if (centro) {
            form.put(route('admin.centros.update', { id: centro.id }));
        } else {
            form.post(route('admin.centros.store'), {
                onSuccess: () => {
                    form.reset();
                    onOpenChange();
                },
                errorBag: 'updateOrCreateCentro'
            });
        }
    }, [centro, form, onOpenChange, t]);

    const title = dataId ? t('tables.editarcentro') : t('tables.creacioncentro');

    return (
        <>
            <DialogBase
                open={open}
                onOpenChange={onOpenChange}
            >
                <DialogContent className="sm:max-w-[1225px] sm:h-[725px] bg-custom-white dark:bg-custom-blackLight">
                    <DialogHeader>
                        <DialogTitle className="">{title}</DialogTitle>
                    </DialogHeader>

                    {/* Form */}
                    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
                        {/* Row 1 */}
                        <div className="grid gap-8">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('tables.nombrecentro')}<span className="text-custom-orange"> *</span></span>
                                <Input
                                    placeholder={t('tables.añadircentro')}
                                    className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                    value={form.data.nombre}
                                    onChange={(e) => form.setData('nombre', e.target.value)}
                                />
                                {form.errors.nombre && <span className="text-xs text-red-500">{form.errors.nombre}</span>}
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('tables.administradorcentro')}<span className="text-custom-orange"> *</span></span>
                                <EmpleadoSelect
                                    fetchUrl={route('api.v1.admin.empleados.searchByType', { typeId: 3 })}
                                    onSelect={(empleado) => form.setData('responsable_id', empleado.id)}
                                    prevEmpleadoId={form.data.responsable_id}
                                />
                                {form.errors.responsable_id && <span className="text-xs text-red-500">{form.errors.responsable_id}</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('tables.coordinador')}<span className="text-custom-orange"> *</span></span>
                                <EmpleadoSelect
                                    fetchUrl={route('api.v1.admin.empleados.searchByType', { typeId: 2 })}
                                    onSelect={(empleado) => form.setData('coordinador_id', empleado.id)} // Corregido aquí
                                    prevEmpleadoId={form.data.coordinador_id}
                                />
                                {form.errors.coordinador_id && <span className="text-xs text-red-500">{form.errors.coordinador_id}</span>}
                            </div>
                        </div>

                        <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
                        <h3 className="font-bold">{t('tables.InformacionContacto')}</h3>
                        {/* Row 3 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    {t('tables.direccion')} <span className="text-custom-orange">*</span>
                                </span>
                                <GoogleSearch
                                    selectedAddress={form.data.direccion.full_address}
                                    onSelect={(placeDetails) => form.setData('direccion', { ...form.data.direccion, ...placeDetails })}
                                    showMap={false}
                                />
                                {form.errors.direccion && <span className="text-xs text-red-500">{form.errors.direccion}</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    Email <span className="text-custom-orange">*</span>
                                </span>
                                <Input
                                    placeholder="Email de la empresa"
                                    className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                />
                                {form.errors.email && <span className="text-xs text-red-500">{form.errors.email}</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    {t('tables.telefono')} <span className="text-custom-orange">*</span>
                                </span>
                                <Input
                                    placeholder="Teléfono de la empresa"
                                    className=" rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                    value={form.data.telefono}
                                    onChange={(e) => form.setData('telefono', e.target.value)}
                                />
                                {form.errors.telefono && <span className="text-xs text-red-500">{form.errors.telefono}</span>}
                            </div>
                        </div>
                        <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
                        <h3 className="font-bold">{t('tables.vinculacion')}</h3>
                        {/* Row 4 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    {t('tables.empresa')} <span className="text-custom-orange">*</span>
                                </span>
                                <EmpresaSelect
                                    fetchUrl={route('api.v1.admin.empresas.index')}
                                    onSelect={(empresa) => form.setData('empresa_id', empresa.id)}
                                    prevEmpresaId={form.data.empresa_id}
                                />
                                {form.errors.empresa_id && <span className="text-xs text-red-500">{form.errors.empresa_id}</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    {t('tables.estado')} <span className="text-custom-orange">*</span>
                                </span>
                                <StatusSelect
                                    fetchUrl={route('api.v1.admin.centros.status')}
                                    onSelect={(estado) => form.setData('estado_id', estado.id)}
                                    prevStatusId={form.data.estado_id}
                                />
                                {form.errors.estado_id && <span className="text-xs text-red-500">{form.errors.estado_id}</span>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-end gap-4">
                        <DialogClose
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-hidden hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-black dark:text-custom-white rounded-full"
                        >
                            {t('tables.cancelar')}
                        </DialogClose>
                        <Button
                            className="bg-custom-orange hover:bg-custom-blue text-custom-white dark:text-custom-black dark:hover:bg-custom-white rounded-full"
                            onClick={() => setOpenModal(true)}
                        >
                            {centro ? 'Editar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogBase>

            <DecisionModal
                variant="confirm"
                open={openModal}
                onOpenChange={() => setOpenModal(!open)}
                action={handleUpdateCreate}
                title={'¿Estas seguro de crear el centro?'}
                content={
                    'Esta acción creará un nuevo centro en el sistema. Ejecutando los flujos necesarios para su correcto funcionamiento.'
                }
                icon={<Icon name="TriangleAlert" className="text-custom-orange" />}
            />
        </>
    );
}
