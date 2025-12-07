import { useSidebar } from "@/Components/ui/sidebar";
import Icon from "@/imports/LucideIcon";

/**
 * Trigger Sidebar Component - Open and Close Sidebar
 * 
 * @returns {JSX.Element} 
 */
export default function SidebarTrigger() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className={`hidden md:block absolute top-1 ${open ? 'ml-64' : 'ml-14'} bg-gray-400 hover:bg-gray-500 p-1 rounded-full`}
    >
      {open ? (
        <Icon name={'ChevronLeft'} className="h-5 w-5 text-gray-200" />
      ) : (
        <Icon name={'ChevronRight'} className="h-5 w-5 text-gray-200" />
      )}
    </button>
  );
}
