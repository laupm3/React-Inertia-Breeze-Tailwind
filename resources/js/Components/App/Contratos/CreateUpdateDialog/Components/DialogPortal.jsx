import { DialogContent } from "@/Components/ui/dialog";
import { useDialogData } from "../Context/DialogDataContext";
import React from 'react';
const FormFields = React.lazy(() => import("../Partials/FormFields"));
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
    isSaving,
  } = useDialogData();

  return (
    <DialogContent 
    className="flex flex-col gap-4 justify-between max-w-[1225px] max-h-[725px] bg-custom-white dark:bg-custom-blackLight"
    onInteractOutside={(e) => {
      if (isSaving) {
        e.preventDefault();
      }
    }}
    >
      {isLoading ? (
        <DialogSkeleton />
      ) : (
        <>
          <DialogHeader />
          <DialogBody>
            <React.Suspense fallback={<DialogSkeleton />}>
                <FormFields />
            </React.Suspense>
          </DialogBody>
          <DialogFooter />
        </>
      )}
    </DialogContent>
  )
}