import DialogSkeleton from "./DialogSkeleton";
import DialogHeader from "./DialogHeader";
import { DialogContent } from "@/Components/ui/dialog";
import { useDataHandler } from "../Context/DataHandlerContext";
import DialogBody from "./DialogBody";
import DialogError from "./DialogError";

/**
 * Componente que estructura el contenido del diálogo.
 * 
 * Organiza los distintos componentes que forman el diálogo (cabecera, cuerpo y pie)
 * y gestiona el estado de carga mediante un overlay.
 *
 * @component
 * @returns {JSX.Element} Estructura del contenido del diálogo
 */
export default function DialogPortal() {
    const {
        isLoading,
        error
    } = useDataHandler();

    return (
        <DialogContent className="flex flex-col gap-4 justify-between max-w-[1225px] h-[725px] bg-custom-white dark:bg-custom-blackLight">
            {isLoading ? (
                <DialogSkeleton />
            ) : (
                <div className="flex flex-col gap-4 flex-1 overflow-y-auto p-4 dark:dark-scrollbar transition-opacity duration-200">
                    {!error ? (<DialogBody />) : (<DialogError />)}
                </div>
            )}
        </DialogContent>
    )
}