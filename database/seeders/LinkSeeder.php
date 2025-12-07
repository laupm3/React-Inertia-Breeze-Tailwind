<?php

namespace Database\Seeders;

use App\Models\Link;
use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LinkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = Permission::all();

        // Creamos los links necesarios para la aplicación
        Link::create([
            'name' => 'Horarios',
            'description' => 'Acceso a mis horarios como empleado',
            'route_name' => 'user.horarios.index',
            'icon' => 'Calendar',
            'weight' => 1,
            'parent_id' => null,
            'permission_id' => $permissions->where('name', 'viewMySchedule')->first()->id,
            'requires_employee' => true
        ]);

        Link::create([
            'name' => 'Eventos',
            'description' => 'Acceso a mis eventos',
            'route_name' => 'user.eventos.index',
            'icon' => 'CalendarRange',
            'weight' => 1,
            'parent_id' => null,
            'permission_id' => $permissions->where('name', 'viewMyEvents')->first()->id,
            'requires_employee' => true
        ]);

        Link::create([
            'name' => 'Fichajes',
            'description' => 'Acceso a mis fichajes registrados',
            'route_name' => 'user.fichajes.index',
            'icon' => 'CalendarClock',
            'weight' => 1,
            'parent_id' => null,
            'permission_id' => $permissions->where('name', 'viewMyClockIn')->first()->id,
            'requires_employee' => true
        ]);

        Link::create([
            'name' => 'Documentos',
            'description' => 'Acceso al explorador de carpetas y archivos como empleado',
            'route_name' => 'user.files.index',
            'icon' => 'File',
            'weight' => 1,
            'parent_id' => null,
            'permission_id' => $permissions->where('name', 'viewEmployeeFiles')->first()->id,
            'requires_employee' => true
        ]);

        Link::create([
            'name' => 'Onboarding',
            'description' => 'Acceso al onboarding de la empresa',
            'route_name' => 'onboarding',
            'icon' => 'Clipboard',
            'weight' => 1,
            'parent_id' => null,
            'permission_id' => null,
            'requires_employee' => true

        ]);

        Link::create([
            'name' => 'Vacaciones',
            'description' => 'Acceso a mis solicitudes de vacaciones',
            'route_name' => 'user.vacaciones.index',
            'icon' => 'Sun',
            'weight' => 1,
            'parent_id' => null,
            'permission_id' => $permissions->where('name', 'viewMyHolidaysRequests')->first()->id,
            'requires_employee' => true
        ]);

        Link::create([
            'name' => 'Permisos',
            'description' => 'Acceso a mis solicitudes de permisos',
            'route_name' => 'user.solicitudes.index',
            'icon' => 'Scroll',
            'weight' => 1,
            'parent_id' => null,
            'permission_id' => $permissions->where('name', 'viewMyWorkPermitRequests')->first()->id,
            'requires_employee' => true
        ]);

        Link::create([
            'name' => 'Organigrama',
            'description' => 'Acceso al organigrama de la empresa',
            'route_name' => 'organization',
            'icon' => 'Network',
            'weight' => 1,
            'parent_id' => null,
            'permission_id' => null
        ]);

        $adminLink = Link::create([
            'name' => 'Administración',
            'description' => 'Acceso a la administración de la aplicación',
            'route_name' => null,
            'icon' => 'UserRoundCog',
            'weight' => 1,
            'parent_id' => null,
            'permission_id' => null
        ]);

        // Links para el administrador
        Link::create([
            'name' => 'Usuarios',
            'description' => 'Acceso al panel administrativo de usuarios',
            'route_name' => 'admin.users.index',
            'icon' => 'UserRoundCog',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewUsersPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Empleados',
            'description' => 'Acceso al panel administrativo de empleados',
            'route_name' => 'admin.empleados.index',
            'icon' => 'UserRoundCog',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions
                ->where('name', 'viewEmployeesPanel')
                ->first()
                ->id
        ]);

        Link::create([
            'name' => 'Roles (Seguridad)',
            'description' => 'Acceso al panel administrativo de roles',
            'route_name' => 'admin.roles.index',
            'icon' => 'ShieldCheck',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions
                ->where('name', 'viewRolesPanel')
                ->first()
                ->id
        ]);

        Link::create([
            'name' => 'Permisos (Seguridad)',
            'description' => 'Acceso al panel administrativo de permisos',
            'route_name' => 'admin.permissions.index',
            'icon' => 'ShieldUser',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewPermissionsPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Nóminas',
            'description' => 'Acceso al panel de gestión de nóminas',
            'route_name' => 'admin.nominas.index',
            'icon' => 'HandCoins',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewPayrollPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Contratos',
            'description' => 'Acceso al panel administrativo de contratos',
            'route_name' => 'admin.contratos.index',
            'icon' => 'Signature',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewContractsPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Centros',
            'description' => 'Acceso al panel administrativo de centros',
            'route_name' => 'admin.centros.index',
            'icon' => 'Building',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewCentersPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Departamentos',
            'description' => 'Acceso al panel administrativo de departamentos',
            'route_name' => 'admin.departamentos.index',
            'icon' => 'Boxes',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewDepartmentsPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Empresas',
            'description' => 'Acceso al panel administrativo de empresas',
            'route_name' => 'admin.empresas.index',
            'icon' => 'Boxes',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewCompaniesPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Asignaciones',
            'description' => 'Acceso al panel administrativo de asignaciones',
            'route_name' => 'admin.asignaciones.index',
            'icon' => 'ClipboardList',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewAssignmentsPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Equipos',
            'description' => 'Acceso al panel administrativo de equipos',
            'route_name' => 'admin.teams.index',
            'icon' => 'Users',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewTeamsPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Plantillas Brevo',
            'description' => 'Acceso al panel administrativo de Brevo - Plantillas',
            'route_name' => 'admin.brevo.plantillas.index',
            'icon' => 'Mail',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewBrevoDashboard')->first()->id
        ]);

        $planificacionLink = Link::create([
            'name' => 'Planificación',
            'description' => 'Acceso al sistema de planificación de horarios y turnos',
            'route_name' => null,
            'icon' => 'Calendar',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => null
        ]);

        Link::create([
            'name' => 'Horarios',
            'description' => 'Acceso al panel de gestión de horarios',
            'route_name' => 'admin.horarios.index',
            'icon' => 'CalendarDays',
            'weight' => 1,
            'parent_id' => $planificacionLink->id,
            'permission_id' => $permissions->where('name', 'viewSchedulePanel')->first()->id
        ]);

        Link::create([
            'name' => 'Turnos',
            'description' => 'Acceso al panel de gestión de turnos',
            'route_name' => 'admin.turnos.index',
            'icon' => 'CalendarCog',
            'weight' => 1,
            'parent_id' => $planificacionLink->id,
            'permission_id' => $permissions->where('name', 'viewShiftsPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Jornadas',
            'description' => 'Acceso al panel de gestión de jornadas',
            'route_name' => 'admin.jornadas.index',
            'icon' => 'CalendarRange',
            'weight' => 1,
            'parent_id' => $planificacionLink->id,
            'permission_id' => $permissions->where('name', 'viewWorkDaysPanel')->first()->id
        ]);

        $solicitudesLink = Link::create([
            'name' => 'Solicitudes',
            'description' => 'Acceso al sistema de gestión de solicitudes',
            'route_name' => null,
            'icon' => 'Scroll',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewWorkPermitsPanel')->first()->id
        ]);

        Link::create([
            'name' => 'Vacaciones',
            'description' => 'Acceso al panel de gestión de solicitudes de vacaciones',
            'route_name' => 'admin.vacaciones.index',
            'icon' => 'Sun',
            'weight' => 1,
            'parent_id' => $solicitudesLink->id,
            'permission_id' => $permissions->where('name', 'viewHolidaysRequestsPanel')->first()->id,
        ]);

        Link::create([
            'name' => 'Permisos',
            'description' => 'Acceso al panel de gestión de solicitudes de permisos',
            'route_name' => 'admin.solicitudes.index',
            'icon' => 'Scroll',
            'weight' => 1,
            'parent_id' => $solicitudesLink->id,
            'permission_id' => $permissions->where('name', 'viewWorkPermitRequestsPanel')->first()->id,
        ]);

        Link::create([
            'name' => 'Panel de administración',
            'description' => 'Permite acceso al panel de administración con métricas en tiempo real de la aplicación',
            'route_name' => 'admin.dashboard',
            'icon' => 'ChartBar',
            'weight' => 1,
            'parent_id' => $adminLink->id,
            'permission_id' => $permissions->where('name', 'viewAdminDashboard')->first()->id
        ]);
    }
}
