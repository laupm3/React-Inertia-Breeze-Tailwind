import { Dialog, DialogContent } from "@/Components/ui/dialog";
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
export default function DialogPortal({
  open,
  onOpenChange,
  onSubmit,
  title
}) {
  const { isLoading } = useDialogData();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-4 justify-between sm:max-w-[1225px] sm:h-[725px] bg-custom-white dark:bg-custom-blackLight">
        {isLoading ? (
          <DialogSkeleton />
        ) : (
          <>
            <DialogHeader title={title} onOpenChange={onOpenChange} />
            <DialogBody>
                <FormFields />
            </DialogBody>
            <DialogFooter onSubmit={onSubmit} onOpenChange={onOpenChange} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}