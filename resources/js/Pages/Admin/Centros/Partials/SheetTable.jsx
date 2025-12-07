import { SheetTable as SheetTableBase } from "@/Components/DataTable/SheetTable";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";
import { Alert } from "@/Components/ui/alert";
import { LoadingSpinner } from "@/Components/LoadingSpinner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import Icon from "@/imports/LucideIcon";
import Maps from "@/Components/MapApi/Maps";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_CENTRO_COLOR_MAP from "@/Components/App/Pills/constants/StatusCentroMapColor";
import BlockCard from "@/Components/OwnUi/BlockCard";
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";

const CentroInfo = ({ center }) => (
    <div className="bg-custom-white dark:bg-custom-blackLight border-2 p-3 m-4 rounded-xl">
        <div className="flex">
            <Icon name="MapPin" className="w-4 text-custom-orange mr-2" />
            <h1 className="text-custom-blue font-bold">{center.nombre}</h1>
        </div>
        <div className="flex">
            <Icon name="Map" className="w-4 text-custom-gray-dark mr-2" />
            <p className="text-sm text-custom-gray-semiDark">{center.full_address} </p>
        </div>
        <div className="flex">
            <Icon name="Phone" className="w-4 text-custom-gray-dark mr-2" />
            <p className="text-sm text-custom-gray-semiDark">{center.telefono}</p>
        </div>
        <div className="flex">
            <Pill
                identifier={center.estado.nombre}
                children={center.estado.nombre}
                mapColor={STATUS_CENTRO_COLOR_MAP}
                size="text-xs"
                textClassName="font-medium"
            />
        </div>
    </div>
);

const MapDialog = ({ centro }) => (
    <Dialog>
        <DialogTrigger asChild>
            <Button
                variant="secondary"
                className="rounded-full bg-custom-gray-default dark:bg-custom-blackSemi"
            >
                <Icon name="MapPin" className="w-4 dark:text-custom-white text-custom-gray-dark mr-2" /> Mapa
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[1025px] sm:h-[625px] bg-custom-white dark:bg-custom-blackLight">
            <div className="flex-auto max-w-full max-h-full bg-custom-white dark:bg-custom-blackLight overflow-hidden p-4">
                <div className="rounded-3xl overflow-hidden h-full">
                    <Maps
                        centers={[centro]}
                        center={{ lat: centro.direccion.latitud, lng: centro.direccion.longitud }}
                        zoom={4}
                    />
                </div>
            </div>
            <div className="flex-1 max-w-full max-h-full bg-custom-white dark:bg-custom-blackLight overflow-hidden">
                <DialogHeader className="flex items-start">
                    <DialogTitle>Información</DialogTitle>
                </DialogHeader>
                <div className="overflow-auto h-full">
                    <CentroInfo center={centro} />
                </div>
            </div>
        </DialogContent>
    </Dialog>
);

/**
 * Componente que muestra la información de un centro en un SheetTable
 * 
 * @param {Object} props The props object
 * @param {Object} props.data The id of the data to fetch
 * @param {boolean} props.open The state of the SheetTable
 * @param {Function} props.onOpenChange The function to change the state of the SheetTable
 *  
 * @returns {JSX.Element}
 */
export default function SheetTable({ dataId, open, onOpenChange }) {
    const [centro, setCentro] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation(['datatable']);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    route("api.v1.admin.centros.show", { id: dataId })
                );
                if (response.status === 200) {
                    setCentro(response.data.centro);
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
                    {centro ? centro.nombre : t("tables.centros")}
                </span>
            }
            open={open}
            onOpenChange={onOpenChange}
            className={"min-w-[600px]"}
            descriptionContent={
                <>
                    {/* Sección de Información de la Empresa */}
                    <div className="text-custom-black dark:text-custom-white">
                        {centro && <CentrosContent centro={centro} />}
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

const CentrosContent = ({ centro }) => {
    const { telefono, email, empresa, responsable, coordinador, direccion, departamentos = [] } = centro;

    return (
        <>
            <BlockCard
                title={'Información'}
                marginLeft="ml-4"
                className="border-4 rounded-xl p-4 mb-6 text-custom-blackLight dark:text-custom-gray-default"
            >
                <table className="min-w-full table-fixed">
                    <tbody className="bg-custom-white dark:bg-custom-blackLight border-custom">
                        <tr>
                            <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 w-32 rounded-ss-xl">
                                Empresa:
                            </td>
                            <td className="p-1.5 pl-4 text-sm text-start w-auto">
                                {empresa?.nombre || "Sin empresa asignada"}
                            </td>
                        </tr>
                        <tr>
                            <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                Responsable:
                            </td>
                            <td className="p-1.5 pl-5 text-sm">
                                <div className="flex justify-start w-full">
                                    <EmpleadoAvatar empleado={responsable} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                Coordinador:
                            </td>
                            <td className="p-1.5 pl-5 text-sm">
                                <div className="flex justify-start w-full">
                                    <EmpleadoAvatar empleado={coordinador} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                Dirección:
                            </td>
                            <td className="p-1.5 text-sm pl-4 text-start">
                                {direccion.full_address || "Sin dirección especificada"}
                            </td>
                        </tr>
                        <tr>
                            <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem]">
                                Teléfono:
                            </td>
                            <td className="p-1.5 text-sm pl-4 text-start">
                                {telefono || "Sin especificar"}
                            </td>
                        </tr>
                        <tr>
                            <td className="p-1.5 font-bold text-custom-blackLight dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi px-4 max-w-[10rem] rounded-es-xl">
                                Email:
                            </td>
                            <td className="p-1.5 text-sm pl-4 text-start break-words">
                                {email || "Sin especificar"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </BlockCard>

            {/* Sección de Departamentos */}
            <BlockCard
                title={'Departamentos'}
                marginLeft="ml-4"
                className="border-4 rounded-xl p-4"
            >
                <div className="overflow-auto dark:dark-scrollbar">
                    <div className="grid grid-cols-3 font-semibold text-custom-blackSemi dark:text-custom-white text-sm p-2 bg-custom-gray-default dark:bg-custom-blackSemi rounded-t-xl">
                        <div> Departamento </div>
                        <div> Empleados </div>
                        <div> Mánager </div>
                    </div>

                    {departamentos.map((departamento) => (
                        <div
                            key={departamento.id}
                            className="grid grid-cols-3 items-center text-sm p-2 border-b last:border-none"
                        >
                            <div> {departamento.nombre} </div>
                            <div> {departamento.contratosVigentes?.length || 0} </div>
                            <div className="flex items-center pl-2">
                                <EmpleadoAvatar empleado={departamento.manager} />
                            </div>
                        </div>
                    ))}
                </div>
            </BlockCard>
            <MapDialog centro={centro} />
        </>
    )
};
