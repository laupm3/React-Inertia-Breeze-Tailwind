import { SheetTable as SheetTableBase } from "@/Components/DataTable/SheetTable";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@/Components/LoadingSpinner";
import BlockCard from "@/Components/OwnUi/BlockCard";
import { useEffect, useState } from "react";
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";
import { Alert } from "@/Components/ui/alert";

export function SheetTable({ dataId, open, onOpenChange }) {
    const { t } = useTranslation(["datatable"]);
    const [empresa, setEmpresa] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    route("api.v1.admin.empresas.show", { id: dataId })
                );
                if (response.status === 200) {
                    setEmpresa(response.data.empresa);
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
        return () => {};
    }, [dataId]);

    return (
        <SheetTableBase
            title={
                <span className="text-custom-orange">
                    {empresa ? empresa.nombre : t("tables.empresa")}
                </span>
            }
            open={open}
            onOpenChange={onOpenChange}
            className={"min-w-[600px]"}
            descriptionContent={
                <>
                    {/* Sección de Información de la Empresa */}
                    <div className="text-custom-black dark:text-custom-white">
                        {empresa && (
                            <>
                                <BlockCard
                                    title={t("tables.info")}
                                    marginLeft="ml-4"
                                    className="border-4 rounded-xl p-4 mb-6 text-custom-blackLight dark:text-custom-gray-default"
                                >
                                    <table className="min-w-full table-fixed">
                                        <tbody className="bg-custom-white dark:bg-custom-blackLight border-custom">
                                            <tr>
                                                <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 w-32 rounded-ss-xl">
                                                    {t("datatable.nombre")}:
                                                </td>
                                                <td className="p-1.5 pl-4 text-sm text-start w-auto">
                                                    {empresa?.nombre || "N/A"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                                    {t("tables.representante")}:
                                                </td>
                                                <td className="p-1.5 pl-5 text-sm">
                                                    <div className="flex justify-start w-full">
                                                        <EmpleadoAvatar
                                                            empleado={
                                                                empresa.representante
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                                    {t("tables.adjunto")}:
                                                </td>
                                                <td className="p-1.5 pl-5 text-sm">
                                                    <div className="flex justify-start w-full">
                                                        <EmpleadoAvatar
                                                            empleado={
                                                                empresa.adjunto
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                                    {t("tables.direccion")}:
                                                </td>
                                                <td className="p-1.5 text-sm pl-4 text-start">
                                                    {empresa.direccion
                                                        .full_address ||
                                                        "Not found"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                                    {t("tables.telefono")}:
                                                </td>
                                                <td className="p-1.5 text-sm pl-4 text-start">
                                                    {empresa?.telefono ||
                                                        "Not provided"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem] rounded-es-xl">
                                                    {t("tables.email")}:
                                                </td>
                                                <td className="p-1.5 text-sm pl-4 text-start break-words">
                                                    {empresa?.email ||
                                                        "Not provided"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </BlockCard>

                                {/* Sección de centros */}
                                <BlockCard
                                    title={t("tables.centros")}
                                    marginLeft="ml-4"
                                    className="border-4 rounded-xl p-4"
                                >
                                    <div className="overflow-auto dark:dark-scrollbar">
                                        <div className="grid grid-cols-3 font-semibold text-custom-blackSemi dark:text-custom-white text-sm p-2 bg-custom-gray-default dark:bg-custom-blackSemi rounded-t-xl">
                                            <div className="text-xs">
                                                {t("tables.centros")}
                                            </div>
                                            <div className="text-xs">
                                                {t("tables.direccion")}
                                            </div>
                                            <div className="text-xs">
                                                {t("tables.representante")}
                                            </div>
                                        </div>

                                        {empresa.centros.map((centro) => (
                                            <div
                                                key={centro.id}
                                                className="grid grid-cols-3 items-center text-sm p-2 border-b last:border-none"
                                            >
                                                <div className="text-xs">
                                                    {centro.nombre}
                                                </div>
                                                <div className="text-xs">{`${centro.direccion.full_address}`}</div>
                                                <div className="flex items-center text-xs pl-2">
                                                    <EmpleadoAvatar
                                                        empleado={
                                                            centro.responsable
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </BlockCard>
                            </>
                        )}
                        {loading && !error && <LoadingSpinner />}
                        {error && (
                            <Alert variant={"destructive"}>
                                Error Fetching Data
                            </Alert>
                        )}
                    </div>
                </>
            }
        />
    );
}
