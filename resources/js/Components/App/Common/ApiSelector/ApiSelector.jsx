import { useEffect, useState, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import Icon from "@/imports/LucideIcon"
import axios from 'axios'

/**
 * Selector genérico para APIs con búsqueda, filtrado y lazy loading
 */
export default function ApiSelector({
  apiUrl,
  prevSelectedValue,
  onSelect,
  placeholder = "Seleccionar opción",
  searchPlaceholder = "Buscar...",
  renderOption,
  renderSelected,
  valueKey = 'id',
  labelKey = 'name',
  dataKey = 'data',
  allowClear = true,
  className = '',
  disabled = false
}) {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función manageSelection siguiendo el patrón de TurnoSelect
    const manageSelection = useCallback((item) => {
        if (onSelect) {
            onSelect(item);
        }
    }, [onSelect]);

    // Fetch data from API
    const fetchData = useCallback(async () => {
        if (!apiUrl) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(apiUrl);
            const data = dataKey ? response.data[dataKey] : response.data;
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar los datos');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, dataKey]);

    // Establecer los datos cuando cambie la URL de la API
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Actualizar el item seleccionado cuando cambie prevSelectedValue
    useEffect(() => {
        if (prevSelectedValue && items.length > 0) {
            const item = items.find((i) => i[valueKey] === prevSelectedValue);
            if (item) {
                setSelectedItem(item);
            }
        } else if (!prevSelectedValue) {
            setSelectedItem(null);
        }
    }, [prevSelectedValue, items, valueKey]);

    // Función useMemo itemsList siguiendo el patrón de TurnoSelect
    const itemsList = useMemo(() => {        return items.map((item, index) => (
            <CommandItem
                key={item[valueKey] ? `item-${item[valueKey]}` : `item-index-${index}`}
                value={item[labelKey]?.toString() || ''}
                onSelect={() => {
                    const newItem = (item[valueKey] === selectedItem?.[valueKey]) ? null : item;
                    setSelectedItem(newItem);
                    setOpen(false);
                    manageSelection(newItem);
                }}
                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-custom-gray-default dark:hover:bg-custom-gray-darker min-h-[60px]"
            >
                <Icon name="Check"
                    className={cn(
                        "h-4 w-4",
                        selectedItem?.[valueKey] === item[valueKey] ? "opacity-100" : "opacity-0"
                    )}
                />
                <div className="flex-1">
                    {renderOption ? renderOption(item) : (item[labelKey] || 'Sin nombre')}
                </div>
            </CommandItem>
        ));
    }, [items, selectedItem, manageSelection, renderOption, valueKey, labelKey]);

    // Función para renderizar el item seleccionado
    const renderSelectedItem = () => {
        if (selectedItem) {
            return renderSelected ? renderSelected(selectedItem) : (selectedItem[labelKey] || 'Sin nombre');
        }
        return placeholder;
    };

    return (
        <Popover open={open} onOpenChange={disabled ? () => {} : setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-default'} text-sm flex p-2.5 items-center`}
                    onClick={disabled ? () => {} : () => setOpen(!open)}
                    disabled={disabled}
                >
                    <div className="flex items-center ml-4">
                        <span>{renderSelectedItem()}</span>
                    </div>
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>            <PopoverContent className="w-[400px] p-2 bg-custom-gray-default dark:bg-custom-blackSemi">
                <Command className='bg-custom-gray-default dark:bg-custom-blackSemi'>
                    <CommandInput 
                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" 
                        placeholder={searchPlaceholder} 
                    />
                    <CommandList className='dark:dark-scrollbar max-h-64'>
                        <CommandEmpty>
                            {loading && <span>Cargando datos...</span>}
                            {error && <span className="text-red-500">{error}</span>}
                            {!loading && !error && <span>Ningún elemento encontrado</span>}
                        </CommandEmpty>
                        <CommandGroup>
                            {!loading && !error && itemsList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}