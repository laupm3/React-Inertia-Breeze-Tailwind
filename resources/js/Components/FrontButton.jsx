
import { Button } from "@/Components/ui/button"

export default function FrontButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <Button
            {...props}
            className="bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-semiLight dark:hover:bg-custom-gray-darker text-md text-custom-blackLight dark:text-white font-semibold rounded-full py-7 px-4 w-full"
            disabled={disabled}
            >
            {children}
        </Button>
    );
}