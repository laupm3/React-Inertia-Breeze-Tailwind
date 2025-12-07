import { useState, useEffect } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';

import BlockCard from '@/Components/OwnUi/BlockCard';
import { Button } from '@/Components/App/Buttons/Button';
import GoogleAddress from '@/Components/App/Direccion/GoogleAddress';
import { toast } from "sonner";

import Pill from "@/Components/App/Pills/Pill";
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";

import { Input } from "@/Components/ui/input";
import { DatePicker } from "@/Components/App/DatePicker/DatePicker";
import { format, parseISO } from "date-fns";


export default function UpdateProfileInformationForm({ user }) {
    const jetstream = usePage().props.jetstream;

    // Datos del empleado
    const {
        estado_empleado: { nombre: estadoEmpleado } = {},
        telefono_personal_movil = '',
        telefono_personal_fijo = '',
        contacto_emergencia = '',
        telefono_emergencia = '',
        nif = '',
        nombre = '',
        primer_apellido = '',
        segundo_apellido = '',
        fecha_nacimiento = '',
        email_secundario = '',
    } = user.empleado || {};

    // Datos dirección del empleado
    const {
        full_address = '',
        numero = '',
        piso = '',
        puerta = '',
        escalera = '',
        bloque = '',
        codigo_postal = '',
    } = user?.empleado?.direccion || {};

    const [verificationLinkSent, setVerificationLinkSent] = useState(false);

    // Initialize useForm first
    const { data, setData, post, errors, processing } = useForm({
        _method: 'PUT',
        name: user.name,
        email: user.email,
        descripcion: user.descripcion || '',
        telefono_personal_movil: telefono_personal_movil,
        telefono_personal_fijo: telefono_personal_fijo,
        email_secundario: email_secundario,
        contacto_emergencia: contacto_emergencia,
        telefono_emergencia: telefono_emergencia,
        fecha_nacimiento: fecha_nacimiento,

        // Address data
        full_address: full_address,
        numero: numero,
        piso: piso,
        puerta: puerta,
        escalera: escalera,
        bloque: bloque,
        codigo_postal: codigo_postal
    });

    // Estado local para la fecha de nacimiento para el DatePicker
    const [selectedBirthDate, setSelectedBirthDate] = useState(() => {
        if (!fecha_nacimiento) {
            return undefined;
        }

        try {
            return parseISO(fecha_nacimiento);
        } catch (error) {
            return undefined;
        }
    });

    // Sincronizar selectedBirthDate con el estado del formulario cuando el prop cambie
    useEffect(() => {
        if (fecha_nacimiento && !selectedBirthDate) {
            try {
                const parsedDate = parseISO(fecha_nacimiento);
                setSelectedBirthDate(parsedDate);
            } catch (error) {
            }
        }
    }, [fecha_nacimiento, selectedBirthDate]);

    const updateProfileInformation = (e) => {
        e.preventDefault();

        post(route('user-profile-information.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Éxito al actualizar la información del perfil");
            },
            onError: (errors) => {
                toast.error("Error al actualizar la información del perfil");
            }
        });
    };

    const sendEmailVerification = (e) => {
        e.preventDefault();
        setVerificationLinkSent(true);
    };

    return (
        <form onSubmit={updateProfileInformation} className="md:max-h-[800px] md:overflow-y-auto md:pr-2 md:[scrollbar-width:thin] md:[scrollbar-color:rgba(156,163,175,0.3)_transparent] md:[&::-webkit-scrollbar]:w-[6px] md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar-thumb]:bg-[rgba(156,163,175,0.3)] md:[&::-webkit-scrollbar-thumb]:rounded-[20px]">

            <BlockCard title="Información Personal">
                <div className="flex flex-col gap-8">
                    {/* Nombres / Primer Apellido / Segundo Apellido */}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Nombre</span>
                            <Input
                                value={nombre}
                                disabled
                                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                placeholder="Nombre"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Primer apellido</span>
                            <Input
                                value={primer_apellido}
                                disabled
                                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                placeholder='Primer apellido'
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Segundo apellido</span>
                            <Input
                                value={segundo_apellido}
                                disabled
                                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                placeholder="Segundo apellido"
                            />
                        </div>
                    </div>

                    {/* Información básica */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Nombre de usuario</span>
                            <Input
                                value={user.name}
                                disabled
                                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                            />
                        </div>

                        {/* Biografía Personal (editable) */}
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                Biografía personal
                            </span>
                            <div className="relative">
                                <textarea
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    className="block w-full rounded-xl text-sm bg-custom-gray-default dark:bg-custom-blackSemi border-none text-gray-800 dark:text-gray-200 pr-8 min-h-[80px] p-3 active:ring-0 focus:ring-0 focus:outline-none"
                                    maxLength={255}
                                    placeholder="Describe un poco sobre ti como usuario..."
                                />
                                {/* <div className="absolute right-3 top-3 pointer-events-none">
                                    <Icon name="PencilLine" className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </div> */}
                            </div>
                            {errors.descripcion && <span className="text-xs text-red-500">{errors.descripcion}</span>}
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">NIF</span>
                            <Input
                                value={nif || ''}
                                disabled
                                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                placeholder='Número de documentación'
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                Fecha de Nacimiento
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Empleado)</span>
                            </span>

                            <DatePicker
                                selectedDate={selectedBirthDate}
                                onSelect={(date) => {
                                    setSelectedBirthDate(date);

                                    if (date) {
                                        const formattedDate = format(date, 'yyyy-MM-dd');
                                        setData('fecha_nacimiento', formattedDate);
                                    } else {
                                        setData('fecha_nacimiento', '');
                                    }
                                }}
                                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                            />
                            {errors.fecha_nacimiento && <span className="text-xs text-red-500">{errors.fecha_nacimiento}</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Estado</span>
                            <div className="w-fit">
                                <Pill
                                    identifier={estadoEmpleado}
                                    children={estadoEmpleado}
                                    mapColor={STATUS_EMPLEADO_COLOR_MAP}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </BlockCard>

            <BlockCard title="Dirección">
                <div className="flex flex-col gap-8">
                    <GoogleAddress
                        selectedAddress={data.full_address}
                        data={{
                            numero: data.numero,
                            piso: data.piso,
                            puerta: data.puerta,
                            escalera: data.escalera,
                            bloque: data.bloque,
                            codigo_postal: data.codigo_postal
                        }}
                        handleChange={(field, value) => setData(field, value)}
                        onSelect={(placeDetails) => {
                            setData({
                                ...data,
                                full_address: placeDetails.full_address,
                                numero: placeDetails.street_number || data.numero,
                                codigo_postal: placeDetails.postal_code || data.codigo_postal,
                            });
                        }}
                        showMap={false}
                    />
                    {errors.full_address && <span className="text-xs text-red-500">{errors.full_address}</span>}
                </div>
            </BlockCard>

            <BlockCard title="Información de Contacto">
                <div className="flex flex-col gap-8">
                    {/* Teléfonos del Empleado */}
                    <div>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                            {/* Teléfono Personal Móvil */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    Teléfono personal móvil
                                </span>
                                <div className="relative">
                                    <Input
                                        value={data.telefono_personal_movil}
                                        onChange={(e) => setData('telefono_personal_movil', e.target.value)}
                                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi pr-8"
                                        placeholder="Teléfono móvil personal del empleado..."
                                    />
                                    {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <Icon name="PencilLine" className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    </div> */}
                                </div>
                                {errors.telefono_personal_movil && <span className="text-xs text-red-500">{errors.telefono_personal_movil}</span>}
                            </div>

                            {/* Teléfono Personal Fijo */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    Teléfono personal fijo
                                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Empleado)</span>
                                </span>
                                <div className="relative">
                                    <Input
                                        value={data.telefono_personal_fijo}
                                        onChange={(e) => setData('telefono_personal_fijo', e.target.value)}
                                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi pr-8"
                                        placeholder="Teléfono fijo personal del empleado..."
                                    />
                                    {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <Icon name="PencilLine" className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    </div> */}
                                </div>
                                {errors.telefono_personal_fijo && <span className="text-xs text-red-500">{errors.telefono_personal_fijo}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Emails */}
                    <div>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                            {/* Email Principal */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    Email principal
                                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Usuario)</span>
                                </span>
                                <Input
                                    value={data.email}
                                    type="email"
                                    disabled
                                    className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                    placeholder="Email principal del usuario..."
                                />
                                {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}

                                {(jetstream.hasEmailVerification && user.email_verified_at === null) && (
                                    <div className="text-sm mt-2 dark:text-white">
                                        Tu dirección de email no está verificada.
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                            onClick={sendEmailVerification}
                                        >
                                            Haz clic aquí para reenviar el email de verificación.
                                        </Link>

                                        {verificationLinkSent && (
                                            <div className="mt-2 font-medium text-sm text-green-600 dark:text-green-400">
                                                Se ha enviado un nuevo enlace de verificación a tu dirección de email.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Email Secundario */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    Email secundario
                                </span>
                                <div className="relative">
                                    <Input
                                        value={data.email_secundario}
                                        onChange={(e) => setData('email_secundario', e.target.value)}
                                        type="email"
                                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi pr-8"
                                        placeholder="Email secundario del empleado..."
                                    />
                                    {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <Icon name="PencilLine" className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    </div> */}
                                </div>
                                {errors.email_secundario && <span className="text-xs text-red-500">{errors.email_secundario}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Contacto de emergencia */}
                    <div>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    Nombre del contacto de emergencia
                                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(y relación)</span>
                                </span>
                                <div className="relative">
                                    <Input
                                        value={data.contacto_emergencia}
                                        onChange={(e) => setData('contacto_emergencia', e.target.value)}
                                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi pr-8"
                                        placeholder="Ejemplo: Laura Gómez (Hermana)"
                                    />
                                    {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <Icon name="PencilLine" className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    </div> */}
                                </div>
                                {errors.contacto_emergencia && <span className="text-xs text-red-500">{errors.contacto_emergencia}</span>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                    Teléfono de emergencia
                                </span>
                                <div className="relative">
                                    <Input
                                        value={data.telefono_emergencia}
                                        onChange={(e) => setData('telefono_emergencia', e.target.value)}
                                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi pr-8"
                                        placeholder="Teléfono de emergencia del empleado..."
                                    />
                                    {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <Icon name="PencilLine" className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    </div> */}
                                </div>
                                {errors.telefono_emergencia && <span className="text-xs text-red-500">{errors.telefono_emergencia}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </BlockCard>

            <div className="w-full py-4 px-6 bg-white dark:bg-custom-blackLight flex justify-end z-10">
                <Button
                    variant="primary"
                    type="submit"
                    className={`w-fit px-6 ${processing ? 'opacity-25' : ''}`}
                    disabled={processing}
                >
                    {processing ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>

        </form>
    );
}
