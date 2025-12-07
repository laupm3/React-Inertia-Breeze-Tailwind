// Componentes del Sidebar
import {
  SidebarHeader as NativeSidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/Components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { useSidebar } from "@/Components/ui/sidebar";

import { router, Link, usePage } from "@inertiajs/react";

import Icon from "@/imports/LucideIcon";

/**
 * SidebarHeader Component - Contiene el menú de equipos y la opción de cambiar de equipo
 * 
 * @returns {JSX.Element}
 */
export default function SidebarHeader() {
  const { auth: { user }, jetstream } = usePage().props;
  const { isMobile } = useSidebar(); // Detecta si el dispositivo es móvil
  const { current_team } = user;

  /**
   * Función para cambiar de equipo
   * 
   * @param {Event} e 
   * @param {Object} team 
   */
  const switchToTeam = (e, team) => {
    e.preventDefault();
    router.put(route("current-team.update"), {
      team_id: team.id,
    });
  };

  return (
    <NativeSidebarHeader className={`bg-custom-gray-default dark:bg-custom-blackSemi shadow-2xl ${isMobile ? "rounded-tl-2xl" : "rounded-tr-2xl"}`}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            {jetstream.hasTeamFeatures && (
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="rounded-xl font-bold truncate"
                >
                  <div
                    className="rounded p-1 flex items-center justify-center"
                    style={{ backgroundColor: current_team.bg_color }}
                  >
                    <Icon
                      name={current_team.icon}
                      color={current_team.icon_color}
                      size={16}
                    />
                  </div>
                  {user.current_team.name}
                  <Icon
                    name={isMobile ? "ChevronDown" : "ChevronRight"}
                    className="ml-auto text-custom-orange"
                  />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
            )}
            <DropdownMenuContent
              side={isMobile ? "" : "left"} className={`${isMobile ? "mt-10" : "ml-4"} w-[--radix-popper-anchor-width] rounded-xl bg-custom-gray-default dark:bg-custom-blackLight`}
            >
              <SidebarGroupLabel>Manage Teams</SidebarGroupLabel>
              {jetstream.canCreateTeams && (
                <DropdownMenuItem>
                  <Link href={route("teams.create")}>Create New Team</Link>
                </DropdownMenuItem>
              )}

              <SidebarGroupLabel>Switch Teams</SidebarGroupLabel>
              {user.all_teams.map((team) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={(e) => switchToTeam(e, team)}
                >
                  <div className="flex items-center">
                    {user.current_team_id === team.id && (
                      <svg
                        className="me-2 h-5 w-5 text-green-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    <div>{team.name}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </NativeSidebarHeader>
  );
}
