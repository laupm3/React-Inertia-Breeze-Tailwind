# Guía de Implementación: Sistema de Solicitudes de Permisos

## 📋 **Resumen**

Esta guía proporciona instrucciones paso a paso para implementar el sistema completo de solicitudes de permisos, desde la configuración inicial hasta las pruebas finales.

---

## 🚀 **Orden de Implementación**

### **Fase 1: Preparación (30 min)**
1. [Verificar modelos existentes](#verificar-modelos)
2. [Configurar permisos en Spatie](#configurar-permisos)
3. [Crear estructura de directorios](#estructura-directorios)

### **Fase 2: Requests de Validación (2 horas)**
4. [Crear SolicitudPermisoStoreRequest](#store-request)
5. [Crear SolicitudPermisoUpdateRequest](#update-request)
6. [Crear SolicitudPermisoApprovalRequest](#approval-request)
7. [Crear requests básicos (Index, Show, Delete)](#basic-requests)

### **Fase 3: Servicios (3 horas)**
8. [Implementar ApprovalService](#approval-service)
9. [Implementar SolicitudPermisoStatusService](#status-service)

### **Fase 4: Controlador (2 horas)**
10. [Actualizar SolicitudPermisoController](#controller)
11. [Agregar métodos de aprobación](#approval-methods)

### **Fase 5: Resources y Rutas (1 hora)**
12. [Crear SolicitudPermisoResource](#resource)
13. [Configurar rutas en web.php](#routes)

### **Fase 6: Testing (2 horas)**
14. [Tests de controlador](#controller-tests)
15. [Tests de servicios](#service-tests)

### **Fase 7: Integración (1 hora)**
16. [Pruebas manuales](#manual-testing)
17. [Documentación final](#final-docs)

---

## 📂 **Implementación Paso a Paso**

### **1. Verificar Modelos Existentes** {#verificar-modelos}

#### **Checklist de Modelos**
```bash
# Verificar que existen estos archivos
ls -la app/Models/SolicitudPermiso.php
ls -la app/Models/AprobacionSolicitudPermiso.php
ls -la app/Models/EstadoSolicitudPermiso.php
ls -la app/Models/Permiso.php
```

#### **Verificar Relaciones en SolicitudPermiso**
```php
// app/Models/SolicitudPermiso.php
public function empleado()
{
    return $this->belongsTo(Empleado::class);
}

public function permiso()
{
    return $this->belongsTo(Permiso::class);
}

public function estado()
{
    return $this->belongsTo(EstadoSolicitudPermiso::class, 'estado_id');
}

public function files(): MorphMany
{
    return $this->morphMany(File::class, 'fileable');
}

public function aprobaciones()
{
    return $this->hasMany(AprobacionSolicitudPermiso::class);
}
```

---

### **2. Configurar Permisos en Spatie** {#configurar-permisos}

#### **Crear Permisos Base**
```bash
php artisan tinker
```

```php
// En tinker, crear permisos si no existen
use Spatie\Permission\Models\Permission;

$permissions = [
    'viewSolicitudPermiso',
    'createSolicitudPermiso',
    'editSolicitudPermiso',
    'deleteSolicitudPermiso',
    'canManageManagerWorkPermitRequests',
    'canManageHrWorkPermitRequests',
    'canManageDirectionWorkPermitRequests',
];

foreach ($permissions as $permission) {
    Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
}
```

#### **Asignar Permisos a Roles**
```php
// Ejemplo: Asignar permisos a rol admin
$admin = Role::where('name', 'admin')->first();
if ($admin) {
    $admin->givePermissionTo($permissions);
}
```

---

### **3. Crear Estructura de Directorios** {#estructura-directorios}

```bash
# Crear directorios necesarios
mkdir -p app/Http/Requests/SolicitudPermiso
mkdir -p app/Services/SolicitudPermiso
mkdir -p tests/Feature/Http/Controllers/API/v1/Admin
mkdir -p tests/Unit/Services/SolicitudPermiso
mkdir -p docs/SolicitudPermiso
```

---

### **4. Crear SolicitudPermisoStoreRequest** {#store-request}

```bash
# Crear archivo
touch app/Http/Requests/SolicitudPermiso/SolicitudPermisoStoreRequest.php
```

**Contenido completo:**
```php
<?php

namespace App\Http\Requests\SolicitudPermiso;

use Illuminate\Foundation\Http\FormRequest;

class SolicitudPermisoStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('createSolicitudPermiso');
    }

    public function rules(): array
    {
        return [
            'empleado_id' => 'required|integer|exists:empleados,id',
            'permiso_id' => 'required|integer|exists:permisos,id',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'motivo' => 'required|string|max:500',
            'observaciones' => 'nullable|string|max:1000',
            
            // Validación de archivos
            'files' => 'nullable|array|max:10',
            'files.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // 10MB
        ];
    }

    public function messages(): array
    {
        return [
            'empleado_id.required' => 'El empleado es obligatorio.',
            'empleado_id.exists' => 'El empleado especificado no existe.',
            'permiso_id.required' => 'El tipo de permiso es obligatorio.',
            'permiso_id.exists' => 'El tipo de permiso especificado no existe.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_inicio.after_or_equal' => 'La fecha de inicio debe ser hoy o posterior.',
            'fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la fecha de inicio.',
            'motivo.required' => 'El motivo es obligatorio.',
            'motivo.max' => 'El motivo no puede exceder 500 caracteres.',
            'observaciones.max' => 'Las observaciones no pueden exceder 1000 caracteres.',
            'files.max' => 'No puede adjuntar más de 10 archivos.',
            'files.*.mimes' => 'Solo se permiten archivos PDF, DOC, DOCX, JPG, JPEG, PNG.',
            'files.*.max' => 'Cada archivo no puede exceder 10MB.',
        ];
    }
}
```

#### **Probar Request**
```bash
php artisan tinker
```

```php
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoStoreRequest;
$request = new SolicitudPermisoStoreRequest();
echo "Request creado correctamente\n";
```

---

### **5. Crear SolicitudPermisoApprovalRequest** {#approval-request}

```bash
touch app/Http/Requests/SolicitudPermiso/SolicitudPermisoApprovalRequest.php
```

**Contenido completo:**
```php
<?php

namespace App\Http\Requests\SolicitudPermiso;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SolicitudPermisoApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tipoAprobacion = $this->input('tipo_aprobacion');
        
        $permissions = [
            'manager' => 'canManageManagerWorkPermitRequests',
            'hr' => 'canManageHrWorkPermitRequests',
            'direction' => 'canManageDirectionWorkPermitRequests',
        ];
        
        return isset($permissions[$tipoAprobacion]) && 
               $this->user()->can($permissions[$tipoAprobacion]);
    }

    public function rules(): array
    {
        return [
            'tipo_aprobacion' => [
                'required',
                'string',
                Rule::in(['manager', 'hr', 'direction'])
            ],
            'aprobado' => 'required|boolean',
            'observacion' => 'nullable|string|max:1000',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $solicitud = $this->route('solicitudPermiso');
            $tipoAprobacion = $this->input('tipo_aprobacion');
            
            // Verificar que no existe aprobación previa del mismo tipo
            $existingApproval = $solicitud->aprobaciones()
                ->where('tipo_aprobacion', $tipoAprobacion)
                ->exists();
                
            if ($existingApproval) {
                $validator->errors()->add(
                    'tipo_aprobacion', 
                    'Ya existe una aprobación de este tipo para esta solicitud.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'tipo_aprobacion.required' => 'El tipo de aprobación es obligatorio.',
            'tipo_aprobacion.in' => 'El tipo de aprobación debe ser: manager, hr o direction.',
            'aprobado.required' => 'Debe especificar si aprueba o rechaza.',
            'aprobado.boolean' => 'El campo aprobado debe ser true o false.',
            'observacion.max' => 'La observación no puede exceder 1000 caracteres.',
        ];
    }
}
```

---

### **6. Implementar ApprovalService** {#approval-service}

```bash
touch app/Services/SolicitudPermiso/ApprovalService.php
```

**Contenido completo:**
```php
<?php

namespace App\Services\SolicitudPermiso;

use App\Models\User;
use App\Models\SolicitudPermiso;
use App\Models\AprobacionSolicitudPermiso;

class ApprovalService
{
    /**
     * Verifica si un usuario puede aprobar con un tipo específico
     */
    public function canUserApprove(User $user, string $tipoAprobacion): bool
    {
        $permissions = [
            'manager' => 'canManageManagerWorkPermitRequests',
            'hr' => 'canManageHrWorkPermitRequests', 
            'direction' => 'canManageDirectionWorkPermitRequests',
        ];
        
        return isset($permissions[$tipoAprobacion]) && 
               $user->can($permissions[$tipoAprobacion]);
    }

    /**
     * Obtiene los tipos de aprobación que puede realizar un usuario
     */
    public function getUserApprovalTypes(User $user): array
    {
        $types = [];
        $permissions = [
            'manager' => 'canManageManagerWorkPermitRequests',
            'hr' => 'canManageHrWorkPermitRequests',
            'direction' => 'canManageDirectionWorkPermitRequests',
        ];
        
        foreach ($permissions as $type => $permission) {
            if ($user->can($permission)) {
                $types[] = $type;
            }
        }
        
        return $types;
    }

    /**
     * Crea una nueva aprobación
     */
    public function createApproval(
        SolicitudPermiso $solicitud, 
        User $user, 
        string $tipo, 
        bool $aprobado, 
        ?string $observacion = null
    ): AprobacionSolicitudPermiso {
        return AprobacionSolicitudPermiso::create([
            'solicitud_permiso_id' => $solicitud->id,
            'user_id' => $user->id,
            'tipo_aprobacion' => $tipo,
            'aprobado' => $aprobado,
            'observacion' => $observacion,
        ]);
    }

    /**
     * Verifica si la solicitud tiene todas las aprobaciones requeridas
     */
    public function isFullyApproved(SolicitudPermiso $solicitud): bool
    {
        $requiredTypes = ['manager', 'hr', 'direction'];
        $approvedTypes = $solicitud->aprobaciones()
            ->where('aprobado', true)
            ->pluck('tipo_aprobacion')
            ->toArray();
            
        return count(array_intersect($requiredTypes, $approvedTypes)) === count($requiredTypes);
    }

    /**
     * Verifica si hay alguna aprobación rechazada
     */
    public function hasRejections(SolicitudPermiso $solicitud): bool
    {
        return $solicitud->aprobaciones()
            ->where('aprobado', false)
            ->exists();
    }
}
```

#### **Probar Servicio**
```bash
php artisan tinker
```

```php
use App\Services\SolicitudPermiso\ApprovalService;
$service = new ApprovalService();
$user = User::first();
echo "Tipos de aprobación del usuario: " . implode(', ', $service->getUserApprovalTypes($user));
```

---

### **7. Implementar SolicitudPermisoStatusService** {#status-service}

```bash
touch app/Services/SolicitudPermiso/SolicitudPermisoStatusService.php
```

**Contenido completo:**
```php
<?php

namespace App\Services\SolicitudPermiso;

use App\Models\SolicitudPermiso;

class SolicitudPermisoStatusService
{
    public function __construct(
        private ApprovalService $approvalService
    ) {}

    /**
     * Actualiza el estado de la solicitud basado en las aprobaciones
     */
    public function updateStatus(SolicitudPermiso $solicitud): bool
    {
        $newStatus = $this->determineStatusFromApprovals($solicitud);
        
        if ($solicitud->estado_id !== $newStatus) {
            $solicitud->update(['estado_id' => $newStatus]);
            
            // Log del cambio de estado
            \Log::info("SolicitudPermiso {$solicitud->id} cambió a estado {$newStatus}");
            
            return true;
        }
        
        return false;
    }

    /**
     * Verifica si una solicitud puede ser editada
     */
    public function canBeEdited(SolicitudPermiso $solicitud): bool
    {
        // Solo se puede editar si está en estado PENDIENTE y no tiene aprobaciones
        return $solicitud->estado_id === 1 && // PENDIENTE
               !$solicitud->aprobaciones()->exists();
    }

    /**
     * Determina el estado basado en las aprobaciones existentes
     */
    private function determineStatusFromApprovals(SolicitudPermiso $solicitud): int
    {
        // Si hay rechazos, estado = rechazado (4)
        if ($this->approvalService->hasRejections($solicitud)) {
            return 4; // RECHAZADO
        }
        
        // Si está completamente aprobado, estado = aprobado (3)
        if ($this->approvalService->isFullyApproved($solicitud)) {
            return 3; // APROBADO
        }
        
        // Si tiene aprobaciones parciales, estado = en revisión (2)
        if ($solicitud->aprobaciones()->exists()) {
            return 2; // EN_REVISION
        }
        
        // Estado inicial = pendiente (1)
        return 1; // PENDIENTE
    }
}
```

---

### **8. Actualizar SolicitudPermisoController** {#controller}

```bash
# Abrir el archivo existente
nano app/Http/Controllers/API/v1/Admin/SolicitudPermisoController.php
```

**Reemplazar contenido completo:**
```php
<?php

namespace App\Http\Controllers\API\v1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\SolicitudPermiso;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Services\Storage\FileSystemService;
use App\Services\SolicitudPermiso\ApprovalService;
use App\Services\SolicitudPermiso\SolicitudPermisoStatusService;
use App\Http\Resources\SolicitudPermisoResource;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoStoreRequest;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoApprovalRequest;

class SolicitudPermisoController extends Controller
{
    public function __construct(
        private SolicitudPermisoStatusService $statusService,
        private ApprovalService $approvalService,
        private FileSystemService $fileSystemService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return DB::transaction(function () {
            $solicitudes = SolicitudPermiso::with([
                'empleado.user',
                'permiso',
                'estado',
                'aprobaciones.approvedBy',
                'files'
            ])->paginate(15);

            return response()->json([
                'solicitudes' => SolicitudPermisoResource::collection($solicitudes->items()),
                'pagination' => [
                    'current_page' => $solicitudes->currentPage(),
                    'total_pages' => $solicitudes->lastPage(),
                    'total_items' => $solicitudes->total(),
                    'per_page' => $solicitudes->perPage(),
                ]
            ], Response::HTTP_OK);
        });
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SolicitudPermisoStoreRequest $request)
    {
        return DB::transaction(function () use ($request) {
            // 1. Crear solicitud
            $solicitud = SolicitudPermiso::create($request->validated());

            // 2. Procesar archivos si los hay
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    // Usar FileSystemService directamente
                    $this->fileSystemService->putFileFromPath($solicitud, $file->getPathname());
                }
            }

            // 3. Actualizar estado inicial
            $this->statusService->updateStatus($solicitud);

            // 4. Cargar relaciones para respuesta
            $solicitud->load([
                'empleado.user',
                'permiso',
                'estado',
                'files'
            ]);

            return response()->json([
                'solicitud' => new SolicitudPermisoResource($solicitud),
                'message' => 'Solicitud de permiso creada correctamente.'
            ], Response::HTTP_CREATED);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(SolicitudPermiso $solicitudPermiso)
    {
        return DB::transaction(function () use ($solicitudPermiso) {
            $solicitudPermiso->load([
                'empleado.user',
                'permiso',
                'estado',
                'aprobaciones.approvedBy',
                'files'
            ]);

            return response()->json([
                'solicitud' => new SolicitudPermisoResource($solicitudPermiso),
                'can_edit' => $this->statusService->canBeEdited($solicitudPermiso),
                'user_approval_types' => $this->approvalService->getUserApprovalTypes(auth()->user()),
            ], Response::HTTP_OK);
        });
    }

    /**
     * Process approval or rejection
     */
    public function processApproval(SolicitudPermisoApprovalRequest $request, SolicitudPermiso $solicitudPermiso)
    {
        return DB::transaction(function () use ($request, $solicitudPermiso) {
            // 1. Crear aprobación
            $approval = $this->approvalService->createApproval(
                $solicitudPermiso,
                auth()->user(),
                $request->tipo_aprobacion,
                $request->aprobado,
                $request->observacion
            );

            // 2. Actualizar estado de la solicitud
            $this->statusService->updateStatus($solicitudPermiso);

            // 3. Cargar relaciones actualizadas
            $solicitudPermiso->load([
                'empleado.user',
                'permiso',
                'estado',
                'aprobaciones.approvedBy',
                'files'
            ]);

            $message = $request->aprobado ? 'Solicitud aprobada correctamente.' : 'Solicitud rechazada.';

            return response()->json([
                'solicitud' => new SolicitudPermisoResource($solicitudPermiso),
                'approval' => $approval,
                'message' => $message
            ], Response::HTTP_OK);
        });
    }
}
```

---

### **9. Crear SolicitudPermisoResource** {#resource}

```bash
touch app/Http/Resources/SolicitudPermisoResource.php
```

**Contenido básico:**
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudPermisoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'empleado' => [
                'id' => $this->empleado->id,
                'nombre_completo' => $this->empleado->user->name ?? 'N/A',
                'email' => $this->empleado->user->email ?? 'N/A',
            ],
            'permiso' => [
                'id' => $this->permiso->id,
                'nombre' => $this->permiso->nombre,
            ],
            'estado' => [
                'id' => $this->estado->id,
                'nombre' => $this->estado->nombre,
            ],
            'fecha_inicio' => $this->fecha_inicio,
            'fecha_fin' => $this->fecha_fin,
            'motivo' => $this->motivo,
            'observaciones' => $this->observaciones,
            'aprobaciones' => $this->whenLoaded('aprobaciones', function () {
                return $this->aprobaciones->map(function ($aprobacion) {
                    return [
                        'id' => $aprobacion->id,
                        'tipo_aprobacion' => $aprobacion->tipo_aprobacion,
                        'aprobado' => $aprobacion->aprobado,
                        'observacion' => $aprobacion->observacion,
                        'created_at' => $aprobacion->created_at,
                    ];
                });
            }),
            'files' => $this->whenLoaded('files', function () {
                return $this->files->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'nombre' => $file->nombre,
                        'size' => $file->size,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

---

### **10. Configurar Rutas** {#routes}

```bash
# Editar routes/web.php
nano routes/web.php
```

**Agregar en la sección de rutas API admin:**
```php
// Dentro del grupo de rutas admin
Route::prefix('solicitud-permisos')->name('solicitud-permisos.')->group(function () {
    Route::get('/', [App\Http\Controllers\API\v1\Admin\SolicitudPermisoController::class, 'index'])->name('index');
    Route::post('/', [App\Http\Controllers\API\v1\Admin\SolicitudPermisoController::class, 'store'])->name('store');
    Route::get('/{solicitudPermiso}', [App\Http\Controllers\API\v1\Admin\SolicitudPermisoController::class, 'show'])->name('show');
    
    // Rutas de aprobación
    Route::post('/{solicitudPermiso}/process-approval', [App\Http\Controllers\API\v1\Admin\SolicitudPermisoController::class, 'processApproval'])->name('process-approval');
});
```

#### **Verificar Rutas**
```bash
php artisan route:list --path=solicitud-permisos
```

---

### **11. Crear Tests Básicos** {#controller-tests}

```bash
touch tests/Feature/Http/Controllers/API/v1/Admin/SolicitudPermisoControllerTest.php
```

**Test básico:**
```php
<?php

namespace Tests\Feature\Http\Controllers\API\v1\Admin;

use App\Models\User;
use App\Models\SolicitudPermiso;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class SolicitudPermisoControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::where('email', 'admin@admin.com')->first();
        
        if (!$this->admin) {
            $this->markTestSkipped('Usuario admin no encontrado');
        }
    }

    /** @test */
    public function it_can_list_solicitudes()
    {
        $this->actingAs($this->admin);

        $response = $this->getJson('/api/v1/admin/solicitud-permisos');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'solicitudes',
                'pagination'
            ]);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->getJson('/api/v1/admin/solicitud-permisos');

        $response->assertStatus(401);
    }
}
```

#### **Ejecutar Tests**
```bash
php artisan test tests/Feature/Http/Controllers/API/v1/Admin/SolicitudPermisoControllerTest.php
```

---

### **12. Pruebas Manuales** {#manual-testing}

#### **Test 1: Listar solicitudes**
```bash
curl -X GET \
  http://localhost:8000/api/v1/admin/solicitud-permisos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

#### **Test 2: Crear solicitud (simulada)**
```bash
# Verificar que la ruta existe
php artisan route:list --path=solicitud-permisos
```

#### **Test 3: Verificar servicios**
```bash
php artisan tinker
```

```php
use App\Services\SolicitudPermiso\ApprovalService;
use App\Services\SolicitudPermiso\SolicitudPermisoStatusService;

$approvalService = app(ApprovalService::class);
$statusService = app(SolicitudPermisoStatusService::class);

echo "Servicios creados correctamente\n";
```

---

## ✅ **Checklist Final**

### **Configuración Base**
- [ ] Modelos existentes verificados
- [ ] Permisos Spatie creados
- [ ] Estructura de directorios creada

### **Requests**
- [ ] SolicitudPermisoStoreRequest implementado
- [ ] SolicitudPermisoApprovalRequest implementado
- [ ] Validaciones funcionando

### **Servicios**
- [ ] ApprovalService implementado
- [ ] SolicitudPermisoStatusService implementado
- [ ] Servicios probados en tinker

### **Controlador**
- [ ] SolicitudPermisoController actualizado
- [ ] Métodos básicos implementados
- [ ] Método de aprobación implementado

### **Integración**
- [ ] SolicitudPermisoResource creado
- [ ] Rutas configuradas
- [ ] Rutas verificadas con artisan route:list

### **Testing**
- [ ] Test básico implementado
- [ ] Tests ejecutándose sin errores
- [ ] Pruebas manuales realizadas

---

## 🚀 **Siguientes Pasos**

### **Inmediato**
1. **Completar requests faltantes** (Update, Index, Show, Delete)
2. **Expandir tests** con casos más complejos
3. **Implementar manejo de archivos** completo

### **Corto Plazo**
1. **Notificaciones** por cambios de estado
2. **Dashboard** de métricas
3. **Reportes** de solicitudes

### **Largo Plazo**
1. **API pública** para integración
2. **Mobile app** support
3. **Analytics** avanzados

---

## 🆘 **Troubleshooting**

### **Error: Class not found**
```bash
composer dump-autoload
```

### **Error: Permission denied**
```bash
# Verificar permisos en Spatie
php artisan tinker
Spatie\Permission\Models\Permission::all();
```

### **Error: Route not found**
```bash
php artisan route:clear
php artisan route:cache
```

### **Error: Database connection**
```bash
php artisan migrate:status
```

---

**¡Implementación completada!** El sistema estará funcional con la funcionalidad básica de CRUD y aprobaciones.
