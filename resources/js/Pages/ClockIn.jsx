

import react, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/Components/ui/alert-dialog"
import PrimaryButton from '@/Components/OwnUi/PrimaryButton';

import Icon from '@/imports/LucideIcon';
import { useTranslation } from 'react-i18next';

export default function ClockIn() {
    const { t } = useTranslation('welcome');
    const { user } = usePage().props.auth;

    const [isClockingIn, setIsClockingIn] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [clockInData, setClockInData] = useState([
        /* ejemplo de entrada */
        { fecha: '2024-01-01', entrada: '09:00', salida: '18:00', notas: '', totalHoras: '09:00', horarioLaboral: '09:00 - 18:00' },
        { fecha: '2024-01-02', entrada: '09:18', salida: '18:00', notas: '', totalHoras: '09:00', horarioLaboral: '09:00 - 18:00' },
    ]);
    const entriesPerPage = 6;
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState({ index: null, value: '' });
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    // Horario laboral predefinido
    const standardWorkSchedule = {
        start: '09:00',
        end: '17:00'
    };

    useEffect(() => {
        let interval;
        if (isClockingIn) {
            interval = setInterval(() => {
                const now = new Date().getTime();
                const elapsed = Math.floor((now - startTime) / 1000);
                setTimeElapsed(elapsed);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isClockingIn, startTime]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Función para formatear fecha actual
    const formatCurrentDate = () => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    };

    // Función para formatear hora actual
    const formatCurrentTime = () => {
        const date = new Date();
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    // Función para verificar si hay retraso
    const isLate = (entryTime) => {
        const [scheduledHour, scheduledMinute] = standardWorkSchedule.start.split(':').map(Number);
        const [entryHour, entryMinute] = entryTime.split(':').map(Number);

        // Convertir a minutos para comparar
        const scheduledMinutes = scheduledHour * 60 + scheduledMinute;
        const entryMinutes = entryHour * 60 + entryMinute;

        // Diferencia en minutos
        return (entryMinutes - scheduledMinutes) > 10;
    };

    const handleClockIn = () => {
        if (!isClockingIn) {
            const currentDate = formatCurrentDate();
            const currentTime = formatCurrentTime();
            const late = isLate(currentTime);

            // Crear nueva entrada con horario laboral estándar
            const newEntry = {
                fecha: currentDate,
                entrada: currentTime,
                salida: '--:--',
                notas: '',
                totalHoras: '--:--',
                horarioLaboral: `${standardWorkSchedule.start} - ${standardWorkSchedule.end}`,
                isLate: late // Añadido el campo de retraso
            };

            setClockInData(prev => [newEntry, ...prev]);
            setStartTime(new Date().getTime());
            setIsClockingIn(true);
        }
    };

    // Activar el contador automáticamente al cargar la página
    useEffect(() => {
        handleClockIn();
    }, []); // Se ejecuta solo al montar el componente

    const handleClockOut = () => {
        setIsConfirmDialogOpen(true);
    };

    const confirmClockOut = () => {
        if (isClockingIn && clockInData.length > 0) {
            const currentTime = formatCurrentTime();
            const elapsedHours = Math.floor(timeElapsed / 3600);
            const elapsedMinutes = Math.floor((timeElapsed % 3600) / 60);
            const totalTime = `${String(elapsedHours).padStart(2, '0')}:${String(elapsedMinutes).padStart(2, '0')}`;

            setClockInData(prev => {
                const updated = [...prev];
                updated[0] = {
                    ...updated[0],
                    salida: currentTime,
                    totalHoras: totalTime,
                    horarioLaboral: `${standardWorkSchedule.start} - ${standardWorkSchedule.end}`
                };
                return updated;
            });

            setIsClockingIn(false);
            setTimeElapsed(0);
            setStartTime(null);

            router.visit('/login-tablet');
        }
    };

    // calcular horas restantes en base al contador de tiempo
    const hoursRemaining = () => {
        const workedHours = timeElapsed / 3600;
        const averageHoursPerDay = 8;
        const hoursRemaining = averageHoursPerDay - workedHours;
        const hours = Math.floor(hoursRemaining);
        const minutes = Math.floor((hoursRemaining - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Calcular el total de páginas
    const totalPages = Math.ceil(clockInData.length / entriesPerPage);

    // Obtener las entradas de la página actual
    const getCurrentEntries = () => {
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;
        return clockInData.slice(startIndex, endIndex);
    };

    // Funciones de navegación
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // Función para abrir el diálogo de notas
    const handleNoteClick = (index, currentNote) => {
        setSelectedNote({
            index: index,
            value: currentNote
        });
        setIsNoteDialogOpen(true);
    };

    // Función para guardar la nota
    const handleNoteSave = () => {
        setClockInData(prev => {
            const updated = [...prev];
            const realIndex = (currentPage - 1) * entriesPerPage + selectedNote.index;
            updated[realIndex] = {
                ...updated[realIndex],
                notas: selectedNote.value
            };
            return updated;
        });
        setIsNoteDialogOpen(false);
    };

    // Componente para avatar
    const UserAvatar = () => {
        if (user.profile_photo_url) {
            return (
                <img
                    src={user.profile_photo_url}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-custom-gray-light dark:border-custom-gray-darker"
                />
            );
        }

        return (
            <div className="w-16 h-16 rounded-full bg-custom-gray dark:bg-custom-blackLight 
                          flex items-center justify-center text-2xl font-bold border-2 
                          border-custom-gray-light dark:border-custom-gray-darker
                          text-custom-blackLight dark:text-custom-white">
                {user.name.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className='bg-custom-white dark:bg-custom-blackSemi min-h-screen'>
            <Head title="Clock In" />

            <div className='flex flex-col justify-center w-full p-4 lg:p-8 space-y-4 lg:space-y-8'>
                {/* Header con info de usuario */}
                <div className='flex flex-col lg:flex-row justify-between gap-4 lg:gap-8'>
                    {/* Información del usuario */}
                    <div className='w-full lg:w-1/2'>
                        <h2 className='text-xl lg:text-2xl font-bold mb-4 text-custom-blackLight dark:text-custom-white'>
                            {t('ClockIn.myClockIns')}
                        </h2>
                        <div className='flex items-center gap-4'>
                            <UserAvatar />
                            <div className='flex flex-col gap-1'>
                                <p className='text-sm lg:text-base font-medium text-custom-blackLight dark:text-custom-white'>
                                    {user.name}
                                </p>
                                <p className='text-xs lg:text-sm text-custom-gray-dark dark:text-custom-gray-light'>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contador y botones */}
                    <div className='w-full lg:w-1/2 flex flex-col lg:items-end gap-4'>
                        <div className='flex flex-col sm:flex-row gap-4'>
                            {isClockingIn && (
                                <div className='w-full sm:w-auto px-6 py-3 bg-custom-gray dark:bg-custom-blackSemi rounded-xl text-center'>
                                    <p className='text-lg lg:text-xl font-bold text-custom-orange'>
                                        {formatTime(timeElapsed)}
                                    </p>
                                </div>
                            )}
                            <PrimaryButton
                                onClick={handleClockOut}
                                className='w-full sm:w-auto bg-red-500 hover:bg-red-600 justify-center'
                            >
                                {t('ClockIn.clockOut')}
                                <Icon name='ChevronRight' className='w-4 h-4' />
                            </PrimaryButton>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {/* horas trabajadas */}
                    <div className='flex flex-col p-4 bg-custom-gray-default dark:bg-custom-blackLight rounded-lg'>
                        <p className='text-base lg:text-lg font-bold text-custom-orange'>{t('ClockIn.workedHours')}</p>
                        <p className='text-xl lg:text-2xl'>{formatTime(timeElapsed)}</p>
                    </div>
                    {/* jornada semanal */}
                    <div className='flex flex-col p-4 bg-custom-gray-default dark:bg-custom-blackLight rounded-lg'>
                        <p className='text-base lg:text-lg font-bold text-custom-orange'>{t('ClockIn.weeklyHours')}</p>
                        <p className='text-xl lg:text-2xl'>40:00</p>
                    </div>
                    {/* media de horas por dia */}
                    <div className='flex flex-col p-4 bg-custom-gray-default dark:bg-custom-blackLight rounded-lg'>
                        <p className='text-base lg:text-lg font-bold text-custom-orange'>{t('ClockIn.averageHoursPerDay')}</p>
                        <p className='text-xl lg:text-2xl'>8:00</p>
                    </div>
                    {/* horas restantes */}
                    <div className='flex flex-col p-4 bg-custom-gray-default dark:bg-custom-blackLight rounded-lg'>
                        <p className='text-base lg:text-lg font-bold text-custom-orange'>{t('ClockIn.hoursRemaining')}</p>
                        <p className='text-xl lg:text-2xl'>{hoursRemaining()}</p>
                    </div>
                </div>

                {/* Tabla */}
                <div className='w-full overflow-hidden rounded-lg bg-custom-white dark:bg-custom-blackSemi shadow'>
                    <div className='overflow-x-auto'>
                        <div className='min-w-[800px] p-4'>
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-custom-orange uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-custom-orange uppercase tracking-wider">
                                            Entrada
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-custom-orange uppercase tracking-wider">
                                            Salida
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-custom-orange uppercase tracking-wider">
                                            Notas
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-custom-orange uppercase tracking-wider">
                                            Total Horas
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-custom-orange uppercase tracking-wider">
                                            Horario Laboral
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {getCurrentEntries().map((entry, index) => (
                                        <tr key={index} className="hover:bg-custom-gray dark:hover:bg-custom-blackSemi">
                                            <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-xs lg:text-sm">
                                                {entry.fecha}
                                            </td>
                                            <td className={`px-4 lg:px-6 py-3 whitespace-nowrap text-xs lg:text-sm ${entry.isLate ? 'text-red-500 dark:text-red-400 font-medium' : ''}`}>
                                                {entry.entrada}
                                                {entry.isLate && (
                                                    <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 px-2 py-1 rounded-full">
                                                        Retraso
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-xs lg:text-sm">
                                                {entry.salida}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-xs lg:text-sm">
                                                <div
                                                    onClick={() => handleNoteClick(index, entry.notas)}
                                                    className="cursor-pointer flex items-center gap-2 hover:text-custom-orange"
                                                >
                                                    <Icon name='CircleAlert' className="w-4 h-4" />
                                                    {entry.notas ? 'Ver/Editar nota' : 'Añadir nota'}
                                                </div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-xs lg:text-sm">
                                                {entry.totalHoras}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-xs lg:text-sm">
                                                {entry.horarioLaboral}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Paginación */}
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                                <div className="text-xs lg:text-sm text-center sm:text-left">
                                    Mostrando {((currentPage - 1) * entriesPerPage) + 1} a {Math.min(currentPage * entriesPerPage, clockInData.length)} de {clockInData.length} entradas
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-lg transition-colors
                                            ${currentPage === 1
                                                ? 'text-custom-gray-dark dark:text-custom-gray-light cursor-not-allowed'
                                                : 'text-custom-orange hover:bg-custom-gray dark:hover:bg-custom-blackSemi'
                                            }`}
                                    >
                                        <Icon name='ChevronLeft' className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-custom-blackLight dark:text-custom-white">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-lg transition-colors
                                            ${currentPage === totalPages
                                                ? 'text-custom-gray-dark dark:text-custom-gray-light cursor-not-allowed'
                                                : 'text-custom-orange hover:bg-custom-gray dark:hover:bg-custom-blackSemi'
                                            }`}
                                    >
                                        <Icon name='ChevronRight' className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Dialog para las notas */}
                <AlertDialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                    <AlertDialogContent className="bg-custom-white dark:bg-custom-blackSemi w-[90vw] sm:w-full max-w-lg mx-auto">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-custom-blackLight dark:text-custom-white">
                                {selectedNote.value ? 'Editar nota' : 'Añadir nota'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                <textarea
                                    value={selectedNote.value}
                                    onChange={(e) => setSelectedNote({
                                        ...selectedNote,
                                        value: e.target.value
                                    })}
                                    className="w-full h-32 p-2 mt-2 bg-custom-gray dark:bg-custom-blackLight rounded-lg 
                                             text-custom-blackLight dark:text-custom-white resize-none
                                             border border-custom-gray-light dark:border-custom-gray-darker
                                             focus:outline-none focus:border-custom-orange"
                                    placeholder="Escribe tu nota aquí..."
                                />
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="bg-custom-gray-light hover:bg-custom-gray-semiLight text-custom-blackLight 
                                         dark:bg-custom-gray-darker dark:hover:bg-custom-gray-semiDark dark:text-custom-gray-light"
                            >
                                Cancelar
                            </AlertDialogCancel>
                            <PrimaryButton onClick={handleNoteSave}>
                                Guardar
                            </PrimaryButton>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Modal de confirmación de salida */}
                <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                    <AlertDialogContent className="bg-custom-white dark:bg-custom-blackSemi">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-custom-blackLight dark:text-custom-white">
                                Confirmar salida
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-custom-gray-dark dark:text-custom-gray-light">
                                ¿Estás seguro de que deseas registrar tu salida?
                                <div className="mt-2 p-4 bg-custom-gray dark:bg-custom-blackLight rounded-lg">
                                    <p className="text-custom-orange font-medium">
                                        Tiempo trabajado: {formatTime(timeElapsed)}
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="bg-custom-gray-light hover:bg-custom-gray-semiLight text-custom-blackLight 
                                         dark:bg-custom-gray-darker dark:hover:bg-custom-gray-semiDark dark:text-custom-gray-light"
                            >
                                Cancelar
                            </AlertDialogCancel>
                            <PrimaryButton
                                onClick={confirmClockOut}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Confirmar salida
                            </PrimaryButton>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
