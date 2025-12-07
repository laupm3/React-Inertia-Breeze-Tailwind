import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import GetTypeFooter from "@/Components/App/Modals/Footers/Helpers/GetTypeFooter";

/**
 * The DecisionModal component - A modal that requires the user to make a decision
 * 
 * @param {Object} props The component props
 * @param {JSX.Element} props.title The title of the modal
 * @param {JSX.Element} props.content The content of the modal
 * @param {Boolean} props.open The state of the modal
 * @param {Function} props.onOpenChange The function to change the state of the modal
 * @param {Function} props.action The function to execute the action after the user confirms
 * @param {JSX.Element} props.icon The icon of the modal
 * @param {String} props.variant The variant of the modal
 * @param {String} props.actionText The text for the action button
 * @param {Boolean} props.isLoading Whether the modal is in a loading state
 * 
 * @example Variant: "confirm", "destructive", "default"
 * 
 * @returns {JSX.Element} The DecisionModal component
 */
export default function DecisionModal({
    title,
    content,
    open,
    onOpenChange,
    action,
    icon,
    variant = "default",
    actionText,
    isLoading = false
}) {

    /**
     * Manage the action of the modal and close it
     */
    const manageAction = () => {
        if (isLoading) return; // Prevenir múltiples ejecuciones durante carga
        action();
    }

    /**
     * Close the modal
     */
    const closeModal = () => {
        if (isLoading) return; // Prevenir cerrar durante carga
        onOpenChange(false);
    }

    return (
        <AlertDialog overlay open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
            <AlertDialogContent
                onEscapeKeyDown={isLoading ? undefined : () => onOpenChange(false)}
                className="w-[40rem] bg-custom-white dark:bg-custom-blackLight"
            >
                <div className={`flex items-start ${icon ? "gap-3" : ""}`}>
                    {icon && <div className="mt-1">{icon}</div>}
                    <div className="flex-1 flex-col">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center text-lg text-custom-blackLight dark:text-custom-white">
                                {title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className={`text-md !mt-1 text-custom-blackSemi dark:text-custom-white`}>
                                {content}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                            <GetTypeFooter
                                type={variant}
                                onClick={manageAction}
                                onClose={closeModal}
                                actionText={actionText}
                                isLoading={isLoading}
                            />
                        </AlertDialogFooter>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
