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
import axios from "axios";

export default function RoleAdder({ prevRoles, fetchUrl, className, onSelect }) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation('datatable');

  //Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback 
  const manageSelection = useCallback((role) => {
    if (onSelect) {
      onSelect(role);
    }
  }, [onSelect]);

  // Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(fetchUrl);
        if (response.status === 200) {
          setRoles(response.data.roles);
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
    return () => { };
  }, [fetchUrl]);

  // useMemo genera la lista de roles, si el rol no cambia, no hace recálculos
  const rolesList = useMemo(() => {
    return roles.map((role) => (
      <CommandItem
        key={role.id}
        value={role.id}
        onSelect={() => {
          manageSelection(role);
        }}
      >
        {prevRoles?.some((prevRole) => prevRole.id === role.id)
          ? <Icon name="Minus" className="mr-2 h-4 w-4 shrink-0 text-red-500" />
          : <Icon name="Plus" className="mr-2 h-4 w-4 shrink-0 text-green-500" />
        }
        {role.name}
      </CommandItem>
    ));
  }, [roles, manageSelection]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={`flex items-center cursor-pointer py-2 px-4 rounded-full text-custom-black dark:text-custom-white hover:bg-custom-gray-default hover:dark:bg-custom-blackSemi ${className}`}
          onClick={() => setOpen(!open)}
        >
          <Icon name="Plus" className="mr-4 h-4 w-4" />
          {t('Añade Rol')}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2">
        <Command>
          <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Añdir rol..." />
          <CommandList>
            <CommandEmpty>
              {error
                ? <span className="text-red-500">Error al cargar los roles.</span>
                : 'Ningún rol encontrado'
              }
            </CommandEmpty>
            <CommandGroup>
              {rolesList}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
