import { Button } from "@/Components/App/Buttons/Button";

export default function ConfirmFooter({ onClose, actionText = "Confirmar", isLoading = false, ...props }) {
    return (
        <div className={"flex justify-end space-x-4 w-full"}>
            <Button className="w-full" variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancelar
            </Button>
            <Button className="w-full" variant="secondary" disabled={isLoading} {...props}>
                {actionText}
            </Button>
        </div>
    );
}
