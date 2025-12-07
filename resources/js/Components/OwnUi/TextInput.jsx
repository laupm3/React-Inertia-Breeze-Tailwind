import { useEffect, useRef } from 'react';
import { Input } from "@/Components/ui/input";

export default function TextInput({ label, isFocused, className = '', ...props }) {
    const inputRef = useRef();

    // Manejar el enfoque en el campo de entrada
    useEffect(() => {
        if (isFocused) {
            inputRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <div className='space-y-1 w-full'>
            <label className='font-medium'>
                {label}
            </label>
            <Input
                ref={inputRef}  // Asignamos la referencia para manejar el foco
                className={`block w-full rounded-xl bg-custom-gray-default dark:bg-custom-gray-darker mt-3 border-none text-gray-800 dark:text-gray-200 ${className}`}
                {...props}
            />
        </div>
    );
}