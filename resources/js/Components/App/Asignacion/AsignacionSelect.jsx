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


export default function AsignacionSelect({ prevAsignacionId, fetchUrl, className, onSelect }) {
  const [open, setOpen] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation('datatable');

  {/* Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback */ }
  const manageSelection = useCallback((asignacion) => {
    if (onSelect) {
      onSelect(asignacion);
    }
  }, [onSelect]);

  // Actualiza el empleado seleccionado, si prevEmpleadoId cambia
  useEffect(() => {
    if (prevAsignacionId) {
      const asignacion = asignaciones.find((asignacion) => asignacion.id === prevAsignacionId);
      if (asignacion) {
        setSelectedAsignacion(asignacion);
      }
    } else {
      setSelectedAsignacion(null);
    }
  }, [prevAsignacionId, asignaciones]);

  {/* Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte. */ }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(fetchUrl);
        if (response.status === 200) {
          setAsignaciones(response.data.asignaciones);
        } else {
          setError(true);
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUrl]);

  {/* useMemo genera la lista de asignaciones(asignacionesList), si empleado no cambia, no hace recálculos*/ }
  const asignacionesList = useMemo(() => {
    return asignaciones ? asignaciones.map((asignacion) => (
      <CommandItem
        key={asignacion.id}
        value={asignacion.id.toString()} // Asegúrate de que el valor sea una cadena
        onSelect={() => {
          setSelectedAsignacion(asignacion);
          setOpen(false);
          manageSelection(asignacion);
        }}
      >
        <Icon name="Check"
          className={cn(
            "mr-2 h-4 w-4",
            selectedAsignacion?.id === asignacion.id ? "opacity-100" : "opacity-0"
          )}
        />
        {asignacion.nombre}
      </CommandItem>
    )) : [];
  }, [asignaciones, selectedAsignacion, manageSelection]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between rounded-full bg-custom-gray-default dark:bg-custom-gray-darker text-custom-gray-semilight ${className} text-sm flex p-2.5 items-center cursor-default`}
          onClick={() => setOpen(!open)}
        >
          {selectedAsignacion ? (
            <div className="flex items-center ml-4 -m-1.5">
              {selectedAsignacion.nombre}
            </div>
          ) : (
            t('placeholder.SeleccionaAsignacion')
          )}
          <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2">
        <Command>
          <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Buscar asignacion..." />
          <CommandList>
            <CommandEmpty>
              {!error
                ? <span className="text-red-500">Error al cargar las asignaciones.</span>
                : 'Ninguna asignacion encontrada'
              }
            </CommandEmpty>
            <CommandGroup>
              {asignacionesList}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}