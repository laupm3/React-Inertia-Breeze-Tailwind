<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redirect;
use App\Http\Controllers\SharedController;
use App\Http\Controllers\SendEmailController;
use App\Http\Controllers\User\EventoController;
use App\Http\Controllers\Admin\CentroController;
use App\Http\Controllers\Admin\VacacionesController as AdminVacacionesController;
use App\Http\Controllers\User\VacacionesController;
use App\Http\Controllers\API\v1\Admin\TeamController;
use App\Http\Controllers\API\v1\Admin\TeamMemberController;
use App\Http\Controllers\API\v1\Brevo\BrevoTemplateController;
use App\Http\Controllers\User\SolicitudPermisoController as UserSolicitudPermisoController;
use App\Http\Controllers\Export\BaseExportController;
use App\Http\Controllers\Export\DynamicExportController;
use App\Http\Controllers\API\v1\Admin\DashboardController;
use App\Http\Controllers\Admin\AbsenceNoteController as AdminAbsenceNoteController;
use App\Http\Controllers\API\v1\Admin\AbsenceNoteController as ApiAbsenceNoteController;

// Base route redirect to login
Route::redirect('/', '/login');

// Rutas para políticas y términos
Route::controller(SharedController::class)->group(function () {
    Route::get('/privacy-policy', 'privacyPolicy')->name('privacy.policy');
    Route::get('/cookies-policy', 'cookiesPolicy')->name('cookies.policy');
    Route::get('/terms-of-service', 'termsOfService')->name('terms.service');
});

// Redirect to dashboard if route not found
Route::fallback(fn() => Redirect::to('/dashboard'));

// Rutas para el sistema de autenticación - No requiere autenticación dado que es una forma de autenticación
Route::controller(App\Http\Controllers\LoginController::class)
    ->name('login')
    ->group(function () {
        Route::get('/login', 'index');
        Route::get('/login/default', 'default')->name('.default');
    });

// Rutas para autenticación con Google - No requiere autenticación dado que es una forma de autenticación
Route::controller(App\Http\Controllers\AuthGoogleController::class)
    ->name('auth.google')
    ->group(function () {
        Route::get('auth/google', 'redirectToGoogle');
        Route::get('auth/google/callback', 'handleGoogleCallback')->name('.callback');
    });

