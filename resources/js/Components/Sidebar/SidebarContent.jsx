import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/Components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover";

import Icon from "@/imports/LucideIcon";

import SidebarSkeleton from "@/Components/Sidebar/SidebarSkeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Components/ui/tooltip";

import { createPortal } from 'react-dom';
import { useSidebar } from "@/Components/ui/sidebar";
import { useNavigationAPI as useNavigation } from "@/hooks/useNavigation";

import { useState, useEffect, useRef } from "react";
import { Link } from "@inertiajs/react";

// Función helper para verificar si una ruta existe
const routeExists = (routeName) => {
  try {
    if (!routeName || typeof routeName !== 'string') return false;

    // Verificar si la ruta existe en el objeto window.route
    if (typeof window !== 'undefined' && window.route && window.route.list) {
      return window.route.list().includes(routeName);
    }

    // Fallback: intentar generar la ruta
    route(routeName);
    return true;
  } catch (error) {
    // Solo mostrar warning en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Ruta '${routeName}' no encontrada`);
    }
    return false;
  }
};

// Función helper para obtener ruta segura
const safeRoute = (routeName, fallback = '#') => {
  if (!routeName || !routeExists(routeName)) {
    return fallback;
  }
  try {
    return route(routeName);
  } catch (error) {
    return fallback;
  }
};

