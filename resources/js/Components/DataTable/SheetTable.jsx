import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/Components/ui/sheet";

/**
 * Componente SheetTable - Works as a container for the Sheet component
 * 
 * @param {string} props.title - Título del sheet
 * @param {JSX.Element} props.headerContent - Contenido del header del sheet
 * @param {JSX.Element} props.descriptionContent - Contenido de la descripción del sheet
 * @param {boolean} props.open - Estado de apertura del sheet
 * @param {function} props.onOpenChange - Función para manejar el cambio de estado de apertura del sheet
 * @returns {JSX.Element} Componente SheetTable
 */
export function SheetTable({ title, headerContent, descriptionContent, open, onOpenChange, className }) {

    return (
        // Componente Sheet que controla la visibilidad del contenido
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className={`rounded-l-3xl bg-custom-white dark:bg-custom-blackLight overflow-y-scroll dark:dark-scrollbar ${className}`}>
                <SheetHeader>
                    {headerContent}
                </SheetHeader>

                <div className="mt-10">
                    <SheetTitle className="text-xl font-semibold mb-4 text-custom-blue dark:text-custom-white">
                        {title}
                    </SheetTitle>
                    <SheetDescription>
                        <span className="hidden">{title}</span>
                    </SheetDescription>
                    
                    <div className="space-y-2 text-custom-white">
                        {descriptionContent}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
