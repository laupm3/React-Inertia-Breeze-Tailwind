import { useState, useEffect } from "react";
import Calendario from "@/Components/OwnUi/Calendario";
import Pill from "@/Components/App/Pills/Pill";
import STATUS_EVENTO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEventoMapColor";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TextInput from "@/Components/OwnUi/TextInput";
import { Head } from "@inertiajs/react";
import PrimaryButton from "@/Components/OwnUi/PrimaryButton";
/* import Pill from '@/Components/Pill' */
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useTranslation } from "react-i18next";
import Icon from "@/imports/LucideIcon";
import { Viewer, Editor } from "@/Components/App/Notifications/Yoopta";

const prevValue = {
    "652a1a68-b71c-4949-8af1-94c49f7c1e29": {
        id: "652a1a68-b71c-4949-8af1-94c49f7c1e29",
        type: "Paragraph",
        value: [
            {
                id: "439770d0-a2a9-4302-b892-8bef185171f6",
                type: "paragraph",
                children: [
                    {
                        text: "Empieza a crear...",
                    },
                ],
            },
        ],
        meta: {
            align: "left",
            depth: 0,
            order: 0,
        },
    },
};

function Index() {
    const { t } = useTranslation("events");

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedEventType, setSelectedEventType] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showPastEvents, setShowPastEvents] = useState(false);

    const [value, setValue] = useState(prevValue);

    const onChangeValue = (value) => {
        setValue(value);
    };

    const eventTypes = {
        orange: t("group"),
        gray: t("rrhh"),
        brown: t("department"),
        blue: t("enterprise"),
        purple: t("private"),
    };

    const usuariosPrueba = [
        { id: 1, nombre: "Juan Pérez" },
        { id: 2, nombre: "María García" },
        { id: 3, nombre: "Carlos López" },
        { id: 4, nombre: "Ana Martínez" },
        { id: 5, nombre: "Luis Rodríguez" },
    ];

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const handleDateDoubleClick = (date) => {
        setSelectedDate(date);
        setIsCreateModalOpen(true);
    };

    const handleCreateEvent = (e) => {
        e.preventDefault();
        if (!selectedEventType) {
            alert(t("pleaseSelectEventType"));
            return;
        }
        const newEvent = {
            id: Date.now(), // Añade un id único
            titulo: e.target.titulo.value,
            description: value, // Usa el valor del editor Yoopta
            fecha: selectedDate.toLocaleDateString(),
            hora: e.target.hora.value,
            color: selectedEventType,
            type: eventTypes[selectedEventType],
            participants: selectedUsers,
        };
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        setIsCreateModalOpen(false);
        setSelectedEventType(null);
        setSelectedUsers([]);
        setValue(prevValue); // Resetea el editor
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsViewModalOpen(true);
    };

    /* Evento ya generado */

    const generateEvents = (event) => {
        return (
            <div
                key={`${event.fecha}-${event.hora}`}
                className="bg-custom-gray-default dark:bg-custom-blackSemi mb-4 p-4 space-y-2 rounded-lg cursor-pointer"
                onClick={() => handleEventClick(event)}
            >
                <div className="flex flex-row items-center justify-between gap-4">
                    <div className="flex flex-row items-center gap-2">
                        <Pill
                            identifier={event.color}
                            children={event.color}
                            mapColor={STATUS_EVENTO_COLOR_MAP}
                            className="text-xs"
                        />
                        <h2 className="font-bold text-custom-blackLight dark:text-custom-white block opacity-30 hover:opacity-100 transition-opacity duration-300">
                            {event.titulo}
                        </h2>
                    </div>
                    <div>
                        <div className="flex flex-row items-center gap-2">
                            <Icon name="Calendar" size="12" />
                            <p className="text-xs">{event.fecha}</p>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <Icon name="Clock" size="12" />
                            <p className="text-xs">{event.hora}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const upcomingEvents = events
        .filter((event) => {
            const eventDate = new Date(
                event.fecha.split("/").reverse().join("-")
            );
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate >= today;
        })
        .sort((a, b) => {
            const dateA = new Date(a.fecha.split("/").reverse().join("-"));
            const dateB = new Date(b.fecha.split("/").reverse().join("-"));
            return dateA - dateB;
        });

    const pastEvents = events
        .filter((event) => {
            const eventDate = new Date(
                event.fecha.split("/").reverse().join("-")
            );
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate < today;
        })
        .sort((a, b) => {
            const dateA = new Date(a.fecha.split("/").reverse().join("-"));
            const dateB = new Date(b.fecha.split("/").reverse().join("-"));
            return dateB - dateA;
        });

    // Función para filtrar eventos (tanto pasados como futuros)
    const filterEvents = (eventsToFilter) => {
        return eventsToFilter.filter((event) => {
            // Filtrado por tipo de evento
            const typeFilterCondition =
                !selectedEventType || event.color === selectedEventType;
            // Filtrado por término de búsqueda en el título
            const searchFilterCondition = event.titulo
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            return typeFilterCondition && searchFilterCondition;
        });
    };

    // Aplica los filtros a los eventos futuros y pasados
    const filteredUpcomingEvents = filterEvents(upcomingEvents);
    const filteredPastEvents = filterEvents(pastEvents);

    useEffect(() => {
        setFilteredUsers(usuariosPrueba);
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = usuariosPrueba.filter((user) =>
            user.nombre.toLowerCase().includes(term)
        );
        setFilteredUsers(filtered);
    };

    const toggleEventType = (color) => {
        setSelectedEventType((prev) => (prev === color ? null : color));
    };

    const toggleUserSelection = (user) => {
        setSelectedUsers((prevSelected) => {
            if (prevSelected.some((u) => u.id === user.id)) {
                return prevSelected.filter((u) => u.id !== user.id);
            } else {
                return [...prevSelected, user];
            }
        });
    };

    return (
        <>
            <Head title="Events" />

            <div className="flex flex-col lg:flex-row justify-start w-full gap-4 lg:gap-16 p-4 lg:p-8">
                {/* Calendario */}
                <div className="w-full lg:w-2/5 p-2 py-8 mt-8 rounded-2xl h-fit bg-custom-gray-default dark:bg-custom-blackSemi">
                    <Calendario
                        onDateSelect={handleDateSelect}
                        onDateDoubleClick={handleDateDoubleClick}
                        events={events}
                    />
                </div>

                {/* Lista de eventos */}
                <div className="w-full lg:w-3/5 flex flex-col p-4 lg:p-8 items-start justify-start gap-4">
                    {/* Filtros de color */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center justify-start lg:justify-between w-full mb-4 gap-2">
                        {Object.entries(STATUS_EVENTO_COLOR_MAP).map(
                            ([color, type]) => (
                                <button
                                    key={color}
                                    type="button"
                                    className="transition ease-in-out hover:scale-105"
                                    onClick={() => toggleEventType(color)}
                                >
                                    <Pill
                                        identifier={color}
                                        children={color}
                                        mapColor={STATUS_EVENTO_COLOR_MAP}
                                        className={`text-xs border-2 ${selectedEventType === color
                                            ? "border-custom-orange"
                                            : ""
                                            }`}
                                    />
                                </button>
                            )
                        )}
                    </div>

                    {/* filtro de busqueda por titulo */}
                    <div className="w-full mb-4">
                        <TextInput
                            placeholder={`${t("searchByTitle")} ...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Lista de eventos */}
                    <div className="w-full h-[700px] overflow-auto dark:dark-scrollbar">
                        {/* Eventos futuros */}
                        <div className="w-full">
                            <div className="w-full">
                                {filteredUpcomingEvents.length > 0 ? (
                                    filteredUpcomingEvents.map((event) => (
                                        <div
                                            key={`${event.fecha}-${event.hora}-${event.titulo}`}
                                            className="mb-2"
                                        >
                                            {generateEvents(event)}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm lg:text-md text-center border-2 border-custom-gray-light dark:border-custom-gray-darker rounded-xl p-4 text-custom-gray-dark dark:text-custom-gray-light">
                                        {t("noUpcomingEvents")}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Eventos pasados */}
                        <button
                            onClick={() => setShowPastEvents(!showPastEvents)}
                            className="text-sm lg:text-md font-medium hover:text-custom-orange transition-colors w-full text-left"
                        >
                            {t("pastEvents")} ({filteredPastEvents.length})
                        </button>

                        {showPastEvents && (
                            <div className="w-full">
                                <div className="w-full">
                                    {filteredPastEvents.map((event) => (
                                        <div
                                            key={`${event.fecha}-${event.hora}-${event.titulo}-past`}
                                            className="bg-red-100/20 dark:bg-red-900/20 mb-2"
                                        >
                                            {generateEvents(event)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* modal que contiene el formulario para crear un evento */}

                <Dialog
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                >
                    <DialogContent className="bg-custom-white dark:bg-custom-blackSemi text-custom-blackLight dark:text-custom-white w-auto min-w-[90vw] md:min-w-[40vw]">
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl">
                                {t("newEvent")}
                                <br />
                                <span className="text-custom-orange">
                                    {selectedDate?.toLocaleDateString()}
                                </span>
                            </DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleCreateEvent}
                            className="overflow-y-auto"
                        >
                            {/* tipo de evento */}

                            <div className="flex flex-wrap items-start justify-start my-4 w-full gap-4 pl-1">
                                {Object.entries(STATUS_EVENTO_COLOR_MAP).map(
                                    ([color, type]) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="transition ease-in-out hover:scale-105"
                                            onClick={() =>
                                                setSelectedEventType(
                                                    selectedEventType === color
                                                        ? null
                                                        : color
                                                )
                                            }
                                        >
                                            <Pill
                                                identifier={color}
                                                children={color}
                                                mapColor={
                                                    STATUS_EVENTO_COLOR_MAP
                                                }
                                                className={`text-xs border-2 ${selectedEventType === color
                                                    ? "border-custom-orange"
                                                    : ""
                                                    }`}
                                            />
                                        </button>
                                    )
                                )}
                                {selectedEventType === null && (
                                    <p className="text-red-500">
                                        * Elige un tipo de evento
                                    </p>
                                )}
                            </div>

                            {/* formulario */}
                            <div className="grid gap-4 w-100 p-1">
                                <div className="flex flex-row items-center gap-2">
                                    <div className="flex-1">
                                        {/* titulo */}
                                        <Label
                                            htmlFor="titulo"
                                            className="text-right"
                                        ></Label>
                                        <TextInput
                                            id="titulo"
                                            name="titulo"
                                            className="w-full text-custom-blackLight dark:text-custom-white  rounded-full bg-gray-100 dark:bg-custom-blackLight text-md"
                                            placeholder={t("title")}
                                            required
                                        />
                                    </div>

                                    {/* hora */}
                                    <div className="flex-2">
                                        <Label
                                            htmlFor="hora"
                                            className="text-right"
                                        ></Label>
                                        <TextInput
                                            id="hora"
                                            name="hora"
                                            type="time"
                                            className="w-full rounded-full text-custom-blackLight bg-gray-100 dark:bg-custom-blackLight dark:text-custom-white dark:[color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* descripcion */}
                                <div className="flex flex-row overflow-x-auto">
                                    <Label
                                        htmlFor="description"
                                        className="text-left"
                                    ></Label>
                                    <Editor
                                        value={value}
                                        onChange={onChangeValue}
                                    />
                                </div>

                                {/* seleccion de usuarios */}
                                <div className="flex flex-col">
                                    <div className="flex flex-row items-center justify-between w-full">
                                        <p className="text-md text-left text-custom-orange w-1/3">
                                            <strong>{t("share")}</strong>
                                        </p>
                                        <div className="relative w-2/3">
                                            <Icon
                                                name="Search"
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
                                            />
                                            <Input
                                                type="text"
                                                placeholder={t("searchUsers")}
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className="bg-custom-gray-default border-none rounded-full dark:bg-custom-blackLight pl-10 w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full h-40 overflow-y-auto no-scrollbar rounded-3xl p-2">
                                        {filteredUsers.map((usuario) => (
                                            <div
                                                key={usuario.id}
                                                className={`flex flex-row items-center gap-3 mb-3 text-sm duration-300 cursor-pointer ${selectedUsers.some(
                                                    (u) =>
                                                        u.id === usuario.id
                                                )
                                                    ? "border-l-4 border-custom-orange bg-custom-gray dark:bg-custom-blackLight"
                                                    : "hover:bg-custom-gray dark:hover:bg-custom-blackLight"
                                                    }`}
                                                onClick={() =>
                                                    toggleUserSelection(usuario)
                                                }
                                            >
                                                <div
                                                    className="h-8 w-8 bg-custom-blue rounded-full"
                                                    key={usuario.id}
                                                >
                                                    {usuario.avatar ? (
                                                        <img
                                                            className="rounded-full"
                                                            src={usuario.avatar}
                                                            alt="Foto"
                                                        />
                                                    ) : (
                                                        <span className=" text-white flex items-center justify-center w-full h-full">
                                                            {usuario.nombre.charAt(
                                                                0
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                {usuario.nombre}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <PrimaryButton type="submit">
                                    {t("create")}
                                </PrimaryButton>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* modal que contiene la información del evento seleccionado */}

                <Dialog
                    open={isViewModalOpen}
                    onOpenChange={setIsViewModalOpen}
                >
                    <DialogContent className="bg-custom-white dark:bg-custom-blackSemi text-custom-blackLight dark:text-custom-white w-auto min-w-[80vw] lg:min-w-[50vw] pr-12 gap-2">
                        {selectedEvent && (
                            <>
                                <DialogHeader className="flex flex-row items-center justify-between">
                                    <Pill
                                        identifier={selectedEvent.color}
                                        children={selectedEvent.color}
                                        mapColor={STATUS_EVENTO_COLOR_MAP}
                                        className="text-xs"
                                    />
                                </DialogHeader>
                                <DialogTitle className="text-lg text-custom-blackLight dark:text-custom-white">
                                    {selectedEvent.titulo}
                                </DialogTitle>
                                <Viewer value={selectedEvent?.description} />
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

export default Index;

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
