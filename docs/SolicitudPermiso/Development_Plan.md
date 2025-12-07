# Plan de Desarrollo: CRUD SolicitudPermiso

## 📋 **Resumen Ejecutivo**

### **Objetivo**
Desarrollar un CRUD completo para `SolicitudPermiso` siguiendo la estructura establecida en `HorarioController`, con sistema de aprobaciones múltiples, manejo de archivos polimórficos y servicios especializados.

### **Características Principales**
- ✅ **Sistema de Aprobaciones**: 3 tipos (Manager, HR, Direction) con permisos específicos
- ✅ **Archivos Adjuntos**: Relación polimórfica con validación robusta
- ✅ **Estados Dinámicos**: Cambios automáticos basados en aprobaciones
- ✅ **Patrón Consistente**: Siguiendo estructura de HorarioController
- ✅ **Servicios Especializados**: Separación de responsabilidades

### **Tecnologías/Patrones**
- Laravel Request Validation
- DB::transaction pattern
- Service Layer Pattern
- Resource Transformation
- Polymorphic Relations
- Spatie Permissions

---

## 🎯 **Análisis de Requisitos**

### **Sistema de Aprobaciones**

#### **Tipos de Aprobación**
```php
enum TipoAprobacion: string 
{
    case MANAGER = 'manager';
    case HR = 'hr'; 
    case DIRECTION = 'direction';
}
```

#### **Permisos Requeridos**
```php
// Permisos específicos por tipo de aprobación
'canManageManagerWorkPermitRequests'   // Aprobaciones de Manager
'canManageHrWorkPermitRequests'        // Aprobaciones de HR  
'canManageDirectionWorkPermitRequests' // Aprobaciones de Dirección

// Permisos básicos CRUD
'viewWorkPermits'
'createWorkPermits'
'editWorkPermits'
'deleteWorkPermits'
```

#### **Reglas de Negocio**
1. **Una aprobación por tipo**: Solo puede existir una aprobación por tipo por solicitud
2. **Sin jerarquía**: Todas las aprobaciones son requeridas (no hay orden específico)
3. **Permisos independientes**: Un usuario puede tener múltiples permisos de aprobación
4. **Estado automático**: El estado se actualiza automáticamente según aprobaciones

### **Archivos Adjuntos**

#### **Relación Polimórfica**
```php
// En SolicitudPermiso
public function files(): MorphMany
{
    return $this->morphMany(File::class, 'fileable');
}
```

#### **Validaciones de Archivos**
- **Tipos permitidos**: PDF, DOC, DOCX, JPG, PNG
- **Tamaño máximo**: 10MB por archivo
- **Cantidad máxima**: 10 archivos por solicitud
- **Nombres únicos**: Evitar conflictos de nomenclatura

---

## 📂 **Estructura de Archivos**

```
app/
├── Http/
│   ├── Controllers/API/v1/Admin/
│   │   └── SolicitudPermisoController.php
│   ├── Requests/SolicitudPermiso/
│   │   ├── SolicitudPermisoIndexRequest.php
│   │   ├── SolicitudPermisoStoreRequest.php
│   │   ├── SolicitudPermisoUpdateRequest.php
│   │   ├── SolicitudPermisoShowRequest.php
│   │   ├── SolicitudPermisoDeleteRequest.php
│   │   └── SolicitudPermisoApprovalRequest.php
│   └── Resources/
│       ├── SolicitudPermisoResource.php
│       └── AprobacionSolicitudPermisoResource.php
├── Services/SolicitudPermiso/
│   ├── SolicitudPermisoStatusService.php
│   └── ApprovalService.php
└── Models/
    ├── SolicitudPermiso.php (existente - actualizar)
    └── AprobacionSolicitudPermiso.php (existente)

tests/
├── Feature/Http/Controllers/API/v1/Admin/
│   └── SolicitudPermisoControllerTest.php
└── Unit/Services/SolicitudPermiso/
    ├── SolicitudPermisoStatusServiceTest.php
    └── ApprovalServiceTest.php

docs/SolicitudPermiso/
├── API_SolicitudPermiso_CRUD.md
├── API_SolicitudPermiso_Approvals.md
├── Business_Rules.md
└── Development_Guide.md
```

