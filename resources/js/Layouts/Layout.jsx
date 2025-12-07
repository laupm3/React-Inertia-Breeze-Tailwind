import { SidebarProvider, SidebarTrigger } from "../Components/ui/sidebar"
import { AppSidebar } from "../Components/Sidebar"

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-100">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
