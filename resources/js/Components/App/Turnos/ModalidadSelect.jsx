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
import { useTranslation } from "react-i18next";

export default function ModalidadSelect({ prevModalidadId, modalidadesData = [], className, onSelect, disabled = false, placeholder }) {
    const [open, setOpen] = useState(false);
    const [selectedModalidad, setSelectedModalidad] = useState(null);
    const [modalidades, setModalidades] = useState([]);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation('datatable');

    //Función manageSelection
    // Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback
    const manageSelection = useCallback((modalidad) => {
        if (onSelect) {
            onSelect(modalidad);
        }
    }, [onSelect]);

    // Establece las modalidades solo cuando cambien los datos recibidos
    useEffect(() => {
        setModalidades(modalidadesData || []);
        setLoading(false);
    }, [modalidadesData]);

    // Actualiza el modalidad seleccionado, si prevModalidadId cambia
    useEffect(() => {
        if (prevModalidadId && modalidades.length > 0) {
            const modalidad = modalidades.find((m) => m.id === prevModalidadId);
            if (modalidad) {
                setSelectedModalidad(modalidad);
            }
        } else if (!prevModalidadId) {
            setSelectedModalidad(null);
        }
    }, [prevModalidadId, modalidades]);

    // Función useMemo modalidadesList
    // useMemo genera la lista de modalidad(modalidadList), si modalidad no cambia, no hace recálculos
    const modalidadesList = useMemo(() => {
        return modalidades.map((modalidad, index) => (
            <CommandItem
                key={modalidad.id ? `modalidad-${modalidad.id}` : `modalidad-index-${index}`}
                value={modalidad.id?.toString()}
                onSelect={() => {
                    (modalidad.id === selectedModalidad?.id)
                        ? setSelectedModalidad(null)
                        : setSelectedModalidad(modalidad);
                    setOpen(false);
                    manageSelection((modalidad.id !== selectedModalidad?.id) ? modalidad : null);
                }}
            >
                <Icon name="Check"
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedModalidad?.id === modalidad.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {modalidad.name || modalidad.nombre || 'Sin nombre'}
            </CommandItem>
        ));
    }, [modalidades, selectedModalidad, manageSelection]);

    return (
        <Popover open={open} onOpenChange={disabled ? () => { } : setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-default'} text-sm flex p-2.5 items-center`}
                    onClick={disabled ? () => { } : () => setOpen(!open)}
                    disabled={disabled}
                >
                    {selectedModalidad ? (
                        <div className="flex items-center ml-4">
                            <span>{selectedModalidad.name || selectedModalidad.nombre || 'Sin nombre'}</span>
                        </div>
                    ) : (
                        <span className="ml-4">{placeholder || t('placeholder.SeleccionaModalidad')}</span>
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2 bg-custom-gray-default dark:bg-custom-blackSemi">
                <Command className='bg-custom-gray-default dark:bg-custom-blackSemi'>
                    <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Buscar turno..." />
                    <CommandList className='dark:dark-scrollbar'>
                        <CommandEmpty>
                            {loading
                                ? <span>Cargando modalidades...</span>
                                : <span>Ninguna modalidad encontrada</span>
                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {!loading && modalidadesList}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
