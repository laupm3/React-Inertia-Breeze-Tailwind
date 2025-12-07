import {
    Dialog,
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
import { useEffect, useState, useCallback } from "react";
import { useForm } from "@inertiajs/react";
import EmpleadoSelect from "@/Components/App/Empleado/EmpleadoSelect";
import ParentDepartamentSelect from "@/Components/App/Departamento/ParentDepartamentSelect";
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import DefaultValuesForm from "@/Pages/Admin/Departamentos/Constants/DefaultValuesForm";
import DepartmentSchema from "@/Pages/Admin/Departamentos/Schema/DepartmentSchema";

/**
 * Dialog component - Allow to create a new departamento or edit an existing one
 */
export default function CreateUpdateDialog({ dataId, open, onOpenChange }) {
    const { t } = useTranslation(['datatable']);
    const [departamento, setDepartamento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const form = useForm(DefaultValuesForm);

    const fetchDepartamento = useCallback(async () => {
        try {

            const response = await axios.get(route('api.v1.admin.departamentos.show', { id: dataId }));

            if (response.status === 200) {
                setDepartamento(response.data.departamento);
                sincronizeValues(response.data.departamento);
            }
        } catch (error) {
            console.error("Error fetching departamento:", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [dataId]);

    useEffect(() => {
        if (dataId) {
            fetchDepartamento();
        } else {
            // Reset form for new departamento creation
            form.reset();
            setLoading(false);
        }
    }, [dataId, fetchDepartamento]);

    const sincronizeValues = useCallback((departamento) => {
        if (!departamento) return;

        const { id, nombre, manager, adjunto, descripcion, parentDepartment } = departamento;
        form.setData({
            id,
            nombre,
            manager_id: manager?.id,
            adjunto_id: adjunto?.id,
            descripcion,
            parent_department_id: parentDepartment?.id,
        });
    }, [form]);

    const handleUpdateCreate = useCallback(() => {
        const result = DepartmentSchema(t).safeParse(form.data);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            Object.keys(errors).forEach((key) => {
                form.setError(key, errors[key][0]);
            });
            return;
        }

        if (departamento) {
            form.put(route('admin.departamentos.update', { id: departamento.id }));
        } else {
            form.post(route('admin.departamentos.store'), {
                onSuccess: () => {
                    form.reset();
                    onOpenChange();
                },
                errorBag: 'updateOrCreateDepartamento'
            });
        }
    }, [departamento, form, onOpenChange, t]);

    const title = dataId ? t('tables.editardepartamento') : t('tables.creaciondepartamento');

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={onOpenChange}
            >
                <DialogContent className="sm:max-w-[1225px] sm:h-[590px] bg-custom-white dark:bg-custom-blackLight">
                    <DialogHeader>
                        <DialogTitle className="">{title}</DialogTitle>
                    </DialogHeader>

                    {/* Form */}
                    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex flex-col items-center gap-2">
                                    <Icon name="Loader" className="w-8 h-8 animate-spin text-custom-orange" />
                                    <span className="text-sm text-custom-blue dark:text-custom-white">Cargando información del departamento...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex flex-col items-center gap-2">
                                    <Icon name="AlertTriangle" className="w-8 h-8 text-red-500" />
                                    <span className="text-sm text-red-500">Error al cargar el departamento. Por favor, inténtalo de nuevo.</span>
                                    <Button
                                        className="mt-2 bg-custom-orange hover:bg-custom-blue text-custom-white dark:text-custom-black rounded-full"
                                        onClick={() => {
                                            setError(false);
                                            setLoading(true);
                                            fetchDepartamento();
                                        }}
                                    >
                                        Reintentar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Row 1 */}
                                <div className="">
                                    <div className="flex flex-col gap-2 ">
                                        <span className="text-sm font-bold  text-custom-blue dark:text-custom-white">{t('tables.nombredepartamento')}<span className="text-custom-orange"> *</span></span>
                                        <Input
                                            placeholder={t('tables.añadirdepartamento')}
                                            className=" rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                            value={form.data.nombre}
                                            onChange={(e) => form.setData('nombre', e.target.value)}
                                        />
                                        {form.errors.nombre && <span className="text-xs text-red-500">{form.errors.nombre}</span>}
                                        <span className="text-xs text-custom-gray-semiDark dark:text-custom-gray-dark pl-1">{t('tables.RepetirRegistro')}</span>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2 ">
                                        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('tables.manager')}<span className="text-custom-orange"> *</span></span>
                                        <EmpleadoSelect
                                            fetchUrl={route('api.v1.admin.empleados.searchByType', { typeId: 3 })}
                                            onSelect={(empleado) => form.setData('manager_id', empleado.id)}
                                            prevEmpleadoId={form.data.manager_id}
                                        />
                                        {form.errors.manager_id && <span className="text-xs text-red-500">{form.errors.manager_id}</span>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('tables.adjunto')}<span className="text-custom-orange"> *</span></span>
                                        <EmpleadoSelect
                                            fetchUrl={route('api.v1.admin.empleados.searchByType', { typeId: 2 })}
                                            onSelect={(empleado) => form.setData('adjunto_id', empleado.id)}
                                            prevEmpleadoId={form.data.adjunto_id}
                                        />
                                        {form.errors.adjunto_id && <span className="text-xs text-red-500">{form.errors.adjunto_id}</span>}
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="">
                                    <div className="flex flex-col gap-2 ">
                                        <span className="text-sm font-bold  text-custom-blue dark:text-custom-white">{t('tables.descripcion')}</span>
                                        <Input
                                            placeholder="Lorem ipsum dolor..."
                                            className=" rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                            value={form.data.descripcion}
                                            onChange={(e) => form.setData('descripcion', e.target.value)}
                                        />
                                        {form.errors.descripcion && <span className="text-xs text-red-500">{form.errors.descripcion}</span>}
                                    </div>
                                </div>

                                <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
                                <h1 className=" font-bold text-custom-blue dark:text-custom-white">{t('tables.InformacionContacto')}</h1>

                                {/* Row 4 */}
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('tables.departamento')}</span>
                                        <ParentDepartamentSelect
                                            fetchUrl={route('api.v1.admin.departamentos.index')}
                                            onSelect={(parentDepartment) => form.setData('parent_department_id', parentDepartment.id)}
                                            prevParentDepartamentoId={form.data.parent_department_id}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="flex justify-end gap-4 ">
                        <DialogClose
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-hidden hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-black dark:text-custom-white rounded-full"
                        >
                            {t('tables.cancelar')}
                        </DialogClose>
                        <Button
                            className="bg-custom-orange hover:bg-custom-blue text-custom-white dark:text-custom-black dark:hover:bg-custom-white rounded-full"
                            onClick={() => setOpenModal(true)}
                        >
                            {departamento ? 'Editar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DecisionModal
                variant="confirm"
                open={openModal}
                onOpenChange={() => setOpenModal(!openModal)}
                action={handleUpdateCreate}
                title={departamento ? '¿Estas seguro de editar el departamento?' : '¿Estas seguro de crear el departamento?'}
                content={
                    departamento
                        ? 'Esta acción actualizará el departamento en el sistema. Ejecutando los flujos necesarios para su correcto funcionamiento.'
                        : 'Esta acción creará un nuevo departamento en el sistema. Ejecutando los flujos necesarios para su correcto funcionamiento.'
                }
                icon={<Icon name="TriangleAlert" className="text-custom-orange" />}
            />
        </>
    );
}