// Rutas que requieren autenticación y verificación - Solo accesible por usuarios autenticados
Route::middleware(['auth:sanctum', 'check.banned', config('jetstream.auth_session')])->group(function () {

    // Rutas para la API de la aplicación
    Route::prefix('api/v1')
        ->name('api.v1.')
        ->group(function () {
            // Rutas Nivel administrador - Accesible para especificos roles
            Route::prefix('admin')
                ->name('admin.')
                ->group(function () {
                    Route::prefix('dashboard')
                        ->name('dashboard.')
                        ->controller(DashboardController::class)
                        ->group(function () {
                            Route::get('/employee-statuses', 'employeeStatuses')->name('employee-statuses');
                            Route::get('/active-users-count', 'activeUsersCount')->name('active-users-count');
                            Route::get('/justification-stats', 'justificationStats')->name('justification-stats');
                            Route::get('/clocking-stats', 'clockingStats')->name('clocking-stats');
                            Route::get('/pending-vacation-stats', 'pendingVacationStats')->name('pending-vacation-stats');
                            Route::get('/pending-permission-stats', 'pendingPermissionStats')->name('pending-permission-stats');
                            Route::get('/employees-by-department-stats', 'employeesByDepartmentStats')->name('employees-by-department-stats');
                            Route::get('/expiring-contracts-stats', 'expiringContractsStats')->name('expiring-contracts-stats');
                            Route::get('/expiring-documents-stats', 'expiringDocumentsStats')->name('expiring-documents-stats');
                            Route::get('/new-employees-stats', 'newEmployeesStats')->name('new-employees-stats');
                            Route::get('/absence-types', 'absenceTypes')->name('absence-types');
                            Route::get('/employees/{empleado}/not-working-reason', 'getNotWorkingReason')->name('employees.not-working-reason');
                        });
                    Route::resource('absence-notes', ApiAbsenceNoteController::class)
                        ->parameters(['absence-notes' => 'absenceNote']);
                    Route::resource('asignaciones', App\Http\Controllers\API\v1\Admin\AsignacionController::class)
                        ->except(['create', 'edit'])
                        ->parameters(['asignaciones' => 'asignacion']);
                    Route::resource('teams', TeamController::class)
                        ->except(['create', 'edit']);
                    Route::resource('centros', App\Http\Controllers\API\v1\Admin\CentroController::class)
                        ->except(['create', 'edit']);
                    Route::get('status/centros', [App\Http\Controllers\API\v1\Admin\CentroController::class, 'status'])
                        ->name('centros.status');
                    Route::resource('contratos', App\Http\Controllers\API\v1\Admin\ContratoController::class)
                        ->except(['create', 'edit']);
                    Route::get('types/contratos', [App\Http\Controllers\API\v1\Admin\ContratoController::class, 'types'])
                        ->name('contratos.types');
                    Route::resource('departamentos', App\Http\Controllers\API\v1\Admin\DepartamentoController::class)
                        ->except(['create', 'edit']);
                    Route::get('empleados/{empleado}/permiso-usage-stats/{permiso}', [App\Http\Controllers\API\v1\Admin\EmpleadoController::class, 'getPermisoUsageStats'])
                        ->name('empleados.permiso-usage-stats');
                    Route::resource('empleados', App\Http\Controllers\API\v1\Admin\EmpleadoController::class)
                        ->except(['create', 'edit']);
                    Route::get('empleados/type/{typeId}', [App\Http\Controllers\API\v1\Admin\EmpleadoController::class, 'searchByType'])
                        ->name('empleados.searchByType');
                    Route::get('types/empleados', [App\Http\Controllers\API\v1\Admin\EmpleadoController::class, 'types'])
                        ->name('empleados.types');
                    Route::get('statuses/empleados', [App\Http\Controllers\API\v1\Admin\EmpleadoController::class, 'statuses'])
                        ->name('empleados.status');
                    Route::get('genders/empleados', [App\Http\Controllers\API\v1\Admin\EmpleadoController::class, 'genders'])
                        ->name('empleados.genders');
                    Route::get('type-documents/empleados', [App\Http\Controllers\API\v1\Admin\EmpleadoController::class, 'typeDocuments'])
                        ->name('empleados.type-documents');
                    Route::get('empleados/{empleado}/contratos', [App\Http\Controllers\API\v1\Admin\EmpleadoController::class, 'contratos'])
                        ->name('empleados.contratos');
                    Route::post('empleados/available-contracts', [App\Http\Controllers\API\v1\Admin\EmpleadoController::class, 'getAvailableContracts'])
                        ->name('empleados.available-contracts');
                    Route::prefix('contratos/{contrato}')->group(function () {
                        Route::get('anexos/{anexo}', [App\Http\Controllers\API\v1\Admin\ContratoController::class, 'viewAnnexes'])->name('contratos.anexos.show');
                        Route::post('anexos', [App\Http\Controllers\API\v1\Admin\ContratoController::class, 'createAnnexes'])->name('contratos.anexos.store');
                        Route::put('anexos/{anexo}', [App\Http\Controllers\API\v1\Admin\ContratoController::class, 'editAnnexes'])->name('contratos.anexos.update');
                        Route::delete('anexos/{anexo}', [App\Http\Controllers\API\v1\Admin\ContratoController::class, 'deleteAnnexes'])->name('contratos.anexos.destroy');
                    });
                    Route::resource('empresas', App\Http\Controllers\API\v1\Admin\EmpresaController::class)
                        ->except(['create', 'edit']);
                    // Rutas específicas para operaciones masivas de horarios - DEBEN IR ANTES del resource
                    Route::post('horarios/bulk-show', [App\Http\Controllers\API\v1\Admin\HorarioController::class, 'bulkShow'])
                        ->name('horarios.bulk-show');
                    Route::post('horarios/bulk-store', [App\Http\Controllers\API\v1\Admin\HorarioController::class, 'bulkStore'])
                        ->name('horarios.bulk-store');
                    Route::put('horarios/bulk-update', [App\Http\Controllers\API\v1\Admin\HorarioController::class, 'bulkUpdate'])
                        ->name('horarios.bulk-update');
                    Route::delete('horarios/bulk-destroy', [App\Http\Controllers\API\v1\Admin\HorarioController::class, 'bulkDestroy'])
                        ->name('horarios.bulk-destroy');
                    Route::resource('horarios', App\Http\Controllers\API\v1\Admin\HorarioController::class)
                        ->except(['create', 'edit']);
                    Route::resource('jornadas', App\Http\Controllers\API\v1\Admin\JornadaController::class)
                        ->except(['create', 'edit']);
                    Route::resource('modules', App\Http\Controllers\API\v1\Admin\ModuleController::class)
                        ->except(['create', 'edit']);
                    Route::resource('permissions', App\Http\Controllers\API\v1\Admin\PermissionController::class)
                        ->except(['create', 'edit']);
                    Route::resource('roles', App\Http\Controllers\API\v1\Admin\RoleController::class)
                        ->except(['create', 'edit']);
                    Route::put('roles/{role}/permission/{permission}/switch', [App\Http\Controllers\API\v1\Admin\RoleController::class, 'switchPermission'])
                        ->name('roles.permission.switch');
                    Route::resource('turnos', App\Http\Controllers\API\v1\Admin\TurnoController::class)
                        ->except(['create', 'edit']);
                    Route::resource('users', App\Http\Controllers\API\v1\Admin\UserController::class)
                        ->except(['create', 'edit']);
                    Route::get('users/relationship/without-employee', [App\Http\Controllers\API\v1\Admin\UserController::class, 'withoutEmployee'])
                        ->name('users.relationship.withoutEmployee');
                    /* Route::get('users/{user}/status', [App\Http\Controllers\API\v1\Admin\UserController::class, 'status'])
                        ->name('users.status');
                    Route::get('users/statuses', [App\Http\Controllers\API\v1\Admin\UserController::class, 'statuses'])
                        ->name('users.statuses'); */
                    Route::get('/user/available-statuses', [App\Http\Controllers\API\v1\Admin\UserController::class, 'getAvailableStatuses'])
                        ->name('users.available-statuses');
                    Route::put('users/{user}/permission/{permission}/switch', [App\Http\Controllers\API\v1\Admin\UserController::class, 'switchPermission'])
                        ->name('users.permission.switch');
                    Route::put('users/{user}/role/{role}/switch', [App\Http\Controllers\API\v1\Admin\UserController::class, 'switchRole'])
                        ->name('users.role.switch');
                    Route::delete('users/{user}/profile-photo', [App\Http\Controllers\API\v1\Admin\UserController::class, 'deleteProfilePhoto'])
                        ->name('users.profile-photo.destroy');
                    Route::resource('modalidades', App\Http\Controllers\API\v1\Admin\ModalidadController::class)
                        ->except(['create', 'edit']);
                    Route::controller(App\Http\Controllers\API\v1\Admin\NotificationController::class)
                        ->prefix('notifications')
                        ->name('notifications.')
                        ->group(function () {
                            Route::get('/', 'index')->name('index');
                            Route::put('{notification}/read', 'markAsRead')->name('markAsRead');
                            Route::put('{notification}/unread', 'markAsUnread')->name('markAsUnread');
                            Route::put('mark-all-read', 'markAllAsRead')->name('markAllAsRead');
                            Route::get('unread-count', 'getUnreadCount')->name('unreadCount');
                            Route::get('types', 'getNotificationTypes')->name('types');
                            Route::get('actions', 'getActionTypes')->name('actions');
                            Route::get('senders', 'getSenders')->name('senders');
                        });
                    // DELETE /api/v1/admin/solicitudes/123/folder/deff-def2-dsds-2445-dsds
                    Route::delete('solicitudes/{solicitud}/folder/{folder:hash}', [\App\Http\Controllers\API\v1\Admin\SolicitudPermisoController::class, 'destroyFolder'])
                        ->name('solicitudes.destroyFolder');

                    // Rutas de aprobación
                    Route::post('solicitudes/{solicitud}/process-approval', [\App\Http\Controllers\API\v1\Admin\SolicitudPermisoController::class, 'processApproval'])
                        ->name('solicitudes.processApproval');

                    Route::resource('solicitudes', \App\Http\Controllers\API\v1\Admin\SolicitudPermisoController::class)
                        ->except(['create', 'edit'])
                        ->parameters(['solicitudes' => 'solicitud']);

                    Route::resource('vacaciones', \App\Http\Controllers\API\v1\Admin\VacacionesController::class)
                        ->except(['create', 'edit'])
                        ->parameters(['vacaciones' => 'solicitud']);

                    Route::resource('permisos', \App\Http\Controllers\API\v1\Admin\PermisoController::class)
                        ->except(['create', 'edit']);

                    Route::resource('navigation', App\Http\Controllers\API\v1\Admin\NavigationController::class)
                        ->parameters(['navigation' => 'link'])
                        ->except(['create', 'edit']);

                    Route::resource('nominas', App\Http\Controllers\API\v1\Admin\NominaController::class)
                        ->except(['create', 'edit']);
                });

            Route::name('teams.')
                ->group(function () {
                    Route::get('/teams/create', [TeamController::class, 'create'])->name('create');
                    Route::post('/teams', [TeamController::class, 'store'])->name('store');
                    Route::get('/teams/{team}', [TeamController::class, 'show'])->name('show');
                    Route::put('/teams/{team}', [TeamController::class, 'update'])->name('update');
                    Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('destroy');
                    Route::post('/teams/{team}/members', [TeamMemberController::class, 'store'])->name('members.store');
                    Route::put('/teams/{team}/members/{user}', [TeamMemberController::class, 'update'])->name('members.update');
                    Route::delete('/teams/{team}/members/{user}', [TeamMemberController::class, 'destroy'])->name('members.destroy');
                });

            // Rutas Nivel compartido - Accesible para todos los usuarios autenticados (sin restricciones específicas de rol)
            Route::prefix('shared')
                ->name('shared.')
                ->group(function () {
                    Route::resource('users', App\Http\Controllers\API\v1\Shared\UserController::class)
                        ->except(['create', 'edit']);
                });

            Route::prefix('user')
                ->name('user.')
                ->group(function () {
                    // DELETE /api/v1/user/solicitudes/123/folder/deff-def2-dsds-2445-dsds
                    Route::delete('solicitudes/{solicitud}/folder/{folder:hash}', [\App\Http\Controllers\API\v1\User\SolicitudPermisoController::class, 'destroyFolder'])
                        ->name('solicitudes.destroyFolder');
                    Route::post('solicitudes/{solicitud}/toggle-cancellation-request', [\App\Http\Controllers\API\v1\User\SolicitudPermisoController::class, 'toggleCancellationRequest'])
                        ->name('solicitudes.toggleCancellationRequest');
                    Route::resource('solicitudes', \App\Http\Controllers\API\v1\User\SolicitudPermisoController::class)
                        ->except(['create', 'edit'])
                        ->parameters(['solicitudes' => 'solicitud']);
                    Route::resource('vacaciones', \App\Http\Controllers\API\v1\User\VacacionesController::class)
                        ->except(['create', 'edit'])
                        ->parameters(['vacaciones' => 'solicitud']);
                    Route::resource('horarios', App\Http\Controllers\API\v1\User\HorarioController::class)
                        ->except(['create', 'edit']);
                    Route::resource('fichajes', App\Http\Controllers\API\v1\User\FichajeController::class)
                        ->except(['create', 'edit']);

                    Route::resource('navigation', App\Http\Controllers\API\v1\User\NavigationController::class)
                        ->parameters(['navigation' => 'link'])
                        ->except(['create', 'edit']);

                    // Ruta unificada para obtener permisos de entidad (mapeo + verificación)
                    Route::get('/has/access-migrate/{entity}', [App\Http\Controllers\User\MigrationController::class, 'hasAccessMigrate'])
                        ->name('user.permissions.entity');
                });

            // Rutas para el nuevo servicio de descarga de archivos
            Route::prefix('files')
                ->name('files.')
                ->controller(\App\Http\Controllers\API\v1\Storage\DownloadController::class)
                ->group(function () {
                    Route::get('/{folder:hash}/download', 'download')->name('download');
                    Route::get('/{folder:hash}/url', 'generateDownloadUrl')->name('download.url');
                    Route::get('/{folder:hash}/signed', 'downloadSigned')
                        ->name('download.signed')
                        ->middleware('signed');
                });

            // Rutas para el nuevo servicio de descarga de archivos
            Route::prefix('files')
                ->name('files.')
                ->controller(\App\Http\Controllers\API\v1\Storage\DownloadController::class)
                ->group(function () {
                    Route::get('/{file:hash}/download', 'download')->name('download');
                    Route::get('/{file:hash}/url', 'generateDownloadUrl')->name('download.url');
                    Route::get('/{file:hash}/signed', 'downloadSigned')
                        ->name('download.signed')
                        ->middleware('signed');
                });

            Route::get('brevo/templates', [BrevoTemplateController::class, 'index'])->name('brevo.templates.index');
        });

    // Rutas de Import/Export - Con middleware web para compatibilidad con permisos en guard 'web'
    Route::middleware(['web', 'auth', 'check.banned', config('jetstream.auth_session')])
        ->prefix('api/v1/admin')
        ->name('api.v1.admin.')
        ->group(function () {
            // Rutas para importación de datos (datatables)
            Route::prefix('import')
                ->name('import.')
                ->controller(App\Http\Controllers\Import\DynamicImportController::class)
                ->group(function () {
                    Route::get('/{entity}/schema', 'getSchema')->name('schema');
                    Route::get('/{entity}/template', 'downloadTemplate')->name('template');
                    Route::post('/{entity}', 'import')->name('process');
                    Route::post('/{entity}/json', 'importFromJson')->name('json');
                    Route::get('/formats', 'getSupportedFormats')->name('formats');
                    Route::get('/catalogos', 'catalogos')->name('catalogos');
                });

            // Rutas genéricas para exportación de datos (datatables)
            Route::prefix('export')
                ->name('export.')
                ->controller(\App\Http\Controllers\Export\DynamicExportController::class)
                ->group(function () {
                    Route::get('{entity}', 'index')->name('index');
                    Route::post('{entity}/{format}', 'export')->where('format', 'xlsx|csv')->name('export');
                    Route::get('{entity}/download/{filename}', 'download')->name('download');
                    Route::get('{entity}/status', 'checkStatus')->name('status');
                    Route::get('{entity}/recent-files', 'getRecentFiles')->name('recent-files');
                    Route::get('{entity}/test-auth', 'testAuth')->name('test-auth');
                });
        });

    // Rutas que retornan vistas de Inertia - Nivel Administrador: Accesible para especificos roles
    Route::prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])
                ->name('dashboard');
            Route::get('absence-notes', [AdminAbsenceNoteController::class, 'index'])->name('absence-notes.index');
            Route::resource('asignaciones', App\Http\Controllers\Admin\AsignacionController::class)
                ->except(['create', 'edit']);
            Route::resource('languages', App\Http\Controllers\Admin\LanguageController::class);
            Route::resource('provincias', App\Http\Controllers\ProvinciaController::class);
            Route::resource('users', App\Http\Controllers\Admin\UserController::class)
                ->except(['create', 'edit']);
            Route::resource('empleados', App\Http\Controllers\Admin\EmpleadoController::class)
                ->except(['create', 'edit']);


            Route::resource('departamentos', App\Http\Controllers\Admin\DepartamentoController::class)
                ->except(['create', 'edit']);
            Route::resource('centros', CentroController::class)
                ->except(['create', 'edit']);
            Route::resource('empresas', App\Http\Controllers\Admin\EmpresaController::class)
                ->except(['create', 'edit']);
            Route::resource('documentation', App\Http\Controllers\FileController::class);
            Route::resource('contratos', App\Http\Controllers\Admin\ContratoController::class)
                ->except(['create', 'edit']);
            Route::resource('permissions', App\Http\Controllers\Admin\PermissionController::class)
                ->except(['create', 'edit']);
            Route::resource('roles', App\Http\Controllers\Admin\RoleController::class)
                ->except(['create', 'edit']);
            Route::resource('horarios', App\Http\Controllers\Admin\HorarioController::class);
            Route::get('nominas/history', [App\Http\Controllers\Admin\NominaController::class, 'history'])
                ->name('nominas.history');
            Route::resource('nominas', App\Http\Controllers\Admin\NominaController::class);
            Route::post('nominas/upload/multiple', [App\Http\Controllers\Admin\SubidaNominasController::class, 'store'])
                ->withoutMiddleware(['auth:sanctum', \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
                ->name('nominas.upload.multiple');
            Route::resource('turnos', App\Http\Controllers\Admin\TurnoController::class)
                ->except(['create', 'edit']);
            Route::resource('teams', App\Http\Controllers\Admin\TeamController::class)
                ->except(['create', 'edit']);
            Route::resource('jornadas', App\Http\Controllers\Admin\JornadaController::class)
                ->except(['create', 'edit']);
            Route::post('files/upload', [App\Http\Controllers\Admin\FicheroController::class, 'storeFiles'])
                ->name('files.upload');

            Route::patch('files/update/{id}', [App\Http\Controllers\Admin\FicheroController::class, 'update'])
                ->name('files.update');

            Route::delete('files/delete/{id}', [App\Http\Controllers\Admin\FicheroController::class, 'destroy'])
                ->name('files.delete');

            Route::post('files/folder', [App\Http\Controllers\Admin\FicheroController::class, 'storeFolder'])
                ->name('files.folder.store');
            Route::resource('solicitudes', \App\Http\Controllers\Admin\SolicitudPermisoController::class)
                ->except(['create', 'edit'])
                ->parameters(['solicitudes' => 'solicitud']);
            Route::resource('vacaciones', AdminVacacionesController::class)
                ->except(['create', 'edit', 'store', 'show', 'update', 'destroy'])
                ->parameters(['vacaciones' => 'vacacion']);

            Route::get('brevo/templates', [App\Http\Controllers\Admin\PlantillasBrevoController::class, 'index'])
                ->name('brevo.plantillas.index');

            // Agregar estas nuevas rutas para baneos programados
            Route::controller(\App\Http\Controllers\Admin\ScheduledBanController::class)
                ->prefix('scheduled-bans')
                ->name('scheduled-bans.')
                ->group(function () {
                    Route::get('/', 'index')->name('index');
                    Route::post('/', 'store')->name('store');
                    Route::delete('/{user}', 'destroy')->name('destroy');
                });

            Route::resource('navigation', App\Http\Controllers\Admin\NavigationController::class)
                ->parameters(['navigation' => 'link'])
                ->except(['create', 'edit']);
        });

    // Rutas que retornan vistas de Inertia - Nivel Usuario
    Route::prefix('user')
        ->name('user.')
        ->group(function () {
            Route::middleware(['throttle:refresh-limit'])
                ->controller(\App\Http\Controllers\User\FileExplorerController::class)
                ->group(function () {
                    Route::get('/folders/home', 'index')->name('files.index');
                    Route::get('/folders/{hash}', 'navigate')->name('files.navigate');
                });
            Route::resource('solicitudes', UserSolicitudPermisoController::class)
                ->except(['create', 'edit'])
                ->parameters(['solicitudes' => 'solicitud']);
            Route::resource('horarios', App\Http\Controllers\User\HorarioController::class);

            Route::resource('vacaciones', VacacionesController::class)
                ->except(['create', 'edit']);
            Route::resource('fichajes', App\Http\Controllers\User\FichajeController::class);

            // Grupo de rutas para el nuevo sistema de fichaje
            Route::prefix('fichaje')
                ->name('fichaje.')
                ->controller(App\Http\Controllers\FichajeController::class)
                ->group(function () {
                    // Rutas que requieren verificación de horario
                    Route::middleware(\App\Http\Middleware\VerifyFichajeAccess::class)->group(function () {
                        // Aquí irán las rutas protegidas cuando las necesitemos
                        Route::post('/accion', 'accion')->name('accion.fichaje');
                    });

                    // Ruta para obtener el estado del fichaje que no requiere verificación
                    Route::get('/estado', 'estado')->name('estado');
                });

            /**
             * Rutas para el controlador de eventos
             *
             * @see App\Http\Controllers\User\EventoController
             * @author Samuel Zabala
             */
            Route::controller(EventoController::class)->group(function () {
                Route::get('/eventos', 'index')->name('eventos.index');
                Route::post('/eventos', 'store')->name('eventos.store');
                Route::get('/eventos/{evento}', 'show')->name('eventos.show');
                Route::put('/eventos/{evento}', 'update')->name('eventos.update');
                Route::delete('/eventos/{evento}', 'destroy')->name('eventos.destroy');
                Route::delete('/eventos/{evento}/participants/{userId}', 'removeParticipant')
                    ->name('eventos.participants.remove');
            });
        });

    // Rutas funcionalidad archivos - Generación de URL firmadas para archivos privados
    Route::prefix('files')
        ->name('files.')
        ->controller(App\Http\Controllers\FileController::class)
        ->group(function () {
            Route::get('/{nombre}/download', 'download')->name('download');
            Route::get('/{hash}/signed-route/generate', 'generateSignedRoute')->name('generateSignedRoute');

            Route::get('/preview-pdf/{hash}', 'previewPdf')
                ->name('previewPdf')
                ->middleware('signed');

            Route::get('/generate-pdf-preview/{hash}', 'generatePdfPreviewRoute')
                ->name('generatePdfPreviewRoute');

            Route::get('/password/status', [App\Http\Controllers\PasswordConfirmationFilesController::class, 'status'])
                ->name('password.status');

            Route::post('/password/confirm', [App\Http\Controllers\PasswordConfirmationFilesController::class, 'confirm'])
                ->name('password.confirm');
        });

    // Rutas para autenticación con redes sociales
    Route::controller(App\Http\Controllers\SocialiteController::class)
        ->name('auth.provider')
        ->group(function () {
            Route::get('auth/redirection/{provider}', 'redirectToProvider');
            Route::get('auth/{provider}/callback', 'handleProviderCallback')->name('.callback');
        });
});

