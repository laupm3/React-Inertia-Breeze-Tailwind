import {
    forwardRef,
    useState,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";

import { createPortal } from "react-dom";

import { Cross2Icon } from "@radix-ui/react-icons";

// Componente de diálogo personalizado que puede ser controlado desde fuera
// Acepta props: open, onOpenChange, y children, junto con cualquier otra prop
// Se implementa como un portal para renderizar fuera del flujo del DOM
const CustomDialog = forwardRef(
    ({ open, onOpenChange, children, eventDate, ...props }, ref) => {
        // Estado para controlar si el componente está montado
        const [isMounted, setIsMounted] = useState(false);
        // Referencia al elemento de diálogo para poder enfocarlo
        const dialogRef = useRef(null);

        // Expone métodos (como focus) al componente padre a través de ref
        useImperativeHandle(ref, () => ({
            focus: () => dialogRef.current?.focus(),
        }));

        // Efecto para establecer el estado montado cuando el componente inicia
        useEffect(() => {
            setIsMounted(true);
            return () => setIsMounted(false);
        }, []);

        // Efecto para bloquear el scroll del body cuando el diálogo está abierto
        useEffect(() => {
            if (open) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "unset";
            }

            return () => (document.body.style.overflow = "unset");
        }, [open]);

        // No renderizar nada si el componente no está montado
        if (!isMounted) return null;

        // Crea un portal para renderizar el diálogo fuera del flujo normal del DOM
        return createPortal(
            open ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80"
                >
                    <div
                        ref={dialogRef}
                        className="bg-custom-white dark:bg-custom-blackLight rounded-lg shadow-lg w-6/12 h-screen min-w-[90vw] md:min-w-[40vw] max-h-[90vh]"
                        style={{ zIndex: 50 }}
                        {...props}
                    >
                        {/* Cabecera del diálogo con título y botón de cierre */}
                        <div className="flex items-center justify-between p-4 border-b border-custom-gray-default dark:border-custom-blackSemi">
                            <h2 className="text-lg font-semibold text-custom-blue dark:text-custom-white">
                                {props.title || "Nuevo Evento"}
                            </h2>

                            <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-custom-orange">
                                    {eventDate || new Date().toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="rounded-full p-1 hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi"
                                >
                                    <Cross2Icon className="h-5 w-5 text-custom-blackLight dark:text-custom-white" />
                                </button>
                            </div>
                        </div>

                        {/* Contenido principal del diálogo */}
                        <DialogContent>{children}</DialogContent>
                    </div>
                </div>
            ) : null,
            document.body
        );
    }
);
CustomDialog.displayName = "CustomDialog";

// Componente para el título del diálogo con estilos predefinidos
const DialogTitle = ({ children }) => (
    <div className="text-lg font-semibold text-custom-blue dark:text-custom-white">
        {children}
    </div>
);

// Componente para el contenido del diálogo con padding y clases personalizables
const DialogContent = ({ children, className = "" }) => (
    <div className={`p-4 pt-0 ${className}`}>{children}</div>
);

// Componente para el pie del diálogo, generalmente contiene botones de acción
const DialogFooter = ({ children, className = "" }) => (
    <div
        className={`flex justify-end p-2 border-t border-custom-gray-default dark:border-custom-blackSemi ${className}`}
    >
        {children}
    </div>
);

export { CustomDialog, DialogTitle, DialogContent, DialogFooter };
