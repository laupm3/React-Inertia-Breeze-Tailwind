import { Alert as AlertBase, AlertDescription, AlertTitle } from "@/Components/ui/alert"

export default function Alert({ title, children, icon, className = '', variant = 'info' }) {
    return (
        <AlertBase
            className={className}
            variant={variant}
        >
            {icon}
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {children}
            </AlertDescription>
        </AlertBase>
    )
}