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

export default function UserAdder({ prevUsers, fetchUrl, className, onSelect }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation('datatable');

  //Evita renders innecesarios, asegura que las funciones y valores esten memorizadas con useCallback 
  const manageSelection = useCallback((user) => {
    if (onSelect) {
      onSelect(user);
    }
  }, [onSelect]);

  // Realiza la solicitud HTTP, garantiza que solo se ejecute una vez, cuando el componente se monte.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(fetchUrl);
        if (response.status === 200) {
          setUsers(response.data.users);
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

  // useMemo genera la lista de users, si el rol no cambia, no hace recálculos
  const usersList = useMemo(() => {
    return users.map((user) => (
      <CommandItem
        key={user.id}
        value={user.id}
        onSelect={() => {
          manageSelection(user);
        }}
      >
        {prevUsers?.some((prevUser) => prevUser.id === user.id)
          ? <Icon name="Minus" className="mr-2 h-4 w-4 shrink-0 text-red-500" />
          : <Icon name="Plus" className="mr-2 h-4 w-4 shrink-0 text-green-500" />
        }
        {user.name}
      </CommandItem>
    ));
  }, [users, manageSelection]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <button
          user="combobox"
          aria-expanded={open}
          className={`flex items-center cursor-pointer py-2 px-4 rounded-full text-custom-black dark:text-custom-white hover:bg-custom-gray-default hover:dark:bg-custom-blackSemi ${className}`}
          onClick={() => setOpen(!open)}
        >
          <Icon name="Plus" className="mr-4 h-4 w-4" />
          {t('Añade Usuario')}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2">
        <Command>
          <CommandInput className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" placeholder="Añdir rol..." />
          <CommandList>
            <CommandEmpty>
              {error
                ? <span className="text-red-500">Error al cargar los users.</span>
                : 'Ningún rol encontrado'
              }
            </CommandEmpty>
            <CommandGroup>
              {usersList}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}