// Rutas Legacy - Pendientes de migración
Route::middleware(['auth:sanctum', 'check.banned', config('jetstream.auth_session')])->group(function () {
    Route::get('/history-vacations', fn() => Inertia::render('Shared/HistoryVacations'))->name('history-vacations');
    Route::get('/history-leaves', fn() => Inertia::render('Shared/HistoryLeaves'))->name('history-leaves');
    Route::get('/login-tablet', fn() => Inertia::render('LoginTablet'))->name('login-tablet');
    Route::get('/clock-in', fn() => Inertia::render('ClockIn'))->name('clock-in');
    Route::get('/clock-in-admin', fn() => Inertia::render('ClockInAdmin'))->name('clock-in-admin');
    Route::get('/upload-payroll', fn() => Inertia::render('UploadPayroll'))->name('upload-payroll');
    Route::get('/documentation', fn() => Inertia::render('Folders/FoldersComponent'))->name('folders');
    Route::get('/notification-editor', fn() => Inertia::render('Notifications/NotificationEditor'))->name('notification-editor');
    Route::get('/notifications', fn() =>  Inertia::render('Notifications/AllNotificationsTable'))->name('notifications');
    Route::get('/leaves', fn() =>  Inertia::render('Shared/Leaves'))->name('leaves');

    Route::get('/controlFichajes', fn() =>  Inertia::render('Admin/ControlFichajes/Index'))->name('controlFichajes');

    Route::controller(App\Http\Controllers\SharedController::class)
        ->group(function () {
            Route::get('/dashboard', 'dashboard')->name('dashboard');
            Route::get('/ruta-calendar', 'calendar')->name('ruta-calendar');
            Route::get('/ruta-document', 'document')->name('ruta-document');
            Route::get('/vacations', 'vacations')->name('vacations');
            Route::get('/organization', 'organization')->name('organization');
            Route::get('/onboarding', 'onboarding')->name('onboarding');
        });

    //  Sincronizar plantillas Brevo y enviar correos
    Route::get('/sync-templates', [SendEmailController::class, 'syncTemplates'])->name('syncTemplates');
});

