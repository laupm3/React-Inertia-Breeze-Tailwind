import { useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import Separator from "@/Components/Separator";
import GoogleIcon from "@/../images/logos/google.svg";
import { useTranslation } from "react-i18next";
import { Head, Link } from "@inertiajs/react";
import Icon from "@/imports/LucideIcon";
import PopUpIncidencias from "@/Components/App/PopUps/PopUpIncidencias";
import { Button } from "@/Components/App/Buttons/Button";

/**
 * Show the welcome page, with the login buttons.
 *
 * @returns {JSX.Element}
 */
export default function Welcome() {
    const { t } = useTranslation("welcome");

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
            <Head title="RRHH Empresa" />

            <div className="text-custom-gray-dark pb-4">
                <h1 className="text-lg font-bold text-custom-orange md:text-nowrap pb-2">
                    {t("hello")}
                </h1>
                <p className="text-sm flex items-center  max-w-screen-md">
                    {t("description")}.
                </p>
            </div>

            {/* Botón de login con email */}
            <Link href={route("login.default")}>
                <Button variant="secondary" className="py-7 px-4 w-full">
                    <Icon name="Mail" className="mr-3 w-6" />
                    <span>{t("login.email")}</span>
                </Button>
            </Link>

            {/* Separador */}
            <Separator />

            {/* Botón de login con Google */}
            <a href={route("auth.google")}>
                <Button variant="secondary" className="py-7 px-4 w-full">
                    <GoogleIcon />
                    <span>{t("login.google")}</span>
                </Button>
            </a>

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
