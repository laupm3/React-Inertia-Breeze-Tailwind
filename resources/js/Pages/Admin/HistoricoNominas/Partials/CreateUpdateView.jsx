import { DialogDataContextProvider } from "@/Components/App/HistoricoNominas/CreateUpdateDialog/Context/DialogDataContext";
import { useDataHandler } from "../Context/DataHandlerContext";
import { useView } from "../Context/ViewContext";

/**
 * Componente intermediario que envuelve el diálogo con su contexto de datos.
 */
function CreateUpdateViewWrapper() {
    const { createUpdateView, handleCreateUpdateView, CreateUpdateViewComponent } = useView();
    const { updateData } = useDataHandler();
    const { open, model } = createUpdateView;

    if (!CreateUpdateViewComponent) {
        return null;
    }

    return (
        <DialogDataContextProvider
            model={model}
            onSaveData={updateData}
            dataKey='nomina'
        >
            <CreateUpdateViewComponent
                open={open}
                onOpenChange={() => handleCreateUpdateView()}
            />
        </DialogDataContextProvider>
    );
}

/**
 * Componente que realmente se renderiza y pasa el handleSubmit.
 * Necesitamos esto porque no podemos usar un hook del contexto en el mismo nivel que el proveedor.
 */
function ActualCreateUpdateView({ open, onOpenChange }) {
    const { handleSubmit } = useDialogData();

    return (
        <CreateUpdateDialogComponent
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit}
        />
    )
}

// Renombramos el componente principal
export default function CreateUpdateView() {
    const { createUpdateView, handleCreateUpdateView, CreateUpdateViewComponent } = useView();
    const { updateData } = useDataHandler();
    const { open, model } = createUpdateView;

    if (!CreateUpdateViewComponent) {
        return null;
    }

    return (
        <DialogDataContextProvider
            model={model}
            onSaveData={updateData}
            dataKey='nomina'
        >
            <CreateUpdateViewComponent
                open={open}
                onOpenChange={() => handleCreateUpdateView()}
            />
        </DialogDataContextProvider>
    );
}