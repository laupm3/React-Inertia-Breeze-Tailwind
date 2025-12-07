import { DialogDescription, DialogHeader as DialogHeaderBase, DialogTitle } from '@/Components/ui/dialog'
import EmpleadoAvatar from "../../EmpleadoAvatar";
import { useDataHandler } from "../Context/DataHandlerContext";

function DialogHeader() {

  const { data, error, isLoading } = useDataHandler();
  return (
    <DialogHeaderBase>
      <DialogTitle className="text-custom-blue dark:text-custom-white text-[2rem] font-bold mb-4">
        Historial de contratos
      </DialogTitle>
      <DialogDescription className="sr-only">
        Historial de contratos vigentes del empleado
      </DialogDescription>

      {!error && !isLoading && <EmpleadoAvatar empleado={data} className="w-full max-w-full text-lg font-semibold text-custom-blackLight dark:text-custom-white" />}
    </DialogHeaderBase>
  )
}

export default DialogHeader