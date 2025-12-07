import { DialogDescription, DialogHeader as DialogHeaderBase, DialogTitle } from '@/Components/ui/dialog'
import { useDialogData } from '../Context/DialogDataContext'
import { useMemo } from 'react';

/**
 * Componente que renderiza la cabecera del diálogo.
 * 
 * Muestra el título del diálogo (Crear/Actualizar registro) y
 * proporciona contexto visual al usuario sobre la operación
 * que está realizando.
 * 
 * @returns {JSX.Element} Cabecera del diálogo con título
 */
function DialogHeader() {
    const { modelAlias, model } = useDialogData()

    const title = useMemo(() =>
        model ? `Actualizar ${modelAlias}` : `Crear ${modelAlias}`,
        [model]);

    return (
        <DialogHeaderBase>
            <DialogTitle className="dark:text-custom-white">
                {title}
            </DialogTitle>
            <DialogDescription className="hidden">
                {title}
            </DialogDescription>
        </DialogHeaderBase>
    )
}

export default DialogHeader