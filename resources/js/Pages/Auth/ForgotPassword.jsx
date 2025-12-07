import { useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import TextInput from "@/Components/OwnUi/TextInput";
import InputLabel from "@/Components/OwnUi/InputLabel";

import { Head, useForm } from "@inertiajs/react";
import { useTranslation } from "react-i18next"; // Importa el hook de i18next
import CustomModal from "@/Components/Legacy/CustomModal";
import { Button } from "@/Components/App/Buttons/Button";
import PopUpIncidencias from "@/Components/App/PopUps/PopUpIncidencias";
import Icon from '@/imports/LucideIcon';

export default function ForgotPassword({ status }) {
    const { t } = useTranslation("forgotPassword"); // Inicializa el hook de traducción
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("password.email"));
    };

    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        razon: "",
    });

    const togglePopup = () => {
        setIsOpen((prev) => !prev);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí puedes manejar el envío del formulario
        console.log("Datos enviados:", formData);
        // Luego, puedes cerrar el popup y limpiar el formulario si lo deseas
        setIsOpen(false);
        setFormData({
            nombre: "",
            apellido: "",
            email: "",
            razon: "",
        });
    };
    return (
        <GuestLayout>
            <Head title={t("forgotPassword.title")} />{" "}
            {/* Traducción del título */}
            <h1 className="text-lg font-bold text-custom-orange md:text-nowrap pb-2">
                {t("forgotPassword.title")} {/* Traducción del título */}
            </h1>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {t("forgotPassword.description")}{" "}
                {/* Traducción del texto descriptivo */}
            </p>
            {status && (
                <CustomModal
                    show={!!status}
                    title={t("forgotPassword.successMessage")}
                    onClose={() => {}}
                    iconName="MailCheck"
                    iconClass="w-8 h-8 text-green-500"
                >
                    {t("forgotPassword.successDescription")}
                </CustomModal>
            )}
            {errors.email && (
                <CustomModal
                    show={!!errors.email}
                    title={t("forgotPassword.errorMessage") || "Error"}
                    onClose={() => {}}
                    iconName="OctagonAlert"
                    iconClass="w-8 h-8 text-red-500"
                >
                    {t("forgotPassword.errorDescription")}
                </CustomModal>
            )}
            <form onSubmit={submit}>
                <InputLabel
                    htmlFor="email"
                    value={t("forgotPassword.fields.email.label")}
                />
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    isFocused={true}
                    onChange={(e) => setData("email", e.target.value)}
                    placeholder={t("forgotPassword.fields.email.placeholder")}
                    autoComplete="username"
                    className="block w-full rounded-full bg-custom-gray-default dark:bg-custom-blackSemi mt-3 py-6 border-2 border-custom-gray-default dark:border-custom-blackSemi text-custom-gray-darker dark:text-custom-gray-light ${className}"
                />

                {/* <InputError message={errors.email} className="mt-2" /> */}

                <div className="mt-4 flex items-center justify-end">
                    <Button
                        variant="primary"
                        className="w-full"
                        disabled={processing}
                    >
                        {t("forgotPassword.button")}{" "}
                        {/* Traducción del texto del botón */}
                    </Button>
                </div>
            </form>
            <>
                <Button
                    variant="ghost"
                    onClick={togglePopup}
                    className="absolute bottom-10 right-10"
                >
                    <Icon
                        name="CircleHelp"
                        className="cursor-pointer text-custom-orange"
                    />
                </Button>
                {isOpen && (
                    <PopUpIncidencias
                        onClose={togglePopup}
                        formData={formData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                    />
                )}
            </>
        </GuestLayout>
    );
}
