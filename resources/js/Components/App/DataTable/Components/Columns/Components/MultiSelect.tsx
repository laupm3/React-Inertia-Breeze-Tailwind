// src/components/multi-select.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
    CheckIcon,
    Filter,
    XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
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
import { useDataTable } from "../../../Context/DataTableContext";
import { Badge } from "@/Components/ui/badge";

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
    /** The column object from TanStack Table. */
    column: any;

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

    /**
     * Animation duration in seconds for the visual effects (e.g., bouncing badges).
     * Optional, defaults to 0 (no animation).
     */
    animation?: number;

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
            column,
            options,
            onValueChange,
            variant,
            animation = 0,
            modalPopover = false,
            asChild = false,
            className,
            ...props
        },
        ref
    ) => {
        const { table } = useDataTable();

        const { columnFilters } = table.getState();
        const currentFilterValues = React.useMemo(
            () => column.getFilterValue() || [], [column, columnFilters]);

        // Consolidar estados relacionados
        const [state, setState] = React.useState({
            selectedValues: currentFilterValues,
            isPopoverOpen: false,
            searchValue: ""
        });
        const { selectedValues, isPopoverOpen, searchValue } = state;

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
                            "flex w-full p-1 rounded-md min-h-10 h-auto items-center justify-between [&_svg]:pointer-events-auto bg-inherit hover:bg-inherit dark:text-custom-gray-default !border-0 gap-1",
                            className
                        )}
                    >
                        <div className="font-medium flex gap-2 items-center text-sm text-muted-foreground">
                            {currentFilterValues.length > 0 && (
                                <>
                                    <Badge
                                        className={cn(
                                            "text-primary hover:bg-primary/10 w-6 h-6 flex items-center justify-center rounded-full",
                                            multiSelectVariants({ variant })
                                        )}
                                    >
                                        +{currentFilterValues.length}
                                    </Badge>
                                    <div className="flex items-center justify-between">
                                        <XIcon
                                            className="h-4 cursor-pointer text-muted-foreground hover:text-primary"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleClear();
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <Filter
                            size={16}
                            className={`text-muted-foreground ${currentFilterValues.length > 0 ? " text-orange-500" : isPopoverOpen ? "text-primary" : ""}`}
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    onEscapeKeyDown={() => updateState({ isPopoverOpen: false })}
                >
                    <div className="p-2">
                        <Input
                            placeholder="Buscar..."
                            value={searchValue}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="mb-2"
                        />
                    </div>
                    <Command shouldFilter={false} className="w-full">
                        {/* Keep Select All outside of Command component to prevent filtering */}
                        <div
                            className="flex items-center cursor-pointer p-3 py-1 gap-2 hover:bg-accent hover:text-accent-foreground rounded-sm"
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
                            <span>
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
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {filteredOptions.map((option) => {
                                    const isSelected = isSelectedHashMap[option.value];
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => toggleOption(option.value)}
                                            className="cursor-pointer"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </div>
                                            <span>{option.label}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                        <CommandSeparator />
                        <CommandGroup >
                            <div className="flex items-center justify-between">
                                {selectedValues.length > 0 && (
                                    <>
                                        <CommandItem
                                            onSelect={handleClear}
                                            className="flex-1 justify-center cursor-pointer"
                                        >
                                            Clear
                                        </CommandItem>
                                        <Separator
                                            orientation="vertical"
                                            className="flex min-h-6 h-full"
                                        />
                                    </>
                                )}
                                <CommandItem
                                    onSelect={() => updateState({ isPopoverOpen: false })}
                                    className="flex-1 justify-center cursor-pointer max-w-full"
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