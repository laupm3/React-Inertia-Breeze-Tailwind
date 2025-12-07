import { Button } from "@/Components/App/Buttons/Button";

export default function DestructiveFooter({ onClose, actionText = "Eliminar", isLoading = false, ...props }) {
    return (
        <div className={"flex justify-end space-x-4 w-full"}>
            <Button className="w-full" variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancelar
            </Button>
            <Button className="w-full" variant="destructive" disabled={isLoading} {...props}>
                {actionText}
            </Button>
        </div>
    );
}
