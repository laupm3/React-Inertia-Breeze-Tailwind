import { useCallback, useState } from "react";
import { Head } from '@inertiajs/react';
import { DialogDataContextProvider } from "@/Components/App/Teams/CreateUpdateDialog/Context/DialogDataContext";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Index from "./Partials/Index";

function CreateUpdate({ teamId: model }) {
    const [data, setData] = useState([]);

    const updateData = useCallback((newItem) => {
        setData((prevData) => {
            const exists = prevData.some((item) => item.id === newItem?.id);
            return exists
                ? [
                    newItem,
                    ...prevData.filter((item) => item.id !== newItem.id)
                ]
                : [newItem, ...prevData];
        });
    }, []);

    const handleOpenChange = useCallback((open) => {
        if (!open) {
            window.location.href = route('dashboard');
        }
    }, []);

    return (
        <>
            <Head title="Teams" />
            <div className="max-w-full mx-auto py-7 xl:px-8 px-4 overflow-hidden">
                <DialogDataContextProvider
                    model={model}
                    onSaveData={updateData}
                    onOpenChange={handleOpenChange}
                    modelAlias="Equipo"
                    dataKey="team"
                >
                    <Index />
                </DialogDataContextProvider>
            </div>
        </>
    )
}

export default CreateUpdate

CreateUpdate.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