/**
 * rutas para los obtener el listado de usuarios para eventos
 * @see App/Http/Controllers/API/v1/Admin/UserController
 */
/* Route::middleware(['auth:sanctum', config('jetstream.auth_session'), 'verified'])
    ->prefix('api/v1/users')
    ->name('api.v1.admin.')
    ->group(function () {
        Route::resource('users', App\Http\Controllers\API\v1\Admin\UserController::class)
            ->except(['create', 'edit']);
    }); */

// Rutas para eventos
/**
 * Rutas para el controlador de eventos
 *
 * @see App\Http\Controllers\API\v1\User\EventoController
 * @author Samuel Zabala
 */
Route::middleware(['auth:sanctum', config('jetstream.auth_session')])
    ->prefix('api/v1/user')
    ->name('api.v1.user.')
    ->group(function () {
        Route::get('/eventos', [App\Http\Controllers\API\v1\User\EventoController::class, 'index'])
            ->name('eventos.index');
        Route::get('/eventos/tipos', [App\Http\Controllers\API\v1\User\EventoController::class, 'tipos'])
            ->name('eventos.tipos');
        Route::get('/eventos/departamentos', [App\Http\Controllers\API\v1\User\EventoController::class, 'getDepartmentsWithContract'])
            ->name('eventos.departamentos');
        Route::get('/eventos/teams', [App\Http\Controllers\API\v1\User\EventoController::class, 'getTeamsWithPermissions'])
            ->name('eventos.teams');
        Route::get('/eventos/empresas', [App\Http\Controllers\API\v1\User\EventoController::class, 'getEmpresasWithPermissions'])
            ->name('eventos.empresas');
        Route::get('/eventos/{evento}', [App\Http\Controllers\API\v1\User\EventoController::class, 'show'])
            ->name('eventos.show');

        // Grupo de rutas para el nuevo sistema de fichaje peluche
        Route::prefix('fichaje')
            ->name('fichaje.')
            ->group(function () {
                // Ruta para obtener el estado del fichaje
                Route::get('/estado', [App\Http\Controllers\API\v1\User\Fichaje\EstadoController::class, '__invoke'])
                    ->name('estado');

                // Rutas que requieren verificación de horario
                Route::middleware(\App\Http\Middleware\VerifyFichajeAccess::class)
                    ->group(function () {
                        // Aquí irán las rutas protegidas cuando las necesitemos
                        Route::post('/accion', [App\Http\Controllers\API\v1\User\Fichaje\FichajeController::class, 'accion'])
                            ->name('accion');
                    });
            });
    });

//Ruta de eventos
Route::get('/eventos', [App\Http\Controllers\EventoController::class, 'index']);
Route::post('/eventos', [App\Http\Controllers\EventoController::class, 'store']);
Route::get('/eventos/{id}', [App\Http\Controllers\EventoController::class, 'show']);
Route::put('/eventos/{id}', [App\Http\Controllers\EventoController::class, 'update']);
Route::delete('/eventos/{id}', [App\Http\Controllers\EventoController::class, 'destroy']);
Route::get('/eventos/{id}/edit', [App\Http\Controllers\EventoController::class, 'edit']);
Route::get('/eventos/create', [App\Http\Controllers\EventoController::class, 'create']);

require_once __DIR__ . '/jetstream.php';
require_once __DIR__ . '/fortify.php';
