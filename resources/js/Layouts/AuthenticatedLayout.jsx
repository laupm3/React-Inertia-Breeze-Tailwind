import { SidebarProvider } from "@/Components/ui/sidebar";
import Sidebar from "@/Components/Sidebar/Sidebar";
import Navbar from "@/Components/Navbar";
import { Toaster } from "@/Components/ui/sonner";
import ShowNotificationFromJetstream from "@/Components/App/JetStream/ShowNotificactionFromJestream";
import NotificationEvent from "@/Components/App/JetStream/NotificationEvent";

import { ClockProvider } from "@/hooks/ClockContext";

import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

import OnboardingModal from "@/Pages/Shared/Onboarding/OnboardingModal";

export default function AuthenticatedLayout({ children, title }) {
    const { empleados = [] } = usePage().props;
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const currentPath = window.location.pathname;
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        const onboardingVisited = localStorage.getItem('onboardingVisited');

        // Mostrar el modal solo si nunca ha visitado el onboarding y está en dashboard
        if (!onboardingVisited && !onboardingCompleted && currentPath === '/dashboard') {
            setShowOnboarding(true);
        }
    }, []);

    // Evitar scroll en el fondo cuando el modal está abierto
    useEffect(() => {
        if (showOnboarding) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showOnboarding]);

    // Inicializar estado del sidebar desde localStorage
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebar-open');
            return savedState !== null ? JSON.parse(savedState) : true; // Por defecto abierto
        }
        return true; // Fallback para SSR
    });

    // Guardar estado del sidebar en localStorage cuando cambie
    const handleSidebarChange = (open) => {
        setSidebarOpen(open);
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar-open', JSON.stringify(open));
        }
    };

    // Escuchar cambios en localStorage desde otras pestañas
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'sidebar-open' && e.newValue !== null) {
                setSidebarOpen(JSON.parse(e.newValue));
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);

        }
    }, []);

    // Unirse al canal de presencia para ser contado como "conectado" globalmente.
    useEffect(() => {
        // Con solo unirnos, el servidor Reverb ya notificará al panel de admin que hemos entrado.
        window.Echo.join('presence-app');

        // Al desmontar el componente (cerrar sesión o cerrar pestaña), abandonamos el canal.
        return () => {
            window.Echo.leave('presence-app');
        };
    }, []); // El array vacío asegura que esto se ejecuta solo una vez.

    return (
        <>
            <Head title={title} />
            <SidebarProvider
                open={sidebarOpen}
                onOpenChange={handleSidebarChange}
            >
                <Sidebar />
                <main className="h-screen bg-custom-white dark:bg-custom-gray-sidebar w-full flex flex-col dark:dark-scrollbar max-w-full overflow-hidden">
                    <ClockProvider>
                        <div className="bg-custom-gray-default dark:bg-custom-gray-sidebar h-16">
                            <Navbar />
                        </div>
                        <section className="flex-1 overflow-auto">
                            {children}
                        </section>
                    </ClockProvider>

                </main>
                <ShowNotificationFromJetstream />
                <NotificationEvent />
                <Toaster
                    richColors
                    expand={true}
                    theme={() =>
                        document.documentElement.classList.contains(
                            "dark"
                        )
                            ? "dark"
                            : "light"
                    }
                />
                {/* Modal Onboarding */}
                <OnboardingModal
                    show={showOnboarding}
                    onClose={() => setShowOnboarding(false)}
                    empleados={empleados}
                />
            </SidebarProvider>
        </>
    );
}
