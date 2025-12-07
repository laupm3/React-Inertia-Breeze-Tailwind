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
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar"; 

const PermisoEventFilter = ({ allEvents, onFilterChange, className, currentSelectedEmployees }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState(currentSelectedEmployees || []); 
  const [searchTerm, setSearchTerm] = useState("");

  // Sincronizar el estado interno si la prop cambia
  useEffect(() => {
    if (currentSelectedEmployees) {
      setSelectedEmployees(currentSelectedEmployees);
    }
  }, [currentSelectedEmployees]);

  // Extraer empleados únicos de allEvents (que son las solicitudes)
  const uniqueEmployees = useMemo(() => {
    if (!allEvents || allEvents.length === 0) {
      return [];
    }
    const employeeMap = new Map();
    allEvents.forEach(solicitud => {
      if (solicitud.empleado && solicitud.empleado.id && !employeeMap.has(solicitud.empleado.id)) {
        employeeMap.set(solicitud.empleado.id, solicitud.empleado);
      }
    });
    return Array.from(employeeMap.values());
  }, [allEvents]);

  // Función para filtrar empleados basados en el término de búsqueda
  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return uniqueEmployees;
    }
    return uniqueEmployees.filter(empleado =>
      (empleado.nombreCompleto || empleado.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueEmployees, searchTerm]);

  //Función para manejar la selección de empleados
  const handleSelectEmployee = (empleadoToToggle) => {
    setSelectedEmployees(prevSelected => {
      const isAlreadySelected = prevSelected.find(emp => emp.id === empleadoToToggle.id);
      let newSelected;
      if (isAlreadySelected) {
        newSelected = prevSelected.filter(emp => emp.id !== empleadoToToggle.id);
      } else {
        newSelected = [...prevSelected, empleadoToToggle];
      }
      onFilterChange(newSelected);
      return newSelected;
    });
  };

  const getEmpleadoDisplayName = (empleado) => {
    return empleado.nombreCompleto || empleado.nombre || `Empleado ${empleado.id}`;
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
          <div>
            {selectedEmployees.length === 0 && "Filtrar por empleado"}
            {selectedEmployees.length === 1 &&
              // Mostrar avatar y nombre para un solo empleado seleccionado
              <EmpleadoAvatar key={selectedEmployees[0].id} empleado={selectedEmployees[0]} />
            }
            {selectedEmployees.length > 1 && (
              // Mostrar primer avatar (pequeño) y contador para múltiples empleados
              <React.Fragment>
                <div className='flex items-center'>
                <EmpleadoAvatar empleado={selectedEmployees[0]} />
                <span className="text-xs ml-1 p-1 rounded-full bg-custom-gray-dark text-white">+{selectedEmployees.length - 1} más</span>
                </div>
              </React.Fragment>
            )}
          </div>
          <Icon name="ChevronsUpDown" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] w-max p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar empleado..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-9 rounded-t-md rounded-b-none"
          />
          <CommandList>
            <CommandEmpty>Ningún empleado encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((empleado) => {
                const isSelected = selectedEmployees.some(se => se.id === empleado.id);
                return (
                  <CommandItem
                    key={empleado.id}
                    value={getEmpleadoDisplayName(empleado)} 
                    onSelect={() => handleSelectEmployee(empleado)}
                  >
                    <Icon
                      name="Check"
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <EmpleadoAvatar empleado={empleado} size="sm" className="mr-2" />
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

export default PermisoEventFilter;
