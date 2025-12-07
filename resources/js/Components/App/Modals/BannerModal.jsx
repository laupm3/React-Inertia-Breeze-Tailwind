import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import Icon from "@/imports/LucideIcon";

/**
 * The BannerModal component - A modal that shows information to the user
 * 
 * @param {Object} props The component props
 * @param {JSX.Element} props.title The title of the modal
 * @param {JSX.Element} props.content The content of the modal
 * @param {Boolean} props.open The state of the modal
 * @param {Function} props.onOpenChange The function to change the state of the modal
 * @param {JSX.Element} props.icon The icon of the modal
 * 
 * @returns {JSX.Element} The BannerModal component
 */
export default function BannerModal({
    title,
    content,
    open,
    onOpenChange,
    icon,
}) {
    return (
        <AlertDialog overlay open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent
                onEscapeKeyDown={onOpenChange}
                className="w-[40rem] bg-custom-white dark:bg-custom-blackLight"
            >
                <AlertDialogHeader>
                    <div className={`flex items-start ${icon ? "gap-3" : ""}`}>
                        {icon && <div className="mt-1">{icon}</div>}
                        <div className="flex-1">
                            <AlertDialogTitle className="flex items-center text-lg text-custom-blackLight dark:text-custom-white">
                                {title}
                            </AlertDialogTitle>
                            <AlertDialogDescription
                                className={`text-md mt-1 text-custom-blackSemi dark:text-custom-white`}
                            >
                                {content}
                            </AlertDialogDescription>
                        </div>
                        <button
                            className="absolute top-3 right-3 h-6 w-6 text-gray-500 hover:text-gray-700"
                            onClick={onOpenChange}
                            aria-label="Close"
                        >
                            <Icon name="X" />
                        </button>
                    </div>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    );
}
