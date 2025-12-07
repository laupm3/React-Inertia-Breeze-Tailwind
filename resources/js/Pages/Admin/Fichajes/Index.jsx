import { Head, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/OwnUi/PrimaryButton';
import FormPersonalData from '@/Components/FormPersonalData';
import FormContactData from '@/Components/FormContactData';
import FormEmployeeData from '@/Components/FormEmployeeData';
import { ChevronRight, ChevronLeft, AlertCircle, UserPlus, LogOut, Upload, Save } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/Components/ui/alert-dialog";

// Componente para mostrar la inicial si no hay imagen
const ProfileImage = ({ user }) => (
    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-custom-gray dark:bg-custom-blackLight 
                    flex items-center justify-center text-2xl font-bold 
                    text-custom-blackLight dark:text-custom-white">
        {user.name.charAt(0).toUpperCase()}
    </div>
);

// Mock data para el usuario admin
const adminUser = {
    id: 'ADMIN-001',
    name: 'Administrador del Sistema',
    webDeveloper: 'Supervisor de RRHH',
};

// Mock data más completa y realista
const initialUsersData = [
    { 
        id: 1,
        name: 'Juan Pérez',
        status: 'clocked',
        entry: '09:05',
        exit: '17:00',
        isLate: true,
        notes: 'Retraso por tráfico intenso en la autopista',
        totalHours: '07:55',
        workSchedule: '09:00 - 17:00',
        fecha: '2024-01-15'
    },
    { 
        id: 2,
        name: 'María García',
        status: 'notClocked',
        entry: '--:--',
        exit: '--:--',
        isLate: false,
        notes: 'Baja por enfermedad',
        totalHours: '--:--',
        workSchedule: '09:00 - 17:00',
        fecha: '2024-01-15'
    },
    {
        id: 3,
        name: 'Carlos Rodríguez',
        status: 'clocked',
        entry: '08:55',
        exit: '17:00',
        isLate: false,
        notes: '',
        totalHours: '08:05',
        workSchedule: '09:00 - 17:00',
        fecha: '2024-01-15'
    },
    {
        id: 4,
        name: 'Ana Martínez',
        status: 'clocked',
        entry: '09:15',
        exit: '17:00',
        isLate: true,
        notes: 'Retraso por cita médica programada',
        totalHours: '07:45',
        workSchedule: '09:00 - 17:00',
        fecha: '2024-01-15'
    },
    {
        id: 5,
        name: 'Luis Sánchez',
        status: 'notClocked',
        entry: '--:--',
        exit: '--:--',
        isLate: false,
        notes: 'Vacaciones programadas',
        totalHours: '--:--',
        workSchedule: '09:00 - 17:00',
        fecha: '2024-01-15'
    },
    {
        id: 6,
        name: 'Elena López',
        status: 'clocked',
        entry: '09:30',
        exit: '17:00',
        isLate: true,
        notes: 'Retraso por avería en el transporte público',
        totalHours: '07:30',
        workSchedule: '09:00 - 17:00',
        fecha: '2024-01-15'
    },
    {
        id: 7,
        name: 'David González',
        status: 'clocked',
        entry: '09:00',
        exit: '17:00',
        isLate: false,
        notes: '',
        totalHours: '08:00',
        workSchedule: '09:00 - 17:00',
        fecha: '2024-01-15'
    },
    {
        id: 8,
        name: 'Laura Fernández',
        status: 'clocked',
        entry: '08:50',
        exit: '17:00',
        isLate: false,
        notes: '',
        totalHours: '08:10',
        workSchedule: '09:00 - 17:00',
        fecha: '2024-01-15'
    },
    {
        id: 9,
        name: 'Pablo Ruiz',
        status: 'notClocked',
        entry: '--:--',
        exit: '--:--',
        isLate: false,
        notes: 'Permiso por asuntos personales',
        totalHours: '--:--',
        workSchedule: '09:00 - 17:00',
        fecha: '2024-01-15'
    },
    {
        id: 10,
        name: 'Sara Díaz',
        status: 'clocked',
        entry: '09:20',
        exit: '17:00',
        isLate: true,
        notes: 'Retraso por incidencia en el tren',
        totalHours: '07:40',
        workSchedule: '09:00 - 17:00',
        fecha: '2024-01-15'
    }
];

export default function ClockInAdmin() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 12;
    const [isViewNoteDialogOpen, setIsViewNoteDialogOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState('');
    const [isCreateUserPanelOpen, setIsCreateUserPanelOpen] = useState(false);
    const panelRef = useRef(null);
    const [usersData, setUsersData] = useState(initialUsersData);

    const stats = {
        clocked: usersData.filter(user => user.status === 'clocked').length,
        notClocked: usersData.filter(user => user.status === 'notClocked').length,
        anomalies: usersData.filter(user => user.isLate).length,
        total: usersData.length
    };

    const getFilteredUsers = () => {
        let filtered = [...usersData];
        switch(selectedFilter) {
            case 'clocked':
                filtered = usersData.filter(user => user.status === 'clocked');
                break;
            case 'notClocked':
                filtered = usersData.filter(user => user.status === 'notClocked');
                break;
            case 'anomalies':
                filtered = usersData.filter(user => user.isLate);
                break;
            default:
                filtered = usersData;
        }
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const handleViewNote = (note) => {
        setSelectedNote(note);
        setIsViewNoteDialogOpen(true);
    };

    const totalPages = Math.ceil(usersData.length / entriesPerPage);

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

    const handleLogout = () => {
        router.visit('/login-tablet');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsCreateUserPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [panelRef]);

    return (
        <div className='bg-custom-white dark:bg-custom-blackSemi min-h-screen relative'>
            <Head title="Clock In Admin" />
            <div className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isCreateUserPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
            <div className='flex flex-col justify-center w-full p-4 lg:p-8 space-y-4 lg:space-y-8'>
                <Header adminUser={adminUser} handleLogout={handleLogout} setIsCreateUserPanelOpen={setIsCreateUserPanelOpen} />
                <Filters selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} stats={stats} />
                <UserTable users={getFilteredUsers()} handleViewNote={handleViewNote} currentPage={currentPage} entriesPerPage={entriesPerPage} totalPages={totalPages} nextPage={nextPage} prevPage={prevPage} />
                <NoteDialog isOpen={isViewNoteDialogOpen} onOpenChange={setIsViewNoteDialogOpen} note={selectedNote} />
                <CreateUserPanel isOpen={isCreateUserPanelOpen} panelRef={panelRef} setIsCreateUserPanelOpen={setIsCreateUserPanelOpen} adminUser={adminUser} />
            </div>
        </div>
    );
}

const Header = ({ adminUser, handleLogout, setIsCreateUserPanelOpen }) => (
    <div className='flex flex-col lg:flex-row justify-between gap-4 lg:gap-8'>
        <div className='w-full lg:w-1/2'>
            <h2 className='text-xl lg:text-2xl font-bold mb-4 text-custom-black dark:text-custom-white'>
                Panel de Control
                <span className='text-custom-orange text-sm ml-2'>
                    (Administrador)
                </span>
            </h2>
            <div className='flex items-center gap-4'>
                <ProfileImage user={adminUser} />
                <div className='flex flex-col gap-1'>
                    <p className='text-sm lg:text-base font-medium text-custom-black dark:text-custom-white'>{adminUser.name}</p>
                    <p className='text-sm lg:text-base font-medium text-custom-black dark:text-custom-white'>{adminUser.webDeveloper}</p>
                    <p className='text-xs lg:text-sm text-custom-gray-dark dark:text-custom-gray-light'>
                        id: {adminUser.id}
                    </p>
                </div>
            </div>
        </div>
        <div className='w-full lg:w-1/2 flex justify-end items-start gap-2'>
            <PrimaryButton 
                className='w-full sm:w-auto justify-center bg-custom-gray-light hover:bg-custom-gray-semiLight text-custom-blackLight 
                          dark:bg-custom-gray-darker dark:hover:bg-custom-gray-semiDark dark:text-custom-gray-light'
                onClick={handleLogout}
            >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
            </PrimaryButton>
            <PrimaryButton 
                className='w-full sm:w-auto justify-center'
                onClick={() => setIsCreateUserPanelOpen(true)}
            >
                <UserPlus className="w-4 h-4 mr-2" />
                Crear usuario
            </PrimaryButton>
        </div>
    </div>
);

const Filters = ({ selectedFilter, setSelectedFilter, stats }) => (
    <div className='flex flex-wrap gap-2'>
        <FilterButton label="Todos" count={stats.total} isSelected={selectedFilter === 'all'} onClick={() => setSelectedFilter('all')} />
        <FilterButton label="Fichados" count={stats.clocked} isSelected={selectedFilter === 'clocked'} onClick={() => setSelectedFilter('clocked')} />
        <FilterButton label="Sin fichar" count={stats.notClocked} isSelected={selectedFilter === 'notClocked'} onClick={() => setSelectedFilter('notClocked')} />
        <FilterButton label="Anomalías" count={stats.anomalies} isSelected={selectedFilter === 'anomalies'} onClick={() => setSelectedFilter('anomalies')} />
    </div>
);

const FilterButton = ({ label, count, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full transition-colors text-custom-black dark:text-custom-white ${
            isSelected 
                ? 'bg-custom-orange text-white' 
                : 'bg-custom-gray dark:bg-custom-blackLight'
        }`}
    >
        {label} ({count})
    </button>
);

const UserTable = ({ users, handleViewNote, currentPage, entriesPerPage, totalPages, nextPage, prevPage }) => (
    <div className='w-full overflow-hidden rounded-lg bg-custom-white dark:bg-custom-blackSemi shadow'>
        <div className='overflow-x-auto'>
            <div className='min-w-[800px] p-4'>
                <table className="w-full">
                    <thead>
                        <tr>
                            <TableHeader label="Fecha" />
                            <TableHeader label="Entrada" />
                            <TableHeader label="Salida" />
                            <TableHeader label="Notas" />
                            <TableHeader label="Total Horas" />
                            <TableHeader label="Horario Laboral" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <TableCell>{user.fecha}</TableCell>
                                <TableCell className={user.isLate ? 'text-red-500 dark:text-red-400 font-medium' : ''}>
                                    {user.entry}
                                    {user.isLate && (
                                        <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 px-2 py-1 rounded-full">
                                            Retraso
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>{user.exit}</TableCell>
                                <TableCell>
                                    {user.notes ? (
                                        <div
                                            onClick={() => handleViewNote(user.notes)}
                                            className="cursor-pointer flex items-center gap-2 text-custom-gray-dark hover:text-custom-orange"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            Ver nota
                                        </div>
                                    ) : (
                                        <span className="text-custom-gray-dark">Sin notas</span>
                                    )}
                                </TableCell>
                                <TableCell>{user.totalHours}</TableCell>
                                <TableCell>{user.workSchedule}</TableCell>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination currentPage={currentPage} totalPages={totalPages} nextPage={nextPage} prevPage={prevPage} entriesPerPage={entriesPerPage} totalEntries={users.length} />
            </div>
        </div>
    </div>
);

const TableHeader = ({ label }) => (
    <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-custom-orange uppercase tracking-wider">
        {label}
    </th>
);

const TableCell = ({ children, className }) => (
    <td className={`px-4 lg:px-6 py-3 whitespace-nowrap text-custom-black dark:text-custom-white text-xs lg:text-sm ${className}`}>
        {children}
    </td>
);

const Pagination = ({ currentPage, totalPages, nextPage, prevPage, entriesPerPage, totalEntries }) => (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
        <div className="text-xs lg:text-sm text-center sm:text-left text-custom-black dark:text-custom-white">
            Mostrando {((currentPage - 1) * entriesPerPage) + 1} a {Math.min(currentPage * entriesPerPage, totalEntries)} de {totalEntries} entradas
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
                <ChevronLeft className="w-5 h-5" />
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
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    </div>
);

const NoteDialog = ({ isOpen, onOpenChange, note }) => (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent className="bg-custom-white dark:bg-custom-blackSemi">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-custom-blackLight dark:text-custom-white">
                    Nota del usuario
                </AlertDialogTitle>
                <AlertDialogDescription>
                    <div className="mt-2 p-4 bg-custom-gray dark:bg-custom-blackLight rounded-lg text-custom-blackLight dark:text-custom-white">
                        {note || 'Sin notas'}
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel 
                    className="bg-custom-gray-light hover:bg-custom-gray-semiLight text-custom-blackLight 
                             dark:bg-custom-gray-darker dark:hover:bg-custom-gray-semiDark dark:text-custom-gray-light"
                >
                    Cerrar
                </AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

const CreateUserPanel = ({ isOpen, panelRef, setIsCreateUserPanelOpen, adminUser }) => (
    <div 
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full lg:w-[65%]  lg:rounded-l-3xl bg-custom-white dark:bg-custom-blackSemi shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar p-8 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
    >
        <div>
            <div className="flex flex-row items-center gap-2 text-2xl font-bold text-custom-blue dark:text-custom-white">
                <ChevronRight
                    id='closeLateral'
                    className="w-6 h-6 rounded-full bg-custom-gray-darker duration-300 text-custom-white hover:text-custom-orange"
                    onClick={() => setIsCreateUserPanelOpen(false)}
                />
                Creación del Empleado
            </div>
            <div className="flex flex-row items-center gap-4 my-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-custom-gray flex items-center justify-center">
                    <ProfileImage user={adminUser} />
                </div>
                <div className="space-y-2">
                    <PrimaryButton className='w-fit'>
                        <p className="flex flex-row items-center gap-2 text-custom-white"><Upload className="w-4" />Subir Imagen</p>
                    </PrimaryButton>
                    <p className='text-xs text-custom-gray-dark dark:text-custom-gray-light'>Por favor, sube un archivo .jpg con una mínima dimensión de 400w x 400h sin exceder los 5MB.</p>
                </div>
            </div>
            <hr className='border-custom-gray dark:border-custom-gray-darker mb-8' />
            <form action="">
                <FormPersonalData />
                <hr className='border-custom-gray dark:border-custom-gray-darker mb-8' />
                <FormContactData />
                <hr className='border-custom-gray dark:border-custom-gray-darker mb-8' />
                <FormEmployeeData />
                <div className="w-full flex justify-end">
                    <PrimaryButton type="submit" className='w-fit mt-8'>
                        <p className="flex flex-row items-center gap-2 text-custom-white"><Save className="w-4" />Guardar</p>
                    </PrimaryButton>
                </div>
            </form>
        </div>
    </div>
);