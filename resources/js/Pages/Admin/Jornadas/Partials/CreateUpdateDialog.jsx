import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/Components/ui/dialog";
import Icon from "@/imports/LucideIcon";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import DayItem from "@/Pages/Admin/Jornadas/Partials/DayItem";
import WeekdayPreview from "./WeekdayPreview";
import FormDefaultValues from "@/Pages/Admin/Jornadas/Constants/FormDefaultValues";
import { jornadasSchema } from "@/Pages/Admin/Jornadas/Schemas/jornadasSchema";
import { calculateTotalWeekHours } from "@/Pages/Admin/Jornadas/Utils/functions";

import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

import { useTranslation } from 'react-i18next';

export default function CreateUpdateDialog({ dataId, open, onOpenChange }) {
    // State - API
    const [jornada, setJornada] = useState(null);
    const [modalidades, setModalidades] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    // State - Optional
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // State - Visuales
    const [openModal, setOpenModal] = useState(false);

    // State traducciones
    const { t } = useTranslation('datatable');

    // Helpers - API
    const [prevData, setPrevData] = useState(FormDefaultValues);

    // Formulario
    const { data, setData, post, put, errors, reset } = useForm(FormDefaultValues);

    // Helper - Días de la semana
    const weekdayNumbers = [0, 1, 2, 3, 4, 5, 6];
    const weekdayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // Cargar datos de modalidades y turnos solo una vez cuando el componente se monte
    useEffect(() => {
        if (!dataLoaded) {
            const fetchData = async () => {
                try {
                    // Realizar ambas solicitudes en paralelo para mayor eficiencia
                    const [modalidadesResponse, turnosResponse] = await Promise.all([
                        axios.get(route('api.v1.admin.modalidades.index')),
                        axios.get(route('api.v1.admin.turnos.index'))
                    ]);

                    if (modalidadesResponse.status === 200) {
                        setModalidades(modalidadesResponse.data.modalidades);
                    }

                    if (turnosResponse.status === 200) {
                        setTurnos(turnosResponse.data.turnos);
                    }

                    // Marcar datos como cargados para evitar futuras llamadas
                    setDataLoaded(true);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };

            fetchData();
        }
    }, [dataLoaded]);

    /**
     * Este método sincroniza los valores del formulario ligados al nombre, descripción y esquema de la jornada	
     * 
     * @param {String} key El nombre de la propiedad del formulario
     * @param {Any} value El valor de la propiedad
     */
    const sincronizePrevData = (key, value) => {
        setPrevData((prev) => ({ ...prev, [key]: value }));
    }

    const validateForm = () => {
        try {
            // Get the schema with translations
            const schema = jornadasSchema(t);
            // Parse the data with the schema
            schema.parse(data);
            setValidationErrors({});
            return true;
        } catch (error) {
            // Format Zod errors into a more usable format
            const formattedErrors = {};
            if (error.errors) {
                error.errors.forEach(err => {
                    const path = err.path.join('.');
                    formattedErrors[path] = err.message;
                });
            }
            setValidationErrors(formattedErrors);
            return false;
        }
    };

    const handleUpdateCreate = async () => {
        if (!validateForm()) {
            return;
        }

        if (jornada) {
            put(route('admin.jornadas.update', { id: jornada.id }), {
                onSuccess: () => {
                    reset();
                    onOpenChange();
                },
                onError: (errors) => {
                    console.error("Error en la actualización:", errors);
                },
                preserveState: true,
                errorBag: 'updateOrCreateJornada'
            });
        } else {
            post(route('admin.jornadas.store'), {
                onSuccess: () => {
                    reset();
                    onOpenChange();
                },
                onError: (errors) => {
                    console.error("Error en la creación:", errors);
                },
                errorBag: 'updateOrCreateJornada'
            });
        }
    }
    // Sincronizar los datos de la jornada si se recibe un ID
    useEffect(() => {
        const { id, name, description, esquema } = prevData;
        const validateEsquema = esquema.filter(({ turno_id, modalidad_id, weekday_number }) => turno_id && modalidad_id && (weekday_number != null));

        setData({
            id,
            name,
            description,
            esquema: validateEsquema
        })
    }, [prevData])

    // Cargar datos de la jornada si se recibe un ID
    useEffect(() => {
        if (dataId) {
            const fetchData = async () => {
                try {
                    const response = await axios.get(route('api.v1.admin.jornadas.show', { id: dataId }));
                    if (response.status === 200) {
                        const jornadaFromAPI = response.data.jornada;
                        const { id, name, description, esquema } = jornadaFromAPI;
                        setJornada(response.data.jornada);
                        setPrevData({
                            id,
                            name,
                            description,
                            esquema: esquema
                        });
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
        } else {
            setLoading(false);
        }
    }, [dataId]);

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={onOpenChange}
            >
                <DialogContent className="sm:max-w-[1200px] max-h-[90vh] flex flex-col bg-custom-white dark:bg-custom-blackLight">
                    <DialogHeader className="px-6 pt-4">
                        <DialogTitle className="">{dataId ? "Editar Jornada" : "Crear Jornada"}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-2">
                        {/* Se muestra el indicador cuando se Fetchea la Data */}
                        {loading ? (
                            <div className="flex justify-center items-center p-8">
                                <span className="text-custom-blue dark:text-custom-white">Cargando...</span>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center p-8">
                                <span className="text-red-500">Error al cargar los datos</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 h-full">

                                {/* Nombre */}
                                <div className="flex flex-col gap-2 ">
                                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                        Nombre <span className="text-custom-orange">*</span>
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Nombre de la jornada"
                                            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi flex-1"
                                            value={prevData.name}
                                            onChange={(e) => sincronizePrevData('name', e.target.value)}
                                        />
                                        <div className="relative">
                                            <Input
                                                readOnly
                                                tabIndex="-1"
                                                value={`${calculateTotalWeekHours(prevData.esquema)} h`}
                                                className="rounded-full dark:text-custom-gray-default text-custom-gray-dark bg-custom-gray-default dark:bg-custom-blackSemi w-[120px] text-center pl-8 pointer-events-none select-none"
                                            />
                                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <Icon name="Clock" className="text-custom-orange w-4 h-4" />
                                            </div>
                                            <span className="absolute -top-7 text-sm font-bold text-custom-blue dark:text-custom-white">
                                                H. Semanales
                                            </span>
                                        </div>
                                    </div>
                                    {(errors.name || validationErrors.name) &&
                                        <span className="text-xs text-red-500">{errors.name || validationErrors.name}</span>}
                                </div>

                                {/* Descripción */}
                                <div className="flex flex-col gap-2 ">
                                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
                                        Descripción
                                    </span>
                                    <Input
                                        placeholder="Descripción de la jornada"
                                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                        value={prevData.description}
                                        onChange={(e) => sincronizePrevData('description', e.target.value)}
                                    />
                                    {(errors.description || validationErrors.description) &&
                                        <span className="text-xs text-red-500">{errors.description || validationErrors.description}</span>}
                                </div>

                                {/* Preview de la jornada */}
                                <div className="">
                                    {dataLoaded && (
                                        <WeekdayPreview
                                            esquema={prevData.esquema || []}
                                            turnos={turnos}
                                            modalidades={modalidades}
                                        />
                                    )}
                                </div>

                                {/* Esquema de Jornada */}
                                <div className="mt-4">
                                    <h3 className="text-sm font-bold text-custom-blue dark:text-custom-white mb-2">Esquema de Jornada</h3>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr >
                                                    <th className="p-2 text-left">Día</th>
                                                    <th className="p-2 text-left">Turno</th>
                                                    <th className="p-2 text-left">Modalidad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {weekdayNumbers.map((index) => (
                                                    <DayItem
                                                        key={index}
                                                        weekdayName={weekdayNames[index]}
                                                        weekday={
                                                            prevData.esquema.find(({ weekday_number }) => weekday_number === index) || {
                                                                turno_id: null,
                                                                modalidad_id: null,
                                                                weekday_number: index
                                                            }
                                                        }
                                                        prevData={prevData}
                                                        sincronizePrevData={sincronizePrevData}
                                                        turnos={turnos}
                                                        modalidades={modalidades}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {(errors.esquema || validationErrors.esquema || validationErrors['esquema']) &&
                                        <span className="text-xs text-red-500 mt-1">{errors.esquema || validationErrors.esquema || validationErrors['esquema']}</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="px-6 pb-4 pt-2 flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700">
                        <DialogClose
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-hidden hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi text-custom-black dark:text-custom-white rounded-full"
                        >
                            {t('tables.cancelar')}
                        </DialogClose>
                        <Button
                            className="bg-custom-orange hover:bg-custom-blue text-custom-white dark:text-custom-black dark:hover:bg-custom-white rounded-full"
                            onClick={() => setOpenModal(true)}
                            disabled={loading}
                        >
                            {jornada ? 'Editar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmación de acción */}
            <DecisionModal
                variant="confirm"
                open={openModal}
                onOpenChange={() => setOpenModal(!openModal)}
                action={handleUpdateCreate}
                title={jornada ? '¿Estás seguro de actualizar esta jornada?' : '¿Estás seguro de crear esta jornada?'}
                content={
                    jornada
                        ? 'Esta acción actualizará la jornada en el sistema.'
                        : 'Esta acción creará una nueva jornada en el sistema.'
                }
                icon={<Icon name="TriangleAlert" className="text-custom-orange" />}
            />
        </>
    );
}