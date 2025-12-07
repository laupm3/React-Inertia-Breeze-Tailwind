<?php

namespace App\Providers;

use App\Events\User\UserBanned;
use App\Events\User\UserCreated;
use App\Events\User\UserDeleted;

// Eventos relacionados con carpetas
use App\Events\User\UserUpdated;
use App\Events\User\UserSuspended;
use App\Listeners\User\LogUserBan;
use App\Events\User\UserReactivated;

// Listeners de carpetas
use App\Events\Fichaje\FichajePausar;
use App\Listeners\User\LogUserUpdate;
use App\Events\Fichaje\FichajeIniciar;
use Illuminate\Auth\Events\Registered;

// Eventos relacionados con archivos
use App\Events\Fichaje\FichajeReanudar;
use App\Events\Storage\Files\FileMoved;
use App\Listeners\User\ForceUserLogout;
use App\Listeners\User\LogUserCreation;

// Listeners de archivos
use App\Listeners\User\LogUserDeletion;
use App\Listeners\User\NotifyUserOfBan;
use App\Events\Contrato\ContratoVencido;
use App\Events\Empleado\EmployeeCreated;
use App\Events\Empleado\EmployeeDeleted;
use App\Events\Empleado\EmployeeUpdated;
use App\Events\Fichaje\FichajeFinalizar;
use App\Events\Horario\RetrasoDetectado;
use App\Events\Storage\Files\FileDeleted;
use App\Listeners\User\LogUserAssignment;

// Eventos relacionados con fichajes
use App\Listeners\User\LogUserSuspension;
use App\Events\Storage\Files\FileRestored;
use App\Events\Storage\Files\FileUploaded;
use App\Events\Storage\Folder\FolderMoved;

// Listeners de fichajes (panel administración)
use App\Events\User\UserAssignedToEmployee;

use App\Listeners\User\LogUserReactivation;
use App\Events\Storage\Folder\FolderCreated;
use App\Events\Storage\Folder\FolderDeleted;

use App\Events\Storage\Folder\FolderRestored;
use App\Listeners\Empleado\LogEmployeeUpdate;
use App\Events\Empleado\EmployeeStatusChanged;
use App\Events\Horario\AusenciaMayorDetectada;
use App\Listeners\User\NotifyUserOfSuspension;
use App\Events\Contrato\ContratoProximoAVencer;
use App\Listeners\Empleado\LogEmployeeCreation;

use App\Listeners\Empleado\LogEmployeeDeletion;
use App\Listeners\User\SendWelcomeNotification;
use App\Listeners\Storage\File\MovePhysicalFile;

use App\Listeners\User\NotifyAdminsOfUserUpdate;
use App\Listeners\User\NotifyUserOfReactivation;
use App\Listeners\Horario\NotificarAusenciaMayor;

use App\Listeners\Storage\File\DeletePhysicalFile;
use App\Listeners\User\NotifyAdminsOfUserDeletion;
use App\Listeners\Empleado\LogEmployeeStatusChange;

use App\Listeners\Storage\File\ProcessUploadedFile;
use App\Listeners\Storage\File\RestorePhysicalFile;

use App\Listeners\Contrato\DesactivarAccesoEmpleado;
use App\Listeners\Contrato\NotificarContratoVencido;
use App\Events\Contrato\EmpleadoSinContratosVigentes;

use App\Events\Storage\Files\Nominas\NominaFileCreated;
use App\Events\Storage\Files\Nominas\NominaFileDeleted;
use App\Events\Storage\Files\Nominas\NominaFileUpdated;

use App\Listeners\Storage\Folder\MovePhysicalDirectory;
use App\Listeners\Empleado\NotifyOfEmployeeStatusChange;
use App\Listeners\Horario\NotificarRetrasoSignificativo;
use App\Listeners\Storage\Folder\CreatePhysicalDirectory;
use App\Listeners\Storage\Folder\DeletePhysicalDirectory;
use App\Listeners\Storage\Folder\RestorePhysicalDirectory;
use App\Listeners\Contrato\NotificarContratoProximoAVencer;
use App\Listeners\Storage\File\Nominas\NotificarNominaCreada;
use App\Listeners\Storage\File\Nominas\NotificarNominaEliminada;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use App\Listeners\Storage\File\Nominas\NotificarNominaActualizada;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        // Eventos de carpetas
        FolderCreated::class => [
            CreatePhysicalDirectory::class,
        ],
        FolderDeleted::class => [
            DeletePhysicalDirectory::class,
        ],
        FolderMoved::class => [
            MovePhysicalDirectory::class,
        ],
        FolderRestored::class => [
            RestorePhysicalDirectory::class,
        ],

        // Eventos de archivos
        FileUploaded::class => [
            ProcessUploadedFile::class,
        ],
        FileDeleted::class => [
            DeletePhysicalFile::class,
        ],
        FileMoved::class => [
            MovePhysicalFile::class,
        ],
        FileRestored::class => [
            RestorePhysicalFile::class,
        ],
        NominaFileCreated::class => [
            NotificarNominaCreada::class,
        ],
        NominaFileUpdated::class => [
            NotificarNominaActualizada::class,
        ],
        NominaFileDeleted::class => [
            NotificarNominaEliminada::class,
        ],

        UserBanned::class => [
            ForceUserLogout::class,         // Acción inmediata
            NotifyUserOfBan::class,         // En cola
            LogUserBan::class,              // En cola
        ],

        UserSuspended::class => [
            ForceUserLogout::class,         // Acción inmediata.
            NotifyUserOfSuspension::class,  // En cola
            LogUserSuspension::class,       // En cola
        ],

        UserReactivated::class => [
            NotifyUserOfReactivation::class, // En cola
            LogUserReactivation::class,     // En cola
        ],

        // CRUD de usuarios
        UserCreated::class => [
            LogUserCreation::class,         // 1. Registra en el log de auditoría
            //SendWelcomeNotification::class, // 2. Envía notificaciones (bienvenida, admins)
        ],

        UserUpdated::class => [
            LogUserUpdate::class,
            NotifyAdminsOfUserUpdate::class,
        ],

        UserDeleted::class => [
            LogUserDeletion::class,
            NotifyAdminsOfUserDeletion::class,
        ],

        UserAssignedToEmployee::class => [
            LogUserAssignment::class,
        ],
        // Eventos de horario
        RetrasoDetectado::class => [
            NotificarRetrasoSignificativo::class,
        ],
        AusenciaMayorDetectada::class => [
            NotificarAusenciaMayor::class,
        ],
        EmployeeCreated::class => [
            LogEmployeeCreation::class,
        ],
        EmployeeUpdated::class => [
            LogEmployeeUpdate::class,
        ],
        EmployeeDeleted::class => [
            LogEmployeeDeletion::class,
        ],

        EmployeeStatusChanged::class => [
            LogEmployeeStatusChange::class,
            NotifyOfEmployeeStatusChange::class,
        ],

        // Eventos de Contrato
        ContratoVencido::class => [
            NotificarContratoVencido::class,
        ],
        ContratoProximoAVencer::class => [
            NotificarContratoProximoAVencer::class,
        ],
        EmpleadoSinContratosVigentes::class => [
            DesactivarAccesoEmpleado::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        parent::boot();
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
