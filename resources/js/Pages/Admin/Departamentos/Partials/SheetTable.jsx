import { SheetTable as SheetTableBase } from "@/Components/DataTable/SheetTable";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@/Components/LoadingSpinner";
import BlockCard from "@/Components/OwnUi/BlockCard";
import { useEffect, useState } from "react";
import { Alert } from "@/Components/ui/alert";
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";

export function SheetTable({ dataId, open, onOpenChange, jetstream, isMobile }) {
    const { t } = useTranslation(["datatable"]);
    const [departamento, setDepartamento] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    route("api.v1.admin.departamentos.show", { id: dataId })
                );
                if (response.status === 200) {
                    setDepartamento(response.data.departamento);
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
    }, [dataId]);

    return (
        <SheetTableBase
            title={
                <span className="text-custom-orange">
                    {departamento ? departamento.nombre : t("tables.departamento")}
                </span>
            }
            open={open}
            onOpenChange={onOpenChange}
            className={"min-w-[600px]"}
            descriptionContent={
                <>
                    <div className="text-custom-black dark:text-custom-white">
                        {departamento && <DepartamentoContent departamento={departamento} jetstream={jetstream} />}
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

const DepartamentoContent = ({ departamento, jetstream }) => {
    const { t } = useTranslation(["datatable"]);

    return (
        <>
            {/* Sección de información */}
            <BlockCard
                title={t("tables.info")}
                marginLeft="ml-4"
                className="border-4 rounded-xl p-4 mb-6 text-custom-blackLight dark:text-custom-gray-default"
            >
                <table className="min-w-full table-fixed">
                    <tbody className="bg-custom-white dark:bg-custom-blackLight border-custom">
                        <tr>
                            <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 w-32 rounded-ss-xl">
                                ID:
                            </td>
                            <td className="p-1.5 pl-4 text-sm text-start w-auto">
                                {departamento.manager.id || "N/A"}
                            </td>
                        </tr>
                        <tr>
                            <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                {t('tables.responsable')}:
                            </td>
                            <td className="p-1.5 pl-5 text-sm">
                                <div className="flex justify-start w-full">
                                    <EmpleadoAvatar empleado={departamento.manager} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                {t('tables.adjunto')}:
                            </td>
                            <td className="p-1.5 text-sm pl-4 text-start">
                                <EmpleadoAvatar empleado={departamento.adjunto} />
                            </td>
                        </tr>
                        <tr>
                            <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                {t('tables.descripcion')}:
                            </td>
                            <td className="p-1.5 text-sm pl-4 text-start">
                                {departamento.descripcion || "Not provided"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </BlockCard>

            {/* Sección de contratos vigentes */}
            <BlockCard
                title={t("tables.contratosVigentes")}
                marginLeft="ml-4"
                className="border-4 rounded-xl p-4"
            >
                <div className="overflow-auto dark:dark-scrollbar">
                    {departamento.contratosVigentes?.length > 0 ? (
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-custom-gray-default dark:bg-custom-blackSemi rounded-t-xl text-custom-blackSemi dark:text-custom-white">
                                    <th className="p-2 font-semibold text-sm text-center">Empleado</th>
                                    <th className="p-2 font-semibold text-sm text-center">Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departamento.contratosVigentes.map((contrato) => (
                                    <tr
                                        key={contrato.id}
                                        className="border-b last:border-none text-sm"
                                    >
                                        <td className="p-2 flex justify-between">
                                            {contrato?.empleado ? (
                                                <div >
                                                    <EmpleadoAvatar empleado={contrato.empleado} />
                                                </div>
                                            ) : (
                                                <span>No disponible</span>
                                            )}
                                        </td>
                                        <td >
                                            {contrato?.empleado?.user?.email || contrato?.empleado?.email || "No disponible"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-4 text-center text-custom-gray-default">
                            No hay contratos vigentes
                        </div>
                    )}
                </div>
            </BlockCard>
        </>
    );
};