export default function UnifiedSidebarContent() {
  // Estados locales para elementos dinámicos de la API
  const [items, setItems] = useState([]);

  // Estado para manejar menús desplegables en móvil
  const [openMenus, setOpenMenus] = useState({});

  // Refs para manejar scroll en móvil
  const commandListRef = useRef(null);

  // Hook para obtener navegación de la API
  const { isLoading, error, links, refreshNavigation } = useNavigation();

  // Detectar si es móvil y estado del sidebar
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Configurar event listeners para scroll en móvil
  useEffect(() => {
    if (isMobile && commandListRef.current) {
      const element = commandListRef.current;

      const preventModalScroll = (e) => {
        e.stopPropagation();
      };

      element.addEventListener('wheel', preventModalScroll, { passive: true });
      element.addEventListener('touchmove', preventModalScroll, { passive: true });
      element.addEventListener('scroll', preventModalScroll, { passive: true });

      return () => {
        element.removeEventListener('wheel', preventModalScroll);
        element.removeEventListener('touchmove', preventModalScroll);
        element.removeEventListener('scroll', preventModalScroll);
      };
    }
  }, [isMobile]);

  // Función para obtener contenido del tooltip
  const getTooltipContent = (item) => {
    if (isCollapsed && !isMobile) {
      // En modo collapsed, mostrar el nombre del elemento
      return item.name || item.title || '';
    } else if (!isCollapsed && item.description) {
      // En modo expandido, mostrar la descripción si existe
      return item.description;
    }
    return '';
  };

  // Función para determinar si mostrar tooltip
  const shouldShowTooltip = (item) => {
    const content = getTooltipContent(item);
    // Solo mostrar tooltip si:
    // 1. Hay contenido para mostrar
    // 2. Estamos en desktop (no móvil)
    // 3. El sidebar está collapsed (para nombres) o expandido con descripción
    return content &&
      content.trim() !== '' &&
      !isMobile &&
      (isCollapsed || (!isCollapsed && item.description));
  };

  // Componente Tooltip wrapper para el sidebar
  const SidebarTooltip = ({ children, content, disabled = false, side = "right" }) => {
    // No mostrar tooltip si está deshabilitado, no hay contenido, o estamos en móvil
    if (disabled || !content || content.trim() === '' || isMobile) {
      return children;
    }

    return (
      <Tooltip delayDuration={700}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        {createPortal(
          <TooltipContent
            side={side}
            align="center"
            sideOffset={8}
            className="z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          >
            {content}
          </TooltipContent>,
          document.body
        )}
      </Tooltip>
    );
  };

  // Componente especial para elementos con Popover que evita conflictos de ref
  const PopoverWithTooltip = ({ item, children }) => {
    const tooltipContent = getTooltipContent(item);
    const shouldShow = shouldShowTooltip(item);

    if (!shouldShow) {
      return children;
    }

    return (
      <Tooltip delayDuration={700}>
        <TooltipTrigger asChild>
          <div className="w-full">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          sideOffset={8}
          className="z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    );
  };

  // Función para alternar menús en móvil
  const toggleMobileMenu = (itemId) => {
    setOpenMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Función recursiva para verificar si un elemento tiene children válidos
  const hasValidChildren = (item) => {
    if (!item.children || !Array.isArray(item.children) || item.children.length === 0) {
      return false;
    }

    return item.children.some(child => {
      // Si el child tiene una ruta válida, es válido
      if (child.route_name && routeExists(child.route_name)) {
        return true;
      }
      // Si el child tiene children válidos, es válido
      if (hasValidChildren(child)) {
        return true;
      }
      return false;
    });
  };

  // Función para verificar si un elemento debe mostrarse
  const shouldShowItem = (item) => {
    // Si tiene una ruta válida, se muestra
    if (item.route_name && routeExists(item.route_name)) {
      return true;
    }
    // Si tiene children válidos, se muestra
    if (hasValidChildren(item)) {
      return true;
    }
    // Si no tiene nada válido, no se muestra
    return false;
  };

  // Procesar los links cuando lleguen de la API (ya vienen ordenados desde el backend)
  useEffect(() => {
    if (!isLoading && !error && links.length > 0) {
      // Obtener todos los elementos de primer nivel (parent_id null)
      const allLinks = links.filter(link => {
        return !link.parent_id && shouldShowItem(link);
      });

      setItems(allLinks);
    }
  }, [isLoading, error, links]);

  // Función recursiva para renderizar cualquier nivel de children
  const renderChildren = (children, level = 1) => {
    if (!children || children.length === 0) return null;

    // Filtrar solo los children que deben mostrarse
    const validChildren = children.filter(child => shouldShowItem(child));

    if (validChildren.length === 0) return null;

    return (
      <div className="flex flex-col space-y-1">
        {validChildren.map((child) => {
          const hasChildren = hasValidChildren(child);

          // Si tiene children, crear estructura dependiendo del dispositivo
          if (hasChildren) {
            if (isMobile) {
              // Menú desplegable simple para móvil
              return (
                <div key={child.id}>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm rounded-xl hover:bg-custom-white dark:hover:bg-custom-blackLight"
                    onClick={() => toggleMobileMenu(`${child.id}-${level}`)}
                  >
                    <Icon
                      name={child.icon || 'Folder'}
                      className="mr-2 h-4 w-4 text-custom-orange"
                    />
                    {child.name}
                    <Icon
                      name={openMenus[`${child.id}-${level}`] ? "ChevronDown" : "ChevronRight"}
                      size='14'
                      className="ml-auto text-custom-orange"
                    />
                  </button>
                  {openMenus[`${child.id}-${level}`] && (
                    <div className="ml-4 mt-1 space-y-1">
                      {renderChildren(child.children, level + 1)}
                    </div>
                  )}
                </div>
              );
            } else {
              // Popover para desktop
              return (
                <Popover key={child.id} modal={false}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center w-full px-4 py-2 text-sm rounded-xl hover:bg-custom-white dark:hover:bg-custom-blackLight">
                      <Icon
                        name={child.icon || 'Folder'}
                        className="mr-2 h-4 w-4 text-custom-orange"
                      />
                      {child.name}
                      <Icon
                        name="ChevronRight"
                        size='14'
                        className="ml-auto text-custom-orange"
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    align="start"
                    className="rounded-lg bg-custom-gray-default dark:bg-custom-blackSemi shadow-xl p-2 ml-2"
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    {renderChildren(child.children, level + 1)}
                  </PopoverContent>
                </Popover>
              );
            }
          }

          // Si tiene route_name válido, crear link
          if (child.route_name && routeExists(child.route_name)) {
            return (
              <Link
                key={child.id}
                href={safeRoute(child.route_name)}
                className="flex items-center px-4 py-2 text-sm rounded-xl hover:bg-custom-white dark:hover:bg-custom-blackLight"
              >
                <Icon
                  name={child.icon || 'Link'}
                  className="mr-2 h-4 w-4 text-custom-orange"
                />
                {child.name}
              </Link>
            );
          }

          return null;
        })}
      </div>
    );
  };



  return (
    <TooltipProvider>
      <SidebarContent className="bg-custom-gray-default dark:bg-custom-blackSemi !overflow-y-auto no-scrollbar touch-pan-y">
        {/* Skeleton de carga específico para sidebar */}
        {isLoading && <SidebarSkeleton />}

        {/* Manejo de errores */}
        {error && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex flex-col items-center justify-center py-4 px-2">
                <Icon name="AlertCircle" className="h-4 w-4 text-red-500 mb-2" />
                <span className="text-xs text-red-500 text-center">Error al cargar navegación</span>
                <button
                  onClick={refreshNavigation}
                  className="mt-2 text-xs text-custom-orange hover:underline"
                >
                  Reintentar
                </button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Content 1: Elementos de Usuario */}
        {!isLoading && items.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item, index) => {
                  const hasChildren = hasValidChildren(item);

                  return (
                    <SidebarMenuItem
                      className={'pt-4'}
                      key={`${item.name}-${index}`}
                    >
                      {hasChildren ? (
                        isMobile ? (
                          // Menú desplegable simple para móvil
                          <div>
                            <SidebarMenuButton
                              className="rounded-xl w-full flex items-center justify-between"
                              onClick={() => toggleMobileMenu(item.id)}
                            >
                              <div className="flex items-center">
                                <Icon
                                  name={item.icon || 'Link'}
                                  className={`text-custom-orange h-5 w-5 flex-shrink-0 mr-2`}
                                />
                                <span className={`ml-2 font-medium truncate`}>
                                  {item.name}
                                </span>
                              </div>
                              <Icon
                                name={openMenus[item.id] ? "ChevronDown" : "ChevronRight"}
                                className="ml-auto text-custom-orange"
                              />
                            </SidebarMenuButton>
                            {openMenus[item.id] && (
                              <div className="mt-2 ml-4 space-y-1">
                                {renderChildren(item.children)}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Popover para desktop
                          <PopoverWithTooltip item={item}>
                            <Popover modal={false}>
                              <PopoverTrigger asChild>
                                <SidebarMenuButton
                                  className="rounded-xl w-full flex items-center justify-between"
                                >
                                  <div className="flex items-center">
                                    <Icon
                                      name={item.icon || 'Link'}
                                      className={`text-custom-orange h-5 w-5 flex-shrink-0 mr-2`}
                                    />
                                    <span className={`ml-2 font-medium truncate`}>
                                      {item.name}
                                    </span>
                                  </div>
                                  <Icon
                                    name="ChevronRight"
                                    className="ml-auto text-custom-orange"
                                  />
                                </SidebarMenuButton>
                              </PopoverTrigger>
                              <PopoverContent
                                side="right"
                                align="start"
                                className="rounded-lg bg-custom-gray-default dark:bg-custom-blackSemi shadow-xl p-2"
                                onPointerDownCapture={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                              >
                                {renderChildren(item.children)}
                              </PopoverContent>
                            </Popover>
                          </PopoverWithTooltip>
                        )
                      ) : (item.route_name && routeExists(item.route_name)) ? (
                        <SidebarTooltip
                          content={getTooltipContent(item)}
                          disabled={!shouldShowTooltip(item)}
                        >
                          <SidebarMenuButton asChild className="rounded-xl">
                            <Link href={safeRoute(item.route_name)}>
                              <div className="flex items-center justify-center">
                                <Icon
                                  name={item.icon || 'Link'}
                                  className={`text-custom-orange h-5 w-5 flex-shrink-0 mr-2`}
                                />
                                <span className={`ml-2 font-medium truncate`}>
                                  {item.name}
                                </span>
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarTooltip>
                      ) : (
                        <SidebarTooltip
                          content={getTooltipContent(item)}
                          disabled={!shouldShowTooltip(item)}
                        >
                          <SidebarMenuButton className="rounded-xl cursor-default">
                            <div className="flex items-center justify-center">
                              <Icon
                                name={item.icon || 'Link'}
                                className={`text-custom-orange h-5 w-5 flex-shrink-0 mr-2`}
                              />
                              <span className={`ml-2 font-medium truncate`}>
                                {item.name}
                              </span>
                            </div>
                          </SidebarMenuButton>
                        </SidebarTooltip>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Mensaje cuando no hay elementos válidos para mostrar */}
        {!isLoading && !error && items.length === 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex flex-col items-center justify-center py-4 px-2">
                <Icon name="Lock" className="h-4 w-4 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 text-center">Sin elementos disponibles</span>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>
    </TooltipProvider>
  );
}