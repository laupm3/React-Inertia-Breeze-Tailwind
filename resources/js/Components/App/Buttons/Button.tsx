import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full ring-offset-background transition-colors disabled:pointer-events-none disabled:opacity-50 font-semibold",
    {
        variants: {
            variant: {
                primary:
                    "bg-custom-orange hover:bg-custom-blue dark:hover:bg-custom-white dark:text-custom-blackSemi text-custom-white ",
                secondary:
                    "bg-custom-gray-default hover:bg-custom-gray-semiLight dark:bg-custom-blackSemi dark:hover:bg-custom-blackLight",
                ghost: "bg-custom-white hover:bg-custom-gray-default dark:bg-custom-blackLight dark:hover:bg-custom-blackSemi",
                destructive: "text-red-500 hover:bg-red-500/40",
            },
            size: {
                default: "text-sm h-10 px-4 py-2",
                sm: "text-xs h-9 px-3",
                lg: "text-md h-11 px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
