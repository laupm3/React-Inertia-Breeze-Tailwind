import { SheetTable as SheetTableBase } from "@/Components/DataTable/SheetTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import Icon from "@/imports/LucideIcon";
import { LoadingSpinner } from "@/Components/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { useState, useEffect } from "react";
import { Alert } from "@/Components/ui/alert";
import { useTranslation } from 'react-i18next';

const HeaderContent = ({ data, t }) => (
    <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-24 w-24 rounded-full">
            {data?.user?.profile_photo_url ? (
                <AvatarImage
                    src={data.user.profile_photo_url}
                    alt={data.nombre}
                />
            ) : (
                <AvatarFallback className="rounded-lg">
                    {data.nombre[0]}
                </AvatarFallback>
            )}
        </Avatar>
        <div className="space-y-1 ">
            <div className="font-semibold block">
                {data.nombre} {data.primer_apellido}
            </div>
            <div className="truncate text-sm block">
                {data.tipo_empleado.nombre}
            </div>
            <div className="flex gap-3">
                <div className="space-y-1 ">
                    <div className="flex gap-2">
                        <Icon name="Mail" size="16" className="text-custom-orange" />
                        <span className="truncate text-xs">{data.email}</span>
                    </div>
                    <div className="flex gap-2">
                        <Icon name="Phone" size="16" className="text-custom-orange" />
                        <span className="truncate text-xs">
                            {data.telefono || "No phone available"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const DescriptionContent = ({ data, loading, error, t }) => (
    <div className="text-custom-black dark:text-custom-white overflow-hidden">
        <Tabs defaultValue="personalinformation" className="w-auto ">
            <TabsList className="w-full flex bg-custom-gray-default dark:bg-custom-gray-darker rounded-full">
                <TabsTrigger value="personalinformation" className="w-full rounded-2xl dark:text-white  data-[state=active]:text-custom-blue data-[state=active]:bg-custom-gray-semiLight">{t('tables.informacionpersonal')}</TabsTrigger>
                <TabsTrigger value="jobinformation" className="w-full rounded-2xl dark:text-white data-[state=active]:text-custom-blue data-[state=active]:bg-custom-gray-semiLight">{t('tables.informacionlaboral')}</TabsTrigger>
            </TabsList>
            <TabsContent className="border-4 rounded-xl dark:border-custom-gray-darker " value="personalinformation">
                <div className="dark:dark:border-custom-gray-darker p-2 flex justify-between ">
                    <span className="font-medium">{t('datatable.nombre')}: </span>
                    <span>{data.nombre || 'not Provided'}</span>
                </div>
                <div className="dark:border-custom-gray-darker border-t-4 p-2 flex justify-between">
                    <span className="font-medium">{t('datatable.primerapellido')}: </span>
                    <span>
                        {data.primer_apellido || 'not Provided'}
                    </span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('datatable.segundoapellido')}: </span>
                    <span>
                        {data.segundo_apellido || 'not Provided'}
                    </span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">NIF: </span>
                    <span>{data.nif || 'not Provided'}</span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">ID: </span>
                    <span>{data.id || 'not Provided'}</span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.genero')}: </span>

                    <span>
                        {data.genero?.nombre || 'not Provided'}
                    </span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.estado')}: </span>
                    <span>
                        {data.estado_empleado.nombre || 'not Provided'}
                    </span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.tipodocumento')}: </span>
                    <span>
                        {data.tipo_documento_id || 'not Provided'}
                    </span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.direccion')}: </span>
                    <span>
                        {data.direccion?.nombre_via || 'not Provided'}
                    </span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.email')}: </span>
                    <span>{data.email || 'not Provided'}</span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.emailsecundario')}: </span>
                    <span>
                        {data.email_secundario || 'not Provided'}
                    </span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.telefono')}: </span>
                    <span>{data.telefono || 'not Provided'}</span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.telefonosecundario')}: </span>
                    <span>
                        {data.telefono_secundario || 'not Provided'}
                    </span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">NISS: </span>
                    <span>{data.niss || 'not Provided'}</span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.telefonoemergencia')}: </span>
                    <span>
                        {data.telefono_emergencia || 'not Provided'}
                    </span>
                </div>
                <div className=" dark:border-custom-gray-darker border-t-4 p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.contactoemergencia')}: </span>
                    <span>
                        {data.contacto_emergencia || 'not Provided'}
                    </span>
                </div>
            </TabsContent>
            <TabsContent className="border-4 rounded-xl dark:border-custom-gray-darker " value="jobinformation">
                <div className="dark:border-custom-gray-darker  p-2 flex justify-between ">
                    <span className="font-medium">{t('tables.tipoempleado')}: </span>
                    <span>{data.tipo_empleado.nombre || 'not Provided'}</span>
                </div>
                <div className="dark:border-custom-gray-darker  p-2 flex justify-between border-t-4 ">
                    <span className="font-medium">{t('tables.estado')}: </span>
                    <span>{data.nombre || 'not Provided'}</span>
                </div>
                <div className="dark:border-custom-gray-darker  p-2 flex justify-between border-t-4 ">
                    <span className="font-medium">{t('tables.centro')}: </span>
                    <span>{data.nombre || 'not Provided'}</span>
                </div>
                <div className="dark:border-custom-gray-darker  p-2 flex justify-between border-t-4 ">
                    <span className="font-medium">{t('tables.departamento')}: </span>
                    <span>{data.nombre || 'not Provided'}</span>
                </div>
                <div className="dark:border-custom-gray-darker  p-2 flex justify-between border-t-4 ">
                    <span className="font-medium">{t('tables.contrato')}: </span>
                    <span>{data.nombre || 'not Provided'}</span>
                </div>
                <div className="dark:border-custom-gray-darker  p-2 flex justify-between border-t-4 ">
                    <span className="font-medium">{t('tables.horario')}: </span>
                    <span>{data.nombre || 'not Provided'}</span>
                </div>
            </TabsContent>
        </Tabs>

        {loading && !error && <LoadingSpinner />}
        {error && <Alert variant={'destructive'}>Error Fetching Data</Alert>}
    </div>
);

export function SheetTable({ data, open, onOpenChange }) {
    const [empleado, setEmpleado] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation(['datatable']);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/admin/empleados/${data.id}`);
                if (response.status === 200) {
                    setEmpleado(response.data.empleado);
                }
            } catch (error) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => { };
    }, [data.id]);

    return (
        <SheetTableBase
            title={t('tables.detalleempleado')}
            headerContent={<HeaderContent data={data} t={t} />}
            descriptionContent={<DescriptionContent data={data} loading={loading} error={error} t={t} />}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
}