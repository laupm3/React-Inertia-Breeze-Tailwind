import { DialogContent } from "@/Components/ui/dialog";
import { useDialogData } from "../Context/DialogDataContext";
import FormFields from "../Partials/FormFields";
import DialogSkeleton from "./DialogSkeleton";
import DialogFooter from "./DialogFooter";
import DialogHeader from "./DialogHeader";
import DialogBody from "./DialogBody";

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
  } = useDialogData();

  return (
    <DialogContent className="flex flex-col gap-4 justify-between max-w-[1225px] max-h-[85vh] bg-custom-white dark:bg-custom-blackLight overflow-y-auto overflow-x-auto">
      <DialogHeader />
      {isLoading ? (
        <DialogSkeleton />
      ) : (
        <>
          <DialogBody>
            <FormFields />
          </DialogBody>
          <DialogFooter />
        </>
      )}
    </DialogContent>
  )
}