import { AlertOctagon } from 'lucide-react';
import { useDialogData } from '../Context/DialogDataContext';

/**
 * Componente que muestra un mensaje de error en el diálogo.
 * 
 * Se renderiza condicionalmente cuando hay un error general en 
 * el formulario que no está asociado a un campo específico.
 * Por ejemplo, errores de red o respuestas de error del servidor.
 * 
 * @returns {JSX.Element|null} Mensaje de error o null si no hay error
 */
const DialogError = () => {
  const { error } = useDialogData();

  if (!error) return null;

  return (
    <div className="mt-4 mb-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded-md flex items-start gap-2 animate-in fade-in slide-in-from-top-3 duration-300">
      <AlertOctagon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold">Ha ocurrido un error</h4>
        <p className="text-sm">No se pudo procesar la solicitud. Por favor, inténtalo de nuevo.</p>
      </div>
    </div>
  );
};

export default DialogError;