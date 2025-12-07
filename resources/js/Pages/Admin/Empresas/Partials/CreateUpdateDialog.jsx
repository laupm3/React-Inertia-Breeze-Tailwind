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

import GoogleSearch from "@/Components/App/Direccion/GoogleSearch";

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import EmpleadoSelect from "@/Components/App/Empleado/EmpleadoSelect";
import { DialogDescription } from "@radix-ui/react-dialog";
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import Icon from "@/imports/LucideIcon";

import { z } from 'zod';
import EmpleadoAdvanceDropdown from "@/Components/App/Empleado/AdvanceDropdown/AdvanceDropdown";

/**
 * Empresa schema - Define the schema for the empresa object
 * 
 * @param {Object} empresa The empresa object
 * @param {string} empresa.nombre The name of the empresa
 * @param {string} empresa.siglas The siglas of the empresa
 * @param {string} empresa.cif The cif of the empresa
 * @param {string} empresa.email The email of the empresa
 * @param {string} empresa.telefono The telefono of the empresa
 * @param {number} empresa.representante_id The representante_id of the empresa
 * @param {number} empresa.adjunto_id The adjunto_id of the empresa
 * @param {Object} empresa.direccion The direccion of the empresa
 * @param {string} empresa.direccion.full_address The full_address of the empresa
 * @param {string} empresa.direccion.latitud The latitud of the empresa
 * @param {string} empresa.direccion.longitud The longitud of the empresa
 * @param {string} empresa.direccion.codigo_postal The codigo_postal of the empresa
 * @param {string} empresa.direccion.numero The numero of the empresa
 * @param {string} empresa.direccion.piso The piso of the empresa
 * @param {string} empresa.direccion.puerta The puerta of the empresa
 * @param {string} empresa.direccion.escalera The escalera of the empresa
 * @param {string} empresa.direccion.bloque The bloque of the empresa   
 * 
 */
const empresaSchema = (t) => z.object({
    id: z.nullable(z.number({ message: t('dialog.id') })),
    nombre: z.string().nonempty({ message: t('dialog.nombre') }),
    siglas: z.string().nonempty({ message: t('dialog.siglas') }),
    cif: z.string().nonempty({ message: t('dialog.cif') }),
    email: z.string().email({ message: t('dialog.email') }),
    telefono: z.string().nonempty({ message: t('dialog.telefono') }),
    representante_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: t('dialog.representante') }),
    adjunto_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: t('dialog.adjunto') }),
    direccion: z.object({
        id: z.nullable(z.number({ message: t('dialog.id') })),
        full_address: z.string().nonempty({ message: t('dialog.direccion') }),
        latitud: z.union([z.number(), z.string()]).refine(val => val !== null, { message: t('dialog.latitud') }),
        longitud: z.union([z.number(), z.string()]).refine(val => val !== null, { message: t('dialog.longitud') }),
        codigo_postal: z.string().nullable(),
        numero: z.string().nullable(),
        piso: z.string().nullable(),
        puerta: z.string().nullable(),
        escalera: z.string().nullable(),
        bloque: z.string().nullable(),
    }),
});

/**
 * Dialog component - Allow to create a new empresa or edit an existing one
 * 
 * @param {Object} props The props of the component
 * @param {Object} props.dataId The id of the empresa
 * @param {Object} props.open The state of the dialog
 * @param {Function} props.onOpenChange The function to change the state of the dialog
 * 
 * @returns {JSX.Element}
 */
