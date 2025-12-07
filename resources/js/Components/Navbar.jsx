import ApplicationLogo from "./ApplicationLogo";
import NotificationDropdown from '@/Components/App/Notifications/NotificationDropdown';
import ClockInButton from '@/Components/blocks/ClockInButton';
import { Link } from "@inertiajs/react";
import { CustomTriggerMovile } from "@/Components/OwnUi/CustomTriggerMovile";
import { useClock } from '@/hooks/ClockContext';
import { useNotifications } from '@/hooks/useNotifications';

/**
 * @component Navbar
 * @description Barra de navegación principal de la aplicación.
 * Incluye el logo, botón de entrada/salida y dropdown de notificaciones.
 * 
 * @returns {JSX.Element} Componente de barra de navegación
 */
export default function Navbar() {
    const {
        isClockingIn,
        entry,
        exit,
    } = useClock();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    return (
        <nav className="border-b border-custom-gray-default bg-white dark:border-gray-700 dark:bg-custom-blackLight">
            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-end relative">
                    {/* Logo */}
                    <div className="hidden md:flex ml-12 xl:ml-0 flex-1 justify-start xl:justify-center items-center">
                        <div className="flex items-center max-w-64 justify-center z-30">
                            <Link href={route('dashboard')}>
                                <ApplicationLogo />
                            </Link>
                        </div>
                    </div>

                    {/* Boton de Notificacion y Boton de Entrada */}
                    <div className="absolute justify-between md:justify-end items-center sm:right-0 top-1/2 transform -translate-y-1/2 z-20 flex gap-4 w-full">
                        <Link href={route('dashboard')} className="md:hidden max-w-64">
                            <ApplicationLogo short={isClockingIn} />
                        </Link>

                        <div className="flex items-center gap-4">
                            <ClockInButton />

                            <NotificationDropdown
                                notifications={notifications}
                                unreadCount={unreadCount}
                                markAsRead={markAsRead}
                                markAllAsRead={markAllAsRead}
                            />
                            <CustomTriggerMovile />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
