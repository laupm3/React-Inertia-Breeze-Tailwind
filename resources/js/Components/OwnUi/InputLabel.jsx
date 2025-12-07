import { Label } from "@/Components/ui/label"

export default function InputLabel(
    {
        value,
        children,
        className = '',
        ...props
    }) {
    return (
        <Label
            {...props}
            className={"text-gray-700 dark:text-gray-300 text-md " + className}
        >
            {value ? value : children}
        </Label>
    );
}
