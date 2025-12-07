import { useState, useEffect, useRef } from 'react';
import {
    Dialog as DialogBase,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/Components/ui/dialog";
import Icon from "@/imports/LucideIcon";
import { Button } from '@/Components/App/Buttons/Button';
import { Input } from "@/Components/ui/input";
import { useTranslation } from 'react-i18next';
import DecisionModal from '@/Components/App/Modals/DecisionModal';
import { useForm, usePage } from "@inertiajs/react";
import DefaultValuesForm from "@/Pages/Admin/Roles/Constants/DefaultValuesForm";
import userSchema from "@/Pages/Admin/Roles/Schema/userSchema";

export default function CreateUpdateDialog({ onClose, dataId, onOpenChange }) {

    const { t } = useTranslation(['datatable']);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const title = dataId ? 'Editar rol' : 'Crear rol';

    useEffect(() => {
        if (dataId) {
            const fetchData = async () => {
                try {
                    const response = await axios.get(route('api.v1.admin.roles.show', { id: dataId }));
                    if (response.status === 200) {
                        setRole(response.data.role);
                        sincronizeValues(response.data.role);
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

    const sincronizeValues = (role) => {
        const { id, name, description } = role;
        form.setData({
            id,
            name,
            description
        })
    }

    const form = useForm(DefaultValuesForm);

    /**
     * En base a si es una creación o edición, se realiza la petición correspondiente
     */
    const handleUpdateCreate = () => {
        const result = userSchema(t).safeParse(form.data);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            console.log('errors :>> ', errors);
            Object.keys(errors).forEach((key) => {
                form.setError(key, errors[key][0]);
            });
            return;
        }

        if (role) {
            form.put(route('admin.roles.update', { id: role.id }));
        } else {
            form.post(route('admin.roles.store'), {
                onSuccess: () => {
                    form.reset();
                    onOpenChange();
                },
                errorBag: 'updateOrCreateRol'
            });
        }
    }

    return (
        <>
            <DialogBase open={open} onOpenChange={onOpenChange || onClose}>
                <DialogDescription> {t('tables.creacionrol')} </DialogDescription>
                <DialogContent className="sm:max-w-[800px] flex flex-col bg-custom-white dark:bg-custom-blackLight">
                    <DialogHeader>
                        <DialogTitle className="">{title}</DialogTitle>
                    </DialogHeader>
                    {/* Form */}
                    <div className="flex flex-col gap-4 h-full overflow-y-auto p-8">
                        {/* Row */}
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <span className=" font-bold">Nombre<span className="text-custom-orange">*</span></span>
                                <Input
                                    placeholder={t('tables.añadirnombre')}
                                    className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                />
                                {form.errors.name && <span className="text-red-500 text-sm">{form.errors.name}</span>}
                            </div>
                            <div className="flex flex-col gap-2 ">
                                <span className=" font-bold">{t('tables.descripcion')}</span>
                                <Input
                                    placeholder='Añadir descripción'
                                    className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                />
                                <p className="text-xs font-bold ml-auto text-custom-gray-dark dark:text-custom-gray-darker">Máximo 255 caracteres</p>
                                {form.errors.description && <span className="text-red-500 text-sm">{form.errors.description}</span>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-end gap-4 ">
                        <DialogClose asChild>
                            <Button
                                onClick={onClose}
                                className="bg-hidden hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-black dark:text-custom-white  rounded-full"
                            >
                                {t('tables.cancelar')}
                            </Button>
                        </DialogClose>
                        <Button onClick={() => setOpenModal(true)} className="bg-custom-orange  hover:bg-custom-blue text-custom-white dark:text-custom-black dark:hover:text-custom-white rounded-full">{dataId ? t('tables.editarrol') : t('tables.aceptar')}</Button>
                    </DialogFooter>
                </DialogContent>
            </DialogBase>

            <DecisionModal
                variant="confirm"
                open={openModal}
                onOpenChange={() => setOpenModal(!openModal)}
                action={handleUpdateCreate}
                title={dataId ? '¿Confirmas la actualización del rol?' : '¿Confirmas la creación del rol?'}
                content={dataId
                    ? 'Al confirmar la actualización del rol, se modificarán los datos del rol seleccionado.'
                    : 'Al confirmar la creación del rol, se guardará el nuevo rol en la aplicación.'}
                icon={<Icon name="TriangleAlert" className="text-custom-orange" />}
            />
        </>
    );
}

