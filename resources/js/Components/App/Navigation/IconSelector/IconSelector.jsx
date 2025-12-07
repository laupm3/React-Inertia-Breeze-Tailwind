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
import { icons } from 'lucide-react'

// Obtener todos los nombres de iconos disponibles de Lucide
const ALL_ICON_NAMES = Object.keys(icons);

// Mapeo de palabras clave en español para mejorar la búsqueda
const SPANISH_KEYWORDS = {
  'usuario': ['User', 'Users', 'UserPlus', 'Users2', 'UserCheck', 'UserMinus', 'UserX'],
  'casa': ['Home', 'House'],
  'configuracion': ['Settings', 'Cog', 'Wrench', 'Tool'],
  'archivo': ['File', 'FileText', 'Folder', 'Archive', 'FolderOpen'],
  'buscar': ['Search', 'Filter', 'Scan', 'Eye'],
  'editar': ['Edit', 'Pencil', 'PenTool', 'Edit2', 'Edit3'],
  'eliminar': ['Trash', 'Trash2', 'X', 'XCircle', 'Delete'],
  'guardar': ['Save', 'Download', 'Archive'],
  'correo': ['Mail', 'MessageSquare', 'MessageCircle', 'Send'],
  'telefono': ['Phone', 'PhoneCall', 'PhoneIncoming', 'PhoneOutgoing'],
  'calendario': ['Calendar', 'Clock', 'Timer', 'CalendarDays'],
  'dinero': ['DollarSign', 'Euro', 'PoundSterling', 'CreditCard', 'Coins'],
  'compras': ['ShoppingCart', 'ShoppingBag', 'Store', 'Package'],
  'musica': ['Music', 'Headphones', 'Volume2', 'Play', 'Disc'],
  'imagen': ['Image', 'Camera', 'Video', 'Images', 'CameraOff'],
  'red': ['Wifi', 'Globe', 'Network', 'Link', 'ExternalLink'],
  'seguridad': ['Lock', 'Shield', 'Key', 'Eye', 'EyeOff', 'ShieldCheck'],
  'favorito': ['Star', 'Heart', 'Bookmark', 'Flag'],
  'notificacion': ['Bell', 'BellRing', 'AlertTriangle', 'AlertCircle'],
  'grafico': ['PieChart', 'BarChart3', 'TrendingUp', 'Activity', 'LineChart'],
  'flecha': ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight'],
  'menu': ['Menu', 'Grid3X3', 'List', 'MoreHorizontal', 'MoreVertical']
};

export default function IconSelector({ 
  prevSelectedIcon, 
  className, 
  onSelect, 
  disabled = false, 
  placeholder = "Seleccionar ícono" 
}) {
    const [open, setOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(null);
    
    const manageSelection = useCallback((iconName) => {
        if (onSelect) {
            onSelect(iconName);
        }
    }, [onSelect]);

    // Actualizar el icono seleccionado cuando cambie prevSelectedIcon
    useEffect(() => {
        if (prevSelectedIcon) {
            setSelectedIcon(prevSelectedIcon);
        } else {
            setSelectedIcon(null);
        }
    }, [prevSelectedIcon]);

    // Lista de iconos - todos los iconos disponibles
    const iconsList = useMemo(() => {
        return ALL_ICON_NAMES.map((iconName) => {
            return (
                <CommandItem
                    key={iconName}
                    value={iconName}
                    onSelect={() => {
                        const newIcon = (iconName === selectedIcon) ? null : iconName;
                        setSelectedIcon(newIcon);
                        setOpen(false);
                        manageSelection(newIcon);
                    }}
                    className="flex items-center gap-3 p-2"
                >
                    <Icon 
                        name={iconName} 
                        className={cn(
                            "w-5 h-5",
                            selectedIcon === iconName 
                                ? "text-custom-orange" 
                                : "text-custom-gray-semiDark dark:text-custom-white"
                        )} 
                    />
                    <span className="text-sm flex-1">{iconName}</span>
                    <Icon name="Check"
                        className={cn(
                            "h-4 w-4",
                            selectedIcon === iconName ? "opacity-100" : "opacity-0"
                        )}
                    />
                </CommandItem>
            );
        });
    }, [selectedIcon, manageSelection]);

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
                    {selectedIcon ? (
                        <div className="flex items-center ml-4 gap-2">
                            <Icon name={selectedIcon} className="w-4 h-4 text-custom-orange" />
                            <span>{selectedIcon}</span>
                        </div>
                    ) : (
                        <span className="ml-4">{placeholder}</span>
                    )}
                    <Icon name="ChevronsUpDown" className="ml-2 mr-4 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>            <PopoverContent className="w-full p-2 bg-custom-gray-default dark:bg-custom-blackSemi">
                <Command className='bg-custom-gray-default dark:bg-custom-blackSemi' filter={(value, search) => {
                    // Filtro personalizado para búsqueda en español
                    if (!search) return 1;
                    
                    const searchLower = search.toLowerCase();
                    const iconName = value;
                    
                    // Búsqueda directa por nombre del ícono
                    if (iconName.toLowerCase().includes(searchLower)) {
                        return 1;
                    }
                    
                    // Búsqueda por palabras clave en español
                    for (const [spanish, englishIcons] of Object.entries(SPANISH_KEYWORDS)) {
                        if (searchLower.includes(spanish) && englishIcons.includes(iconName)) {
                            return 1;
                        }
                    }
                    
                    return 0;
                }}>
                    <CommandInput 
                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker" 
                        placeholder="Buscar icono (ej: usuario, casa, configuracion)..." 
                    />
                    <CommandList className='dark:dark-scrollbar'>
                        <CommandEmpty>
                            <span>Ningún icono encontrado</span>
                        </CommandEmpty>
                        <CommandGroup>
                            {iconsList}
                            <div className="px-2 py-1 text-xs text-custom-gray-semiDark dark:text-custom-gray-semilight border-t border-custom-gray-light dark:border-custom-gray-dark mt-1 text-center">
                                {iconsList.length} iconos mostrados
                            </div>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
