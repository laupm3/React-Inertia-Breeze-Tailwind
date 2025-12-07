import { useView } from "../Context/ViewContext";
import {
    Dialog as DialogBase,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription
} from "@/Components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useState } from "react";
/**
 * Dialog component - Allow to create a new entity or update an existing one
 * 
 * @param {Object} props The props of the component
 * @param {Object} props.entityId The id of the selected entity
 * @param {Object} props.open The state of the dialog
 * @param {Function} props.onOpenChange The function to change the state of the dialog
 * 
 * @returns {JSX.Element}
 */
export default function CreateUpdateDialog() {

    const {
        isDialogOpen,
        setIsDialogOpen
    } = useView();

    const { data, setData } = useForm({ clicks: 0 });

    const [isOpenDialog, setIsOpenDialog] = useState(false); // Estado para controlar la apertura del diálogo

    return (
        <>
            <DialogBase
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            >
                <DialogTitle className="text-center hidden">Horarios Administración</DialogTitle>
                <DialogDescription className="hidden"> Descrición random </DialogDescription>
                <DialogContent className="sm:max-w-[1225px] sm:h-[620px] bg-custom-white dark:bg-custom-blackLight">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">Contador de clics</h1>
                        <p className="text-lg">Número de clics: {data.clicks}</p>
                        <button
                            onClick={() => setData((prev) => ({ ...prev, clicks: prev.clicks + 1 }))}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Incrementar contador
                        </button>
                    </div>
                </DialogContent>
            </DialogBase>
        </>
    );
}
