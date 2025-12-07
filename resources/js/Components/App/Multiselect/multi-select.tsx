// src/components/multi-select.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
    CheckIcon,
    XCircle,
    ChevronDown,
    XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/Components/ui/command";
import { Input } from "@/Components/ui/input";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
    "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
    {
        variants: {
            variant: {
                default:
                    "border-foreground/10 text-foreground bg-card hover:bg-card/80",
                secondary:
                    "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                inverted: "inverted",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
    /**
     * An array of option objects to be displayed in the multi-select component.
     * Each option object has a label and a value.
     */
    options: {
        /** The text to display for the option. */
        label: string | React.ReactNode;
        /** The unique value associated with the option. */
        value: string;
    }[];

    /**
     * Callback function triggered when the selected values change.
     * Receives an array of the new selected values.
     */
    onValueChange: (value: string[]) => void;

    /** The default selected values when the component mounts. */
    defaultValue?: string[];

    /**
     * Placeholder text to be displayed when no values are selected.
     * Optional, defaults to "Select options".
     */
    placeholder?: string;

    /**
     * Animation duration in seconds for the visual effects (e.g., bouncing badges).
     * Optional, defaults to 0 (no animation).
     */
    animation?: number;

    /**
     * Maximum number of items to display. Extra selected items will be summarized.
     * Optional, defaults to 3.
     */
    maxCount?: number;

    /**
     * The modality of the popover. When set to true, interaction with outside elements
     * will be disabled and only popover content will be visible to screen readers.
     * Optional, defaults to false.
     */
    modalPopover?: boolean;

    /**
     * If true, renders the multi-select component as a child of another component.
     * Optional, defaults to false.
     */
    asChild?: boolean;

    /**
     * Additional class names to apply custom styles to the multi-select component.
     * Optional, can be used to add custom styles.
     */
    className?: string;
}

export const MultiSelect = React.forwardRef<
    HTMLButtonElement,
    MultiSelectProps
>(
    (
        {
            options,
            onValueChange,
            variant,
            defaultValue = [],
            placeholder = "Select options",
            animation = 0,
            maxCount = 1,
            modalPopover = false,
            asChild = false,
            className,
            ...props
        },
        ref
    ) => {
        // Consolidar estados relacionados
        const [state, setState] = React.useState({
            selectedValues: defaultValue,
            isPopoverOpen: false,
            searchValue: ""
        });
        const { selectedValues, isPopoverOpen, searchValue } = state;

        // Eliminar dynamicMaxCount ya que usaremos CSS para manejar esto
        const containerRef = React.useRef<HTMLDivElement>(null);

        // Mantener el resto de optimizaciones
        const isSelectedHashMap = React.useMemo(() =>
            Object.fromEntries(selectedValues.map(value => [value, true])),
            [selectedValues]);

        const filteredOptions = React.useMemo(() => {
            if (!searchValue.trim()) return options;

            const searchLower = searchValue.toLowerCase().trim();

            return options.filter(option => {
                const labelText = typeof option.label === 'string'
                    ? option.label.toLowerCase()
                    : '';
                const valueText = option.value.toLowerCase();

                return valueText.includes(searchLower) ||
                    labelText.includes(searchLower);
            });
        }, [options, searchValue]);

        const updateState = React.useCallback((updates: Partial<typeof state>) => {
            setState(prev => ({ ...prev, ...updates }));
        }, []);

        const toggleOption = React.useCallback((option: string) => {
            const newSelectedValues = selectedValues.includes(option)
                ? selectedValues.filter((value) => value !== option)
                : [...selectedValues, option];

            updateState({ selectedValues: newSelectedValues });
            onValueChange(newSelectedValues);
        }, [selectedValues, onValueChange, updateState]);

        const handleSearchChange = React.useCallback((value: string) => {
            updateState({ searchValue: value || "" });
        }, [updateState]);

        const handleClear = React.useCallback(() => {
            updateState({ selectedValues: [], searchValue: "" });
            onValueChange([]);
        }, [onValueChange, updateState]);

        // Añadir después de la línea del maxCount
        const [responsiveMaxCount, setResponsiveMaxCount] = React.useState(maxCount);

        // Usar ResizeObserver para ajustar dinámicamente cuántos badges mostrar
        React.useEffect(() => {
            if (!containerRef.current) return;

            const calculateVisibleCount = () => {
                const containerWidth = containerRef.current?.clientWidth || 0;
                // Aproximar 100px por badge + espacio para contador
                const estimatedCount = Math.floor((containerWidth - 60) / 100);
                setResponsiveMaxCount(Math.max(1, Math.min(estimatedCount, maxCount)));
            };

            const observer = new ResizeObserver(calculateVisibleCount);
            observer.observe(containerRef.current);

            return () => observer.disconnect();
        }, [maxCount]);

        // Modificar estas líneas para usar responsiveMaxCount
        const visibleCount = Math.min(responsiveMaxCount, selectedValues.length);
        const hiddenCount = selectedValues.length - visibleCount;

        // BadgeList modificado para mostrar solo hasta maxCount elementos
        const BadgeList = React.useMemo(() => {
            return selectedValues.slice(0, responsiveMaxCount).map((value) => {
                const option = options.find((o) => o.value === value);
                return (
                    <Badge
                        key={value}
                        className={cn(
                            "badge-item bg-transparent text-foreground border-foreground/1 hover:bg-transparent shrink-0",
                            multiSelectVariants({ variant })
                        )}
                    >
                        <div className="px-1 py-1 flex items-center">
                            {option?.label}
                            <XCircle
                                className="h-4 w-4 cursor-pointer ml-2"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    toggleOption(value);
                                }}
                            />
                        </div>
                    </Badge>
                );
            });
        }, [selectedValues, responsiveMaxCount, options, variant, toggleOption]);

        return (
            <Popover
                open={isPopoverOpen}
                onOpenChange={(open) => updateState({ isPopoverOpen: open })}
                modal={modalPopover}
            >
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        {...props}
                        onClick={() => updateState({ isPopoverOpen: !isPopoverOpen })}
                        className={cn(
                            "flex w-full p-1 min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto dark:text-custom-gray-default  dark:bg-custom-blackSemi rounded-full bg-custom-white border-2",
                            className
                        )}
                    >
                        {selectedValues.length > 0 ? (
                            <div className="flex justify-between items-center overflow-hidden w-full">
                                <div
                                    ref={containerRef}
                                    className="rounded-full flex justify-between items-center w-full calc[100% - 50px] overflow-hidden relative"
                                >
                                    {/* Contenedor de elementos seleccionados con ancho máximo fijo */}
                                    <div className="flex items-center gap-1 w-full overflow-hidden flex-nowrap">
                                        {BadgeList}
                                    </div>

                                    {/* Contador de elementos adicionales, solo se muestra cuando hay elementos ocultos */}
                                    <div className="flex items-center z-10 shrink-0">
                                        {hiddenCount > 0 && (
                                            <Badge
                                                className={cn(
                                                    "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 w-8 h-8 flex items-center justify-center rounded-full",
                                                    multiSelectVariants({ variant })
                                                )}
                                            >
                                                {`+${hiddenCount}`}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                    <XIcon
                                        className="h-4 cursor-pointer text-muted-foreground"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleClear();
                                        }}
                                    />
                                    <Separator
                                        orientation="vertical"
                                        className="flex min-h-6 h-full"
                                    />
                                    <ChevronDown className="h-4 cursor-pointer text-muted-foreground" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full mx-auto">
                                <span className="text-sm text-muted-foreground mx-3">
                                    {placeholder}
                                </span>
                                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] p-0 z-[9999]"
                    align="start"
                    onEscapeKeyDown={() => updateState({ isPopoverOpen: false })}
                >
                    <div className="p-3 sm:p-4">
                        <Input
                            placeholder="Buscar..."
                            value={searchValue}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="mb-3"
                        />
                    </div>
                    <Command shouldFilter={false} className="w-full">
                        {/* Keep Select All outside of Command component to prevent filtering */}
                        <div
                            className="flex items-center cursor-pointer p-3 py-2 gap-2 hover:bg-accent hover:text-accent-foreground rounded-sm mx-2"
                            onClick={() => {
                                const filteredValues = filteredOptions.map(option => option.value);
                                const allFilteredSelected = filteredValues.every(value =>
                                    selectedValues.includes(value)
                                );

                                if (allFilteredSelected) {
                                    const newSelectedValues = selectedValues.filter(
                                        value => !filteredValues.includes(value)
                                    );
                                    updateState({ selectedValues: newSelectedValues });
                                    onValueChange(newSelectedValues);
                                } else {
                                    const newSelectedValues = [
                                        ...selectedValues.filter(value => !filteredValues.includes(value)),
                                        ...filteredValues
                                    ];
                                    updateState({ selectedValues: newSelectedValues });
                                    onValueChange(newSelectedValues);
                                }
                            }}
                        >
                            <div
                                className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    filteredOptions.length > 0 &&
                                        filteredOptions.every(option => selectedValues.includes(option.value))
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible"
                                )}
                            >
                                <CheckIcon className="h-4 w-4" />
                            </div>
                            <span className="text-sm">
                                {searchValue
                                    ? (filteredOptions.every(option => selectedValues.includes(option.value)))
                                        ? `Deseleccionar resultados (${filteredOptions.length})`
                                        : `Seleccionar resultados (${filteredOptions.length})`
                                    : (selectedValues.length === options.length)
                                        ? "Deseleccionar todo"
                                        : "Seleccionar todo"}
                            </span>
                        </div>
                        <CommandSeparator />
                        <CommandList className="max-h-[40vh] sm:max-h-[300px]">
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup className="p-0">
                                {filteredOptions.map((option) => {
                                    const isSelected = isSelectedHashMap[option.value];
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => toggleOption(option.value)}
                                            className="cursor-pointer mx-2 px-3 py-2 text-sm rounded-sm"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary flex-shrink-0",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </div>
                                            <span className="truncate">{option.label}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                        <CommandSeparator />
                        <CommandGroup className="p-0">
                            <div className="flex items-center justify-between p-2 mx-2">
                                {selectedValues.length > 0 && (
                                    <>
                                        <CommandItem
                                            onSelect={handleClear}
                                            className="flex-1 justify-center cursor-pointer text-sm py-2"
                                        >
                                            Clear
                                        </CommandItem>
                                        <Separator
                                            orientation="vertical"
                                            className="flex min-h-6 h-full mx-2"
                                        />
                                    </>
                                )}
                                <CommandItem
                                    onSelect={() => updateState({ isPopoverOpen: false })}
                                    className="flex-1 justify-center cursor-pointer max-w-full text-sm py-2"
                                >
                                    Close
                                </CommandItem>
                            </div>
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }
);

MultiSelect.displayName = "MultiSelect";