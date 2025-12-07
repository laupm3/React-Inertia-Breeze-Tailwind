import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/OwnUi/TextInput";
import InputLabel from "@/Components/OwnUi/InputLabel";
import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";

import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/Components/App/Animations/Spinners/LoadingSpinner";
import PopUpIncidencias from "@/Components/App/PopUps/PopUpIncidencias";

/**
 * Show the login page using User and Password traditional method.
 *
 * @param {String} status The status of the login
 * @param {Boolean} canResetPassword Set to true if the user can reset the password
 *
 * @returns {JSX.Element}
 */
export default function Login({ status, canResetPassword }) {
    const { t, i18n } = useTranslation([
        "validation",
        "welcome",
        "glossary",
        "common",
    ]);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        transform,
        setError,
        clearErrors,
    } = useForm({
        email: "",
        password: "",
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false); // Estado para alternar visibilidad
    const [isLoading, setIsLoading] = useState(false); // Estado para controlar el popup de carga

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

    // Esquema de validación
    const loginSchema = z.object({
        email: z.string().email(t("email.invalid", { ns: "validation" })),
        password: z.string().min(8, t("password.min", { ns: "validation" })),
        remember: z.boolean(),
    });

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        // Validar los datos con zod
        const { success, error } = loginSchema.safeParse(data);
        // Asignar un valor vacío a 'errors' si no existe 'error'
        const { errors = [] } = error || {};
        if (!success) {
            errors.forEach((err) => {
                const { path: field, message } = err;
                setError(field[0], message);
            });
            return;
        }
        transform((data) => ({
            ...data,
            remember: data.remember ? "on" : "",
        }));
        setIsLoading(true); // Mostrar el popup de carga
        post(route("login"), {
            onFinish: () => {
                setIsLoading(false); // Ocultar el popup de carga
                reset("password");
            },
            onSuccess: () => {
                // Redirigir a la siguiente página después del login exitoso
                route("dashboard");
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            {status && (
                <div className="mb-5 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
            <form onSubmit={submit}>
                <div>
                    <InputLabel
                        htmlFor="email"
                        value={t("email.title", { ns: "validation" })}
                    />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        placeholder={t("email.placeholder", {
                            ns: "validation",
                        })}
                        onChange={(e) => setData("email", e.target.value)}
                        className="block w-full rounded-full bg-custom-gray-default dark:bg-custom-blackSemi mt-3 py-6 border-2 border-custom-gray-default dark:border-custom-blackSemi text-custom-gray-darker dark:text-custom-gray-light ${className}"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>
                <div className="mt-4">
                    <InputLabel
                        htmlFor={"password"}
                        value={t("password.title", { ns: "validation" })}
                    />
                    <div className="relative">
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            placeholder={t("password.placeholder", {
                                ns: "validation",
                            })}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="block w-full rounded-full bg-custom-gray-default dark:bg-custom-blackSemi mt-3 py-6 border-2 border-custom-gray-default dark:border-custom-blackSemi text-custom-gray-darker dark:text-custom-gray-light ${className}"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-5 flex items-center text-custom-blue dark:text-custom-white"
                        >
                            {showPassword ? (
                                <Icon name="Eye" className="w-5 h-5" />
                            ) : (
                                <Icon name="EyeOff" className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>
                <div className="mt-4 flex items-center">
                    <Button
                        variant="primary"
                        disabled={processing || isLoading} // Deshabilitar el botón mientras está procesando o cargando
                        className="text-custom-gray-default dark:text-custom-black font-semibold rounded-full py-6 px-4 w-full"
                    >
                        {t("login", { ns: "glossary" })}
                    </Button>
                </div>
                <div className="ml-2 block ">
                    <label className="flex ">
                        <p className="text-xs mt-4 text-custom-gray-dark">
                            Al iniciar sesión, aceptas los{" "}
                            <Link href={route("terms.service")} className="hover:underline">
                                Términos de servicio
                            </Link> y la <Link href={route("privacy.policy")} className="hover:underline">
                                Política de privacidad
                            </Link>
                            , incluida la política de{" "}
                            <Link href={route("cookies.policy")} className="hover:underline">
                                Uso de Cookies
                            </Link>
                            .
                        </p>
                    </label>
                    <div className="mt-4 flex items-center justify-start sm:justify-end">
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="rounded-md text-sm text-custom-gray-dark underline hover:text-custom-gray-darker focus:outline-none focus:ring-2 focus:ring-custom-orange focus:ring-offset-2 dark:text-custom-gray-semiLight dark:hover:text-custom-gray-light dark:focus:ring-offset-custom-gray-darker"
                            >
                                {t("password.forgot", { ns: "welcome" })}
                            </Link>
                        )}
                    </div>
                </div>
            </form>
            {isLoading && <LoadingSpinner />}
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
                        className="fixed bottom-20 right-14"
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
