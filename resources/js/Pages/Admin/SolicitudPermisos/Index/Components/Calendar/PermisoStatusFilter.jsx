import { useState, useMemo, useEffect } from 'react';

import { cn } from "@/lib/utils";

import Icon from "@/imports/LucideIcon";

import { Button } from "@/Components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";

import { STATUS_BADGE_COLORS, getEstadoSolicitud } from './INITIAL_PERMISOS';

const PermisoStatusFilter = ({ allEvents, onFilterChange, className, currentSelectedStatuses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(currentSelectedStatuses || []); 
  const [searchTerm, setSearchTerm] = useState("");

  // Sincronizar el estado interno si la prop cambia
  useEffect(() => {
    if (currentSelectedStatuses) {
      setSelectedStatuses(currentSelectedStatuses);
    }
  }, [currentSelectedStatuses]);

  // Extraer estados únicos de allEvents (que son las solicitudes)
  const uniqueStatuses = useMemo(() => {
    if (!allEvents || allEvents.length === 0) {
      return [];
    }
    const statusMap = new Map();
    allEvents.forEach(solicitud => {
      const estado = getEstadoSolicitud(solicitud);
      if (!statusMap.has(estado)) {
        statusMap.set(estado, {
          nombre: estado,
          color: STATUS_BADGE_COLORS[estado] || STATUS_BADGE_COLORS.default,
          count: 1
        });
      } else {
        statusMap.get(estado).count++;
      }
    });
    return Array.from(statusMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [allEvents]);

  // Función para filtrar estados basados en el término de búsqueda
  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return uniqueStatuses;
    }
    return uniqueStatuses.filter(status =>
      status.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueStatuses, searchTerm]);

  //Función para manejar la selección de estados
  const handleSelectStatus = (statusToToggle) => {
    setSelectedStatuses(prevSelected => {
      const isAlreadySelected = prevSelected.includes(statusToToggle.nombre);
      let newSelected;
      if (isAlreadySelected) {
        newSelected = prevSelected.filter(status => status !== statusToToggle.nombre);
      } else {
        newSelected = [...prevSelected, statusToToggle.nombre];
      }
      onFilterChange(newSelected);
      return newSelected;
    });
  };

  // Función para obtener el ícono según el estado
  const getStatusIcon = (statusName) => {
    switch (statusName) {
      case 'Aprobado':
        return 'Check';
      case 'Denegado':
        return 'X';
      case 'En revisión':
        return 'Eye';
      case 'Solicitado':
        return 'Send';
      case 'En proceso':
        return 'Loader';
      case 'Pendiente':
        return 'Clock';
      case 'Visto':
        return 'Eye';
      default:
        return 'HelpCircle';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn("w-full md:w-auto justify-between rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker", className)}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <Icon name="Filter" className="h-4 w-4 mr-2" />
            {selectedStatuses.length === 0 && "Filtrar por estado"}
            {selectedStatuses.length === 1 && (
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${STATUS_BADGE_COLORS[selectedStatuses[0]] || STATUS_BADGE_COLORS.default}`}></div>
                <span className="text-sm">{selectedStatuses[0]}</span>
              </div>
            )}
            {selectedStatuses.length > 1 && (
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${STATUS_BADGE_COLORS[selectedStatuses[0]] || STATUS_BADGE_COLORS.default}`}></div>
                <span className="text-sm">{selectedStatuses[0]}</span>
                <span className="text-xs ml-1 px-2 py-0.5 rounded-full bg-custom-gray-dark text-white">
                  +{selectedStatuses.length - 1}
                </span>
              </div>
            )}
          </div>
          <Icon name="ChevronsUpDown" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] w-max p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar estado..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-9 rounded-t-md rounded-b-none"
          />
          <CommandList>
            <CommandEmpty>Ningún estado encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((status) => {
                const isSelected = selectedStatuses.includes(status.nombre);
                return (
                  <CommandItem
                    key={status.nombre}
                    value={status.nombre} 
                    onSelect={() => handleSelectStatus(status)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Icon
                        name="Check"
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className={`w-3 h-3 rounded-full mr-2 ${status.color}`}></div>
                      <Icon name={getStatusIcon(status.nombre)} className="mr-2 h-4 w-4" />
                      <span>{status.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {status.count}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PermisoStatusFilter;
