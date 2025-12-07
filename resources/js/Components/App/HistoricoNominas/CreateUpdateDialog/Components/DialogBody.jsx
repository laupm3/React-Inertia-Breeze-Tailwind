import { useDialogData } from "../Context/DialogDataContext"
import DialogError from "./DialogError"

/**
 * Componente que renderiza el cuerpo del diálogo.
 * 
 * Contiene el formulario de creación/edición y gestiona la opacidad
 * del contenido durante los estados de carga para proporcionar
 * retroalimentación visual al usuario.
 * 
 * @returns {JSX.Element} Cuerpo del diálogo con el formulario
 */
function DialogBody({ children }) {
    const { isSaving } = useDialogData()
    return (
        <div
            className={`flex flex-col gap-4 h-full overflow-y-auto p-4 dark:dark-scrollbar transition-opacity duration-200 ${(isSaving) ? 'opacity-60' : 'opacity-100'}`}>
            <DialogError />
            {children}
        </div>
    )
}

export default DialogBody