import { useState } from "react";
import { Button } from "@/Components/App/Buttons/Button";
import Icon from "@/imports/LucideIcon";
import AnexosDialog from "@/Components/App/Contratos/AnexosDialog/AnexosDialog";

export default function AnexosTrigger({ contrato, onSaveData, onDelete }) {
    const [anexosDialogOpen, setAnexosDialogOpen] = useState(false);

    const hasAnexos = contrato.anexos && contrato.anexos.length > 0;
  
    return (
        <>
            <Button
                variant="secondary"
                className="flex items-center gap-2 hover:bg-transparent"
                onClick={() => setAnexosDialogOpen(true)}
                disabled={!hasAnexos}
            >
                Ver anexos
                <Icon name="ArrowUpRight" className="w-4 ml-1" />
            </Button>

            {/* Dialog de Anexos */}
            <AnexosDialog
                open={anexosDialogOpen}
                model={contrato.id}
                onOpenChange={setAnexosDialogOpen}
                onSaveData={onSaveData}
            />
        </>
    )
}
