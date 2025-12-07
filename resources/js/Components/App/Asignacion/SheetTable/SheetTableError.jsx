import { AlertOctagon } from "lucide-react";

export default function SheetTableError() {

    return (
        <div className="mt-4 mb-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded-md flex items-start gap-2 animate-in fade-in slide-in-from-top-3 duration-300" >
            <AlertOctagon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
                <h4 className="font-semibold">Ha ocurrido un error</h4>
                <p className="text-sm">No se pudo completar la petición. Por favor, intentelo más tarde.</p>
            </div>
        </div >
    )
}