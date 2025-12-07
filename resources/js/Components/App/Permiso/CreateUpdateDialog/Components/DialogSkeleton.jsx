import { Skeleton } from "@/Components/ui/skeleton";

/**
 * Componente que muestra un esqueleto de carga para el formulario.
 * 
 * Se utiliza mientras se cargan los datos del centro desde la API
 * para ofrecer una experiencia de usuario más fluida y evitar
 * cambios bruscos en la interfaz.
 * 
 * @returns {JSX.Element} Esqueleto de carga que simula la estructura del formulario
 */
function DialogSkeleton() {

  return (
    <>
      <div className="flex flex-col w-full gap-12 bg-custom-white dark:bg-custom-blackLight p-4">
        <div className="flex flex-col gap-4 dark:dark-scrollbar">
          <Skeleton className="h-8 w-[350px]" />
        </div>

        <div className="flex flex-row w-full gap-4 overflow-y-auto dark:dark-scrollbar">
          <div className="flex flex-col w-1/2 gap-4 dark:dark-scrollbar">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex flex-col w-1/2 gap-4 dark:dark-scrollbar">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        <Skeleton className="h-1 w-full" />

        <div className="flex flex-row w-full gap-4 overflow-y-auto dark:dark-scrollbar">
          <div className="flex flex-col w-1/2 gap-4 dark:dark-scrollbar">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="flex flex-col w-1/2 gap-4 dark:dark-scrollbar">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 p-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </>
  )
}

export default DialogSkeleton