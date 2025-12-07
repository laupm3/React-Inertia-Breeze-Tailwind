import { DialogHeader as DialogHeaderBase, DialogTitle, DialogDescription } from '@/Components/ui/dialog';

/**
 * Componente que renderiza la cabecera del diálogo.
 * 
 * Muestra el título del diálogo.
 * 
 * @returns {JSX.Element} Cabecera del diálogo con título
 */
function DialogHeader() {
    return (
        <DialogHeaderBase>
            <DialogTitle className="dark:text-custom-white text-lg font-bold">
                Información de contrato
            </DialogTitle>
            <DialogDescription className="sr-only">
                Gestiona la información de contratos y sus anexos correspondientes
            </DialogDescription>
        </DialogHeaderBase>
    );
}
export default DialogHeader;
