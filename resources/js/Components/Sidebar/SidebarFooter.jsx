import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/Components/ui/sidebar";
import Icon from "@/imports/LucideIcon";
import i18n from "@/i18n";
import languages from "@/Shared/Languages";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState, startTransition } from "react";
import { useSidebar } from "@/Components/ui/sidebar";
import PopUpIncidencias from "@/Components/App/PopUps/PopUpIncidencias";
import UserAvatar from "../App/User/UserAvatar";

export default function SidebarFooterComponent() {
    const { isMobile } = useSidebar(); // Detecta si el dispositivo es móvil
    const user = usePage().props.auth.user; // Usuario actual
    const jetstream = usePage().props.jetstream; // Configuración de Jetstream

    // Cambiar tema
    const [theme, setTheme] = useState("system"); // 'system' como valor predeterminado
    const [isPopUpOpen, setIsPopUpOpen] = useState(false); // Estado para controlar el popup

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme && savedTheme !== "system") {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        } else {
            // Si no hay tema guardado, verifica el tema del sistema
            const systemTheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "default";
            setTheme(systemTheme);
            applyTheme(systemTheme);
        }

        // Observa los cambios en la preferencia del tema del sistema
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            if (theme === "system") {
                const newSystemTheme = e.matches ? "dark" : "default";
                setTheme(newSystemTheme);
                applyTheme(newSystemTheme);
            }
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    // Función para aplicar el tema
    const applyTheme = (theme) => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    // Función para manejar el cambio de tema
    const handleThemeChange = (newTheme) => {
        if (newTheme === "system") {
            localStorage.removeItem("theme");
        } else {
            localStorage.setItem("theme", newTheme);
        }

        setTheme(newTheme);
        applyTheme(newTheme);
    };

    // Función para cambiar el idioma
    const handleLanguageChange = (locale) => {
        i18n.changeLanguage(locale); // Cambia el idioma globalmente
    };

    const togglePopup = () => {
        startTransition(() => {
            setIsPopUpOpen((prev) => !prev); // Alternar el estado del popup
        });
    };

    const handleHelpClick = () => {
        togglePopup(); // Llamar a la nueva función para alternar el popup
    };

    return (
        <SidebarFooter
            className={`bg-custom-gray-default dark:bg-custom-blackSemi shadow-2xl ${isMobile ? "rounded-bl-2xl" : "rounded-br-2xl"
                }`}
        >
            <SidebarMenu>
                {/* Button Help */}
                <SidebarMenuButton
                    asChild
                    className="rounded-xl"
                    onClick={handleHelpClick}
                >
                    <div className="font-medium">
                        <Icon
                            name="CircleHelp"
                            className="text-custom-orange"
                        />
                        Ayuda
                    </div>
                </SidebarMenuButton>

                {/* Popup para Incidencias */}
                {isPopUpOpen && (
                    <div>
                        <PopUpIncidencias
                            className="absolute bottom-20 left-20"
                            onClose={() => setIsPopUpOpen(false)}
                            formData={{}}
                        />
                    </div>
                )}

                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="flex rounded-xl font-extrabold">
                                <UserAvatar user={user} className="-ml-2" />
                                {isMobile ? (
                                    <Icon
                                        name="ChevronUp"
                                        className="ml-auto text-custom-orange"
                                    />
                                ) : (
                                    <Icon
                                        name="ChevronRight"
                                        className="ml-auto text-custom-orange"
                                    />
                                )}
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        {/* Dropdown Menu Content */}
                        <DropdownMenuContent
                            side={isMobile ? "" : "left"}
                            className={`${isMobile ? "mb-12" : "ml-4"
                                } w-[--radix-popper-anchor-width] rounded-xl bg-custom-gray-default dark:bg-custom-blackLight`}
                        >
                            {/* Profile Information */}
                            <DropdownMenuItem asChild className={`rounded-xl`}>
                                <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                                    <Avatar className="h-8 w-8 rounded-full">
                                        {jetstream.managesProfilePhotos ? (
                                            <AvatarImage
                                                src={user.profile_photo_url}
                                                alt={user.name}
                                            />
                                        ) : (
                                            <AvatarFallback className="rounded-lg">
                                                {user.name}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div
                                        className={`rounded-xl grid flex-1 text-left text-sm leading-tight`}
                                    >
                                        <span className="truncate font-semibold">
                                            {user.name}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuItem>

                            {/* Account Link */}
                            <DropdownMenuItem
                                asChild
                                className={`rounded-xl ${isMobile ? "gap-2" : ""
                                    }`}
                            >
                                <Link href={route("profile.show")}>
                                    <Icon
                                        name="User"
                                        className="text-custom-orange"
                                    />
                                    Perfil
                                </Link>
                            </DropdownMenuItem>

                            {/* Api Tokens */}
                            {jetstream.hasApiFeatures && (
                                <DropdownMenuItem
                                    asChild
                                    className={`rounded-xl ${isMobile ? "gap-2" : ""
                                        }`}
                                >
                                    <Link href={route("api-tokens.index")}>
                                        <Icon
                                            name="Settings"
                                            className="text-custom-orange"
                                        />
                                        <span>Tokens API</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}

                            {/* Change Language */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger
                                    className={`rounded-xl ${isMobile ? "gap-2" : ""
                                        }`}
                                >
                                    <Icon
                                        name="Languages"
                                        className="text-custom-orange w-4 mr-2"
                                    />{" "}
                                    Idioma
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent
                                        className={`bg-custom-gray-default dark:bg-custom-blackLight ${isMobile ? "mr-5" : "ml-3"
                                            }`}
                                    >
                                        {languages.map((language) => (
                                            <DropdownMenuItem
                                                className="rounded-xl"
                                                key={language.id}
                                                onClick={() =>
                                                    handleLanguageChange(
                                                        language.locale
                                                    )
                                                } // Cambia el idioma al hacer clic
                                            >
                                                <span>
                                                    {language.name} (
                                                    {language.region})
                                                </span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>

                            {/* Change Theme */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="rounded-xl">
                                    <Icon
                                        name="Moon"
                                        className="text-custom-orange w-4 h-4 mr-2"
                                    />{" "}
                                    <span>Tema</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent
                                        className={`bg-custom-gray-default dark:bg-custom-blackLight ${isMobile ? "mr-5" : "ml-3"
                                            }`}
                                    >
                                        <DropdownMenuItem
                                            className="rounded-xl"
                                            onClick={() =>
                                                handleThemeChange("system")
                                            }
                                        >
                                            <span>Tema del Sistema</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="rounded-xl"
                                            onClick={() =>
                                                handleThemeChange("default")
                                            }
                                        >
                                            <span>Tema Claro</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="rounded-xl"
                                            onClick={() =>
                                                handleThemeChange("dark")
                                            }
                                        >
                                            <span>Modo Oscuro</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>

                            {/* Logout */}
                            <DropdownMenuItem
                                asChild
                                className={`rounded-xl w-full ${isMobile ? "gap-2" : ""
                                    }`}
                            >
                                <Link href={route("logout")} method="post" as="button">
                                    <Icon
                                        name="LogOut"
                                        className="text-custom-orange"
                                    />
                                    Cerrar Sesión
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    );
}