---

## 🔧 **Desarrollo Paso a Paso**

### **Paso 1: Crear Requests de Validación**

#### **1.1 SolicitudPermisoStoreRequest**
```php
<?php

namespace App\Http\Requests\SolicitudPermiso;

use Illuminate\Foundation\Http\FormRequest;

class SolicitudPermisoStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('createWorkPermits');
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

#### **1.2 SolicitudPermisoApprovalRequest**
```php
<?php

namespace App\Http\Requests\SolicitudPermiso;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SolicitudPermisoApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        $solicitud = $this->route('solicitudPermiso');
        $tipoAprobacion = $this->input('tipo_aprobacion');
        
        // Verificar permisos específicos por tipo
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
}
```

### **Paso 2: Crear Servicios Especializados**

#### **2.1 ApprovalService**
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

#### **2.2 SolicitudPermisoStatusService**
```php
<?php

namespace App\Services\SolicitudPermiso;

use App\Models\SolicitudPermiso;
use App\Models\EstadoSolicitudPermiso;

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
            
            // Aquí se pueden agregar notificaciones, logs, etc.
            $this->logStatusChange($solicitud, $newStatus);
            
            return true;
        }
        
        return false;
    }

    /**
     * Determina el estado basado en las aprobaciones existentes
     */
    private function determineStatusFromApprovals(SolicitudPermiso $solicitud): int
    {
        // Si hay rechazos, estado = rechazado
        if ($this->approvalService->hasRejections($solicitud)) {
            return EstadoSolicitudPermiso::RECHAZADO;
        }
        
        // Si está completamente aprobado, estado = aprobado
        if ($this->approvalService->isFullyApproved($solicitud)) {
            return EstadoSolicitudPermiso::APROBADO;
        }
        
        // Si tiene aprobaciones parciales, estado = en revisión
        if ($solicitud->aprobaciones()->exists()) {
            return EstadoSolicitudPermiso::EN_REVISION;
        }
        
        // Estado inicial = pendiente
        return EstadoSolicitudPermiso::PENDIENTE;
    }

    /**
     * Verifica si una solicitud puede ser editada
     */
    public function canBeEdited(SolicitudPermiso $solicitud): bool
    {
        return in_array($solicitud->estado_id, [
            EstadoSolicitudPermiso::PENDIENTE,
            EstadoSolicitudPermiso::EN_REVISION, // Solo si no hay aprobaciones
        ]) && !$solicitud->aprobaciones()->exists();
    }

    /**
     * Registra cambios de estado para auditoría
     */
    private function logStatusChange(SolicitudPermiso $solicitud, int $newStatus): void
    {
        // Implementar logging de cambios de estado
        \Log::info("SolicitudPermiso {$solicitud->id} cambió a estado {$newStatus}");
    }
}
```

### **Paso 3: Actualizar el Controlador**

#### **3.1 SolicitudPermisoController Completo**
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
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoIndexRequest;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoStoreRequest;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoUpdateRequest;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoShowRequest;
use App\Http\Requests\SolicitudPermiso\SolicitudPermisoDeleteRequest;
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
    public function index(SolicitudPermisoIndexRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $query = SolicitudPermiso::with([
                'empleado.user',
                'permiso',
                'estado',
                'aprobaciones.approvedBy.empleado.user',
                'files'
            ]);

            // Aplicar filtros desde el request
            if ($request->has('estado_id')) {
                $query->where('estado_id', $request->estado_id);
            }

            if ($request->has('empleado_id')) {
                $query->where('empleado_id', $request->empleado_id);
            }

            $solicitudes = $query->paginate($request->per_page ?? 15);

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

            // 2. Procesar archivos usando FileSystemService directamente
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
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
                'files',
                'aprobaciones'
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
    public function show(SolicitudPermisoShowRequest $request, SolicitudPermiso $solicitudPermiso)
    {
        return DB::transaction(function () use ($solicitudPermiso) {
            $solicitudPermiso->load([
                'empleado.user',
                'permiso',
                'estado',
                'aprobaciones.approvedBy.empleado.user',
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
     * Update the specified resource in storage.
     */
    public function update(SolicitudPermisoUpdateRequest $request, SolicitudPermiso $solicitudPermiso)
    {
        return DB::transaction(function () use ($request, $solicitudPermiso) {
            // Verificar que puede ser editada
            if (!$this->statusService->canBeEdited($solicitudPermiso)) {
                return response()->json([
                    'message' => 'Esta solicitud ya no puede ser editada.'
                ], Response::HTTP_FORBIDDEN);
            }

            // 1. Actualizar datos básicos
            $solicitudPermiso->update($request->validated());

            // 2. Manejar archivos si los hay
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $this->fileSystemService->putFileFromPath($solicitudPermiso, $file->getPathname());
                }
            }

            // 3. Eliminar archivos si se especifica
            if ($request->has('files_to_delete')) {
                foreach ($request->files_to_delete as $fileId) {
                    $file = $solicitudPermiso->files()->find($fileId);
                    if ($file) {
                        $this->fileSystemService->deleteFile($file);
                        $file->delete();
                    }
                }
            }

            // 4. Cargar relaciones actualizadas
            $solicitudPermiso->load([
                'empleado.user',
                'permiso',
                'estado',
                'files',
                'aprobaciones'
            ]);

            return response()->json([
                'solicitud' => new SolicitudPermisoResource($solicitudPermiso),
                'message' => 'Solicitud de permiso actualizada correctamente.'
            ], Response::HTTP_OK);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SolicitudPermisoDeleteRequest $request, SolicitudPermiso $solicitudPermiso)
    {
        return DB::transaction(function () use ($solicitudPermiso) {
            // Eliminar archivos asociados
            foreach ($solicitudPermiso->files as $file) {
                $this->fileSystemService->deleteFile($file);
            }

            // Soft delete de la solicitud
            $solicitudPermiso->delete();

            return response()->json([
                'message' => 'Solicitud de permiso eliminada correctamente.'
            ], Response::HTTP_OK);
        });
    }

    /**
     * Approve or reject a permission request
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
                'aprobaciones.approvedBy.empleado.user',
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

    /**
     * Get approval status for a permission request
     */
    public function getApprovalStatus(SolicitudPermiso $solicitudPermiso)
    {
        return response()->json([
            'is_fully_approved' => $this->approvalService->isFullyApproved($solicitudPermiso),
            'has_rejections' => $this->approvalService->hasRejections($solicitudPermiso),
            'can_be_edited' => $this->statusService->canBeEdited($solicitudPermiso),
            'user_approval_types' => $this->approvalService->getUserApprovalTypes(auth()->user()),
            'existing_approvals' => $solicitudPermiso->aprobaciones->pluck('tipo_aprobacion')->toArray(),
        ], Response::HTTP_OK);
    }
}
```

