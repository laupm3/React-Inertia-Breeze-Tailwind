import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/Components/ui/sidebar";
import { Skeleton } from "@/Components/ui/skeleton";

/**
 * SidebarSkeleton Component - Muestra un skeleton loading específico para el sidebar
 * Simula la estructura real del sidebar con elementos de usuario y admin
 * Se adapta al estado contraído/expandido del sidebar
 * 
 * @returns {JSX.Element}
 */
export default function SidebarSkeleton() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  // Componente skeleton personalizado que se adapta al estado del sidebar
  const CustomMenuSkeleton = () => (
    <div className={`rounded-xl h-8 flex gap-2 px-2 items-center w-full ${isCollapsed ? 'justify-center' : ''}`}>
      {/* Icono skeleton - siempre presente */}
      <Skeleton className="size-4 rounded-md flex-shrink-0 bg-gray-300 dark:bg-gray-600" />
      
      {/* Texto skeleton - solo visible cuando expandido */}
      {!isCollapsed && (
        <Skeleton 
          className="h-4 flex-1 rounded-md bg-gray-300 dark:bg-gray-600" 
          style={{ 
            width: `${Math.floor(Math.random() * 40) + 50}%`,
            maxWidth: '70%'
          }}
        />
      )}
    </div>
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Simular 6-8 elementos uniformes */}
          {Array.from({ length: 7 }).map((_, index) => (
            <SidebarMenuItem key={`skeleton-${index}`} className="pt-4">
              <CustomMenuSkeleton />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
