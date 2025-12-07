import { Button } from '@/Components/ui/button';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <Button
            {...props}
            className={"bg-custom-orange hover:bg-custom-blue dark:hover:bg-custom-white text-white dark:text-custom-blackSemi font-semibold rounded-full py-2 px-4 w-full " + className}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}