### **Paso 4: Crear Resources**

#### **4.1 SolicitudPermisoResource**
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudPermisoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'empleado' => [
                'id' => $this->empleado->id,
                'nombre_completo' => $this->empleado->user->name,
                'email' => $this->empleado->user->email,
            ],
            'permiso' => [
                'id' => $this->permiso->id,
                'nombre' => $this->permiso->nombre,
                'descripcion' => $this->permiso->descripcion,
            ],
            'estado' => [
                'id' => $this->estado->id,
                'nombre' => $this->estado->nombre,
                'color' => $this->estado->color ?? '#6B7280',
            ],
            'fecha_inicio' => $this->fecha_inicio,
            'fecha_fin' => $this->fecha_fin,
            'motivo' => $this->motivo,
            'observaciones' => $this->observaciones,
            'aprobaciones' => AprobacionSolicitudPermisoResource::collection($this->whenLoaded('aprobaciones')),
            'files' => $this->whenLoaded('files', function () {
                return $this->files->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'nombre' => $file->nombre,
                        'extension' => $file->extension,
                        'size' => $file->size,
                        'url' => $file->url,
                    ];
                });
            }),
            'metadata' => [
                'can_be_edited' => $this->when(
                    $this->relationLoaded('estado'),
                    function () {
                        return app(\App\Services\SolicitudPermiso\SolicitudPermisoStatusService::class)
                            ->canBeEdited($this->resource);
                    }
                ),
                'is_fully_approved' => $this->when(
                    $this->relationLoaded('aprobaciones'),
                    function () {
                        return app(\App\Services\SolicitudPermiso\ApprovalService::class)
                            ->isFullyApproved($this->resource);
                    }
                ),
                'has_rejections' => $this->when(
                    $this->relationLoaded('aprobaciones'),
                    function () {
                        return app(\App\Services\SolicitudPermiso\ApprovalService::class)
                            ->hasRejections($this->resource);
                    }
                ),
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### **Paso 5: Configurar Rutas**

#### **5.1 Rutas en web.php**
```php
// Grupo de rutas para solicitudes de permisos
Route::prefix('solicitud-permisos')->name('solicitud-permisos.')->group(function () {
    Route::get('/', [SolicitudPermisoController::class, 'index'])->name('index');
    Route::post('/', [SolicitudPermisoController::class, 'store'])->name('store');
    Route::get('/{solicitudPermiso}', [SolicitudPermisoController::class, 'show'])->name('show');
    Route::put('/{solicitudPermiso}', [SolicitudPermisoController::class, 'update'])->name('update');
    Route::delete('/{solicitudPermiso}', [SolicitudPermisoController::class, 'destroy'])->name('destroy');
    
    // Rutas específicas de aprobación
    Route::post('/{solicitudPermiso}/process-approval', [SolicitudPermisoController::class, 'processApproval'])->name('process-approval');
    Route::get('/{solicitudPermiso}/approval-status', [SolicitudPermisoController::class, 'getApprovalStatus'])->name('approval-status');
});
```

---

## 🧪 **Testing**

### **Casos de Prueba Principales**

#### **Tests de Controlador**
1. **CRUD básico**: Crear, listar, mostrar, actualizar, eliminar
2. **Autenticación**: Verificar permisos requeridos
3. **Aprobaciones**: Procesar aprobaciones/rechazos
4. **Archivos**: Upload, validación, eliminación
5. **Estados**: Cambios automáticos de estado
6. **Validaciones**: Casos límite y errores

#### **Tests de Servicios**
1. **ApprovalService**: Lógica de aprobaciones
2. **StatusService**: Cambios de estado
3. **FileSystemService**: Integración de archivos

---

## 📚 **Documentación de API**

### **Endpoints Principales**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/admin/solicitud-permisos` | Listar solicitudes |
| POST | `/api/v1/admin/solicitud-permisos` | Crear solicitud |
| GET | `/api/v1/admin/solicitud-permisos/{id}` | Mostrar solicitud |
| PUT | `/api/v1/admin/solicitud-permisos/{id}` | Actualizar solicitud |
| DELETE | `/api/v1/admin/solicitud-permisos/{id}` | Eliminar solicitud |
| POST | `/api/v1/admin/solicitud-permisos/{id}/process-approval` | Procesar aprobación |
| GET | `/api/v1/admin/solicitud-permisos/{id}/approval-status` | Estado de aprobaciones |

---

## ✅ **Checklist de Implementación**

### **Fase 1: Fundamentos**
- [ ] Crear todos los Requests de validación
- [ ] Implementar ApprovalService
- [ ] Implementar SolicitudPermisoStatusService
- [ ] Actualizar SolicitudPermisoController

### **Fase 2: Integración**
- [ ] Crear SolicitudPermisoResource
- [ ] Configurar rutas en web.php
- [ ] Verificar permisos en Spatie
- [ ] Tests básicos de funcionalidad

### **Fase 3: Refinamiento**
- [ ] Tests completos (edge cases)
- [ ] Documentación de API
- [ ] Optimizaciones de performance
- [ ] Validación en entorno de desarrollo

### **Fase 4: Producción**
- [ ] Revisión de código
- [ ] Tests de integración
- [ ] Documentación final
- [ ] Deploy y monitoreo

---

## 🎯 **Siguientes Pasos**

1. **Comenzar con Requests**: Implementar las validaciones base
2. **Servicios core**: ApprovalService y StatusService
3. **Controlador**: Integrar todo siguiendo el patrón establecido
4. **Testing**: Validar funcionalidad paso a paso
5. **Documentación**: Mantener docs actualizadas

¿Con qué fase te gustaría comenzar? Recomiendo empezar por los **Requests de validación** ya que definen el contrato de entrada de datos.