export default function CreateUpdateDialog({ dataId, open, onOpenChange }) {

    const { t } = useTranslation('datatable');
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const defaultValues = {
        id: null,
        nombre: '',
        siglas: '',
        cif: '',
        email: '',
        telefono: '',
        representante_id: null,
        adjunto_id: null,
        direccion: {
            id: null,
            full_address: '',
            latitud: '',
            longitud: '',
            codigo_postal: '',
            numero: '',
            piso: '',
            puerta: '',
            escalera: '',
            bloque: '',
        },
    };

    useEffect(() => {
        if (dataId) {
            const fetchData = async () => {
                try {
                    const response = await axios.get(route('api.v1.admin.empresas.show', { id: dataId }));
                    if (response.status === 200) {
                        setEmpresa(response.data.empresa);
                        sincronizeValues(response.data.empresa);
                    } else {
                        setError(true);
                    }
                } catch (error) {
                    setError(true);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
            return () => { };
        }
    }, [dataId]);

    const sincronizeValues = (empresa) => {
        const { id, nombre, siglas, cif, email, telefono, representante, adjunto, direccion } = empresa;
        form.setData({
            id,
            nombre,
            siglas,
            cif,
            email,
            telefono,
            representante_id: representante?.id,
            adjunto_id: adjunto?.id,
            direccion: direccion,
        })
    }

    const form = useForm(defaultValues);

    const title = dataId ? t('tables.editarempresa') : t('tables.creacionempresa');

    /**
     * En base a si es una creación o edición, se realiza la petición correspondiente
     */
    const handleUpdateCreate = () => {
        const result = empresaSchema(t).safeParse(form.data);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            Object.keys(errors).forEach((key) => {
                form.setError(key, errors[key][0]);
            });
            return;
        }

        if (empresa) {
            form.put(route('admin.empresas.update', { id: empresa.id }), {
                onSuccess: () => {
                    form.reset();
                    onOpenChange();
                },
                preserveState: true,
                errorBag: 'updateOrCreateEmpresa'
            });
        } else {
            form.post(route('admin.empresas.store'), {
                onSuccess: () => {
                    form.reset();
                    onOpenChange();
                },
                errorBag: 'updateOrCreateEmpresa'
            });
        }
    }

    return (
        <>
            <DialogBase
                open={open}
                onOpenChange={onOpenChange}
            >
                <DialogDescription> {t('tables.creacionempresa')} </DialogDescription>
                <DialogContent className="sm:max-w-[1225px] sm:h-[620px] bg-custom-white dark:bg-custom-blackLight">
                    <DialogHeader>
                        <DialogTitle className="">{title}</DialogTitle>
                    </DialogHeader>

                    {/* Form */}
                    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
                        {/* Row 1 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold  text-custom-blue dark:text-custom-white">{t('datatable.nombre')}<span className="text-custom-orange"> *</span></span>
                                <Input
                                    placeholder={t('tables.añadirnombre')}
                                    className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                    value={form.data.nombre}
                                    onChange={(e) => form.setData('nombre', e.target.value)}
                                />
                                {form.errors.nombre && <span className="text-xs text-red-500">{form.errors.nombre}</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('datatable.siglas')}<span className="text-custom-orange"> *</span></span>
                                <Input
                                    placeholder="Siglas de la empresa"
                                    className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                    value={form.data.siglas}
                                    onChange={(e) => form.setData('siglas', e.target.value)}
                                />
                                {form.errors.siglas && <span className="text-xs text-red-500">{form.errors.siglas}</span>}
                            </div>
                            <div className="flex flex-col gap-2 ">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">CIF<span className="text-custom-orange"> *</span></span>
                                <Input
                                    placeholder="CIF de la empresa"
                                    className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                    value={form.data.cif}
                                    onChange={(e) => form.setData('cif', e.target.value)}
                                />
                                {form.errors.cif && <span className="text-xs text-red-500">{form.errors.cif}</span>}
                                <span className="text-xs text-custom-gray-semiDark dark:text-custom-gray-dark pl-1">{t('tables.RepetirRegistro')}</span>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('tables.representante')} <span className="text-custom-orange"> *</span></span>
                                <EmpleadoAdvanceDropdown
                                    defaultValue={form.data.representante_id}
                                    onChangeValue={(value) => form.setData('representante_id', value)}
                                    enableCreateUpdateView={true}
                                    enableSheetTableView={true}
                                />
                                {form.errors.representante_id && <span className="text-xs text-red-500">{form.errors.representante_id}</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('tables.adjunto')} <span className="text-custom-orange"> *</span></span>
                                <EmpleadoAdvanceDropdown
                                    defaultValue={form.data.adjunto_id}
                                    onChangeValue={(value) => form.setData('adjunto_id', value)}
                                />
                                {form.errors.adjunto_id && <span className="text-xs text-red-500">{form.errors.adjunto_id}</span>}
                            </div>

                        </div>

                        <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
                        <h3 className="font-bold ">Informacion de contacto</h3>
                        {/* Row 1 */}
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
                            <div className="flex flex-col gap-2 ">
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
                    </div>
                    <DialogFooter className="flex justify-end gap-4 ">
                        <DialogClose
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-hidden hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-black dark:text-custom-white rounded-full"
                        >
                            {t('tables.cancelar')}
                        </DialogClose>
                        <Button
                            className="bg-custom-orange  hover:bg-custom-blue text-custom-white dark:text-custom-black dark:hover:bg-custom-white rounded-full"
                            onClick={() => setOpenModal(true)}
                        >
                            {empresa ? 'Editar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogBase >

            <DecisionModal
                variant="confirm"
                open={openModal}
                onOpenChange={() => setOpenModal(!open)}
                action={handleUpdateCreate}
                title={'¿Estas seguro de crear la empresa?'}
                content={
                    'Esta acción creará una nueva empresa en el sistema. Ejecutando los flujos necesarios para su correcto funcionamiento.'
                }
                icon={<Icon name="TriangleAlert" className="text-custom-orange" />}
            />
        </>
    );
}
