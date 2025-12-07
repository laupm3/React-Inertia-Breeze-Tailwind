import { Sidebar as NativeSidebar } from "@/Components/ui/sidebar";
import { SheetTitle } from "@/Components/ui/sheet";
import SidebarHeader from "@/Components/Sidebar/SidebarHeader";
import SidebarContent from "@/Components/Sidebar/SidebarContent";
import SidebarFooter from "@/Components/Sidebar/SidebarFooter";
import SidebarTrigger from "@/Components/Sidebar/SidebarTrigger";
import { useSidebar } from "@/Components/ui/sidebar";

/**
 * Sidebar Component Wrapper that contains Trigger SidebarHeader, SidebarContent, SidebarFooter
 * 
 * @returns {JSX.Element} 
 */
export default function Sidebar() {

  const { open, openMobile, setOpenMobile, isMobile } = useSidebar();

  return (
    <NativeSidebar
      collapsible="icon"
      side={isMobile ? "right" : "left"}
      className={`shadow-2xl dark:shadow-black rounded-2xl ${open ? "w-64" : "w-20"}`}
      open={isMobile ? openMobile : open}
    >
      {/* Título oculto para accesibilidad en móvil */}
      {isMobile && <SheetTitle className="sr-only">Menú de navegación</SheetTitle>}
      
      <SidebarTrigger onClick={() => isMobile ? setOpenMobile(prev => !prev) : null} />

      <SidebarHeader />

      <SidebarContent />

      <SidebarFooter />

    </NativeSidebar>
  );
}
