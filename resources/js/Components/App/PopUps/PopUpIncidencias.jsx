import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/App/Buttons/Button";
import { Textarea } from "@/Components/ui/textarea";
import { useTranslation } from "react-i18next";
import Icon from "@/imports/LucideIcon";
import { startTransition } from 'react';
/**
 * Componente card para reportar incidencias de la aplicación.
 * 
 * Props:
 * @param {function} onClose - Función para cerrar el popup.
 * @param {object} formData - Objeto que contiene los datos del formulario.
 * @param {function} handleChange - Función para manejar los cambios en los campos del formulario.
 * @param {function} handleSubmit - Función para manejar el envío del formulario.
 * @param {object} style - Estilos personalizados para el componente.
 * @param {string} className - Clase CSS personalizada para el componente.  
 */
 

function PopUpIncidencias({ onClose, formData, handleChange, handleSubmit, className }) {
    const { t } = useTranslation("welcome");
    return (
            <Card className={`w-96 h-96 bg-white dark:bg-custom-blackLight border-none shadow-lg rounded-lg ${className}`}>
                <CardHeader>
                    <CardTitle className="text-lg text-custom-blackLight dark:text-custom-white font-bold">
                        {t("incidencias.title")}
                    </CardTitle>
                    <p className="text-sm text-custom-gray-semiDark dark:text-custom-white">
                        {t("incidencias.description")}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => {
                        startTransition(() => handleSubmit(e));
                    }}>
                        <div className="flex flex-col space-y-3">
                            <div className="flex flex-row space-x-2">
                                <Input
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder={t("incidencias.nombre")}
                                    className="bg-custom-gray-default dark:bg-custom-blackSemi border-none rounded-full p-2"
                                />
                                <Input
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    placeholder={t("incidencias.apellido")}
                                    className="bg-custom-gray-default dark:bg-custom-blackSemi border-none rounded-full p-2"
                                />
                            </div>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@coreos.com"
                                className="bg-custom-gray-default dark:bg-custom-blackSemi border-none rounded-full p-2"
                            />
                            <Textarea
                                name="razon"
                                value={formData.razon}
                                onChange={handleChange}
                                placeholder={t("incidencias.razon")}
                                className="bg-custom-gray-default dark:bg-custom-blackSemi border-none rounded-xl p-2 resize-none h-28"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-32 items-center"
                                >
                                    <Icon name="Send" className="w-4 h-4 mr-2" />
                                    {t("incidencias.enviar")}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
    );
}

export default PopUpIncidencias;
