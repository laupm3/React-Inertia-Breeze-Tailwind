import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";
import Icon from "@/imports/LucideIcon";
import { useState } from "react";
import PreviewModal from "../Partials/PreviewModal";

export default function RowActionsTrigger({
    model
}) {
    const [open, setOpen] = useState(false);

    const handlePreview = () => {
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="btn hover:bg-custom-gray-semiLight dark:hover:bg-custom-blackSemi/50 rounded-full h-6 w-6 flex items-center justify-center focus:outline-none focus:ring-0 focus:ring-offset-0"
                    >
                        <Icon name="Ellipsis" className="w-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="dark:bg-custom-blackSemi"
                    onClick={(e => e.stopPropagation())}
                >
                    <DropdownMenuItem
                        onClick={handlePreview}
                    >
                        <Icon name="Eye" className="w-4 mr-2" /> Ver plantilla
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>

            <PreviewModal
                isOpen={open}
                onClose={handleCloseModal}
                htmlContent={model.html_content}
                templateName={model.name}
            />
        </>
    )
}