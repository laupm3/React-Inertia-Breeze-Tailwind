
## Componentes Principales

### 1. DashboardService

Claro, vamos a documentar lo que hemos implementado en el DashboardService:

```php:app/Services/DashboardService.php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Horario;
use App\Models\SolicitudPermiso;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DashboardService
{
    /**
     * Obtiene estadísticas de solicitudes de vacaciones agrupadas por estado.
     * 
     * @return \Illuminate\Support\Collection
     */
    public function getVacacionesStats()
    {
        return SolicitudPermiso::with(['estado', 'contrato.empleado'])
            ->select('estado_id', DB::raw('count(*) as total'))
            ->groupBy('estado_id')
            ->get()
            ->map(function ($solicitud) {
                return [
                    'name' => $solicitud->estado->nombre,
                    'value' => $solicitud->total
                ];
            });
    }

    /**
     * Obtiene estadísticas de documentación pendiente vs completada por días.
     * 
     * @return \Illuminate\Support\Collection
     */
    public function getDocumentacionStats()
    {
        return Horario::with(['contrato.empleado', 'estadoHorario'])
            ->whereDate('horario_inicio', '>=', now()->subDays(7))
            ->whereDate('horario_inicio', '<=', now())
            ->select(
                DB::raw('DATE(horario_inicio) as fecha'),
                DB::raw('COUNT(CASE WHEN observaciones IS NULL AND fichaje_entrada IS NOT NULL THEN 1 END) as pendientes'),
                DB::raw('COUNT(CASE WHEN observaciones IS NOT NULL OR fichaje_entrada IS NULL THEN 1 END) as completados')
            )
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->fecha,
                    'pendiente' => $item->pendientes,
                    'completado' => $item->completados
                ];
            });
    }

    /**
     * Obtiene la distribución de usuarios activos por departamento.
     * Utiliza el sistema de caché para rastrear usuarios conectados a través de canales de broadcast.
     * 
     * @return \Illuminate\Support\Collection
     */
    public function getUsuariosPorDepartamentoStats()
    {
        // Obtener lista de usuarios activos desde la caché
        $usuariosActivos = Cache::get('usuarios_activos', collect([]));

        return User::with(['empleado.contratos' => function($query) {
                // Filtrar solo contratos vigentes
                $query->whereNull('fecha_fin')
                      ->orWhere('fecha_fin', '>', now());
            }, 'empleado.contratos.departamento'])
            ->whereIn('id', $usuariosActivos)
            ->get()
            ->map(function($user) {
                $contrato = $user->empleado?->contratos->first();
                return [
                    'departamento_id' => $contrato?->departamento_id,
                    'departamento_nombre' => $contrato?->departamento?->nombre ?? 'Sin departamento'
                ];
            })
            ->groupBy('departamento_id')
            ->map(function($grupo) {
                return [
                    'name' => $grupo->first()['departamento_nombre'],
                    'value' => $grupo->count()
                ];
            });
    }

    /**
     * Actualiza el estado de presencia de un usuario en la caché.
     * Se llama cuando un usuario se conecta o desconecta de un canal de broadcast.
     * 
     * @param User $user El usuario que cambia su estado
     * @param bool $isOnline True si el usuario se conecta, false si se desconecta
     * @return void
     */
    public function updateUserPresence(User $user, bool $isOnline)
    {
        $usuariosActivos = Cache::get('usuarios_activos', collect([]));

        if ($isOnline) {
            $usuariosActivos->push($user->id);
            Log::info("Usuario {$user->id} conectado");
        } else {
            $usuariosActivos = $usuariosActivos->reject(fn($id) => $id === $user->id);
            Log::info("Usuario {$user->id} desconectado");
        }

        Cache::put('usuarios_activos', $usuariosActivos->unique(), now()->addMinutes(5));
    }

    /**
     * Obtiene el monitoreo de usuarios activos por día.
     * 
     * @return \Illuminate\Support\Collection
     */
    public function getUsuariosActivosStats()
    {
        return Horario::with(['contrato.empleado'])
            ->whereDate('horario_inicio', '>=', now()->startOfWeek())
            ->whereDate('horario_inicio', '<=', now())
            ->whereNotNull('fichaje_entrada')
            ->select([
                DB::raw('DATE(horario_inicio) as fecha'),
                DB::raw('strftime("%w") as dia'),
                DB::raw('COUNT(DISTINCT contrato_id) as usuarios_activos')
            ])
            ->groupBy('fecha', 'dia')
            ->orderBy('fecha');
    }
}
```

Este servicio implementa:

1. **Gestión de Vacaciones**
   - Cuenta solicitudes de permisos por estado
   - Utiliza relaciones Eloquent para acceder a datos relacionados
   - Formatea datos para gráficos de tipo pie

2. **Seguimiento de Documentación**
   - Analiza horarios de los últimos 7 días
   - Distingue entre documentos pendientes y completados
   - Agrupa datos por fecha para visualización temporal

3. **Monitoreo de Usuarios Activos**
   - Utiliza sistema de caché para rastrear usuarios conectados
   - Agrupa usuarios por departamento
   - Mantiene conteo en tiempo real de usuarios por departamento
   - Se integra con el sistema de broadcasting de Laravel

4. **Sistema de Presencia**
   - Mantiene registro de usuarios conectados en caché
   - Actualiza estado cuando usuarios se conectan/desconectan
   - Incluye logging para debugging y monitoreo

Además, el servicio incluye:

#### Monitoreo de Usuarios Activos por Día
```php
public function getUsuariosActivosStats()
{
    return Horario::with(['contrato.empleado'])
        ->whereDate('horario_inicio', '>=', now()->startOfWeek())
        ->whereDate('horario_inicio', '<=', now())
        ->whereNotNull('fichaje_entrada')
        ->select([
            DB::raw('DATE(horario_inicio) as fecha'),
            DB::raw('strftime("%w") as dia'),
            DB::raw('COUNT(DISTINCT contrato_id) as usuarios_activos')
        ])
        ->groupBy('fecha', 'dia')
        ->orderBy('fecha');
}
```

Este método proporciona:
- **Conteo de Usuarios Activos**: Cuenta usuarios únicos por contrato que han fichado entrada
- **Agrupación por Día**: Organiza los datos por día de la semana
- **Rango de Fechas**: Muestra datos de la semana actual
- **Formato de Salida**:
  ```json
  {
    "day": 1,        // Número del día (0-6, donde 0 es domingo)
    "date": "2024-03-25",
    "value": 15      // Número de usuarios activos
  }
  ```

Características técnicas:
- Uso de `DISTINCT` para evitar duplicados en conteos
- Optimización con eager loading de relaciones
- Formateo de fechas usando funciones nativas de SQLite
- La traducción de días se maneja en el frontend para mejor internacionalización


### Estado y total de permisos
```php
    public function getPermisosTipoStats()
    {
        return SolicitudPermiso::with(['permiso'])
            ->select('permiso_id', DB::raw('count(*) as total'))
            ->groupBy('permiso_id')
            ->get()
            ->map(function ($solicitud) {
                return [
                    'name' => $solicitud->permiso->nombre,
                    'value' => $solicitud->total
                ];
            });
    }
    ````
    Este método proporciona:
    - Distribución de Permisos por Tipo: Cuenta las solicitudes de permisos agrupadas por su categoría
    - Datos Optimizados para Visualización: Formato estructurado para gráficos circulares
    - Análisis de Frecuencia: Identifica los tipos de permisos más solicitados

    Funcionamiento Técnico:
    - Utiliza eager loading (with(['permiso'])) para optimizar consultas relacionales
    - Implementa la función SQL agregada count(*) para calcular totales
    - Emplea agrupación (groupBy('permiso_id')) para segmentar datos por categoría
    - Transforma los resultados a un formato estandarizado para visualización

    Formato de Salida:

    ````
    [
    { "name": "Vacaciones", "value": 45 },
    { "name": "Asuntos propios", "value": 23 },
    { "name": "Baja médica", "value": 12 }
    ]
    ````



###
````
<?php
public function getContratosPorFinalizarStats($diasLimite = 30, $limit = 10)
{
    $fechaLimite = now()->addDays($diasLimite);

    return Contrato::with(['empleado', 'tipoContrato', 'departamento', 'centro'])
        ->whereNotNull('fecha_fin')
        ->whereDate('fecha_fin', '>=', now())
        ->whereDate('fecha_fin', '<=', $fechaLimite)
        ->orderBy('fecha_fin')
        ->limit($limit)
        ->get()
        ->map(function ($contrato) {
            return [
                'id' => $contrato->id,
                'name' => $contrato->empleado->nombre . ' ' . $contrato->empleado->primer_apellido,
                'job' => $contrato->asignacion->nombre ?? 'No especificado',
                'tipoContrato' => $contrato->tipoContrato->nombre ?? 'No especificado',
                'departamento' => $contrato->departamento->nombre ?? 'No especificado',
                'centro' => $contrato->centro->nombre ?? 'No especificado',
                'contractEndDate' => $contrato->fecha_fin->format('Y-m-d'),
                'diasRestantes' => now()->diffInDays($contrato->fecha_fin, false)
            ];
        });
}
````
Este metodo proporciona:
  - Lista Detallada de Contratos Críticos: Muestra información completa de contratos que finalizarán próximamente.
  - Ordenamiento por Urgencia: Prioriza los contratos cuya fecha de finalización es más cercana
  - Información Contextual Completa: Incluye detalles del empleado, puesto, tipo de contrato y ubicación
  - Métricas de Tiempo Restante: Calcula y muestra días restantes hasta la finalización

Funcionamiento Técnico:
  - Utiliza eager loading mediante with() para cargar eficientemente todas las relaciones necesaria
  - Aplica filtrado temporal con claúsulas whereDate para definir el rango de búsqueda
  - Implementa ordenamiento prioritario con orderBy('fecha_fin') para mostrar primero los más urgentes
  - Emplea paginación simple con limit() para controlar el volumen de resultados
  - Formatea y transforma los datos mediante una función de mapeo para optimizar su consumo en frontend

Formato de Salida de datos:
[
  {
    "id": 12,
    "name": "Juan Pérez",
    "job": "Desarrollador Web",
    "tipoContrato": "Temporal",
    "departamento": "Tecnología",
    "centro": "Sede Central",
    "contractEndDate": "2025-04-15",
    "diasRestantes": 12
  }
]


````
<?php
public function getContratosPorRangoFinalizacionStats($diasLimite = 30)
{
    $fechaLimite = now()->addDays($diasLimite);

    $contratos = Contrato::whereNotNull('fecha_fin')
        ->whereDate('fecha_fin', '>=', now())
        ->whereDate('fecha_fin', '<=', $fechaLimite)
        ->get();

    // Clasificar por rangos
    $menos7Dias = 0;
    $entre7y10Dias = 0;
    $entre10y15Dias = 0;
    $mas15Dias = 0;

    foreach ($contratos as $contrato) {
        $diasRestantes = now()->diffInDays($contrato->fecha_fin, false);

        if ($diasRestantes < 7) {
            $menos7Dias++;
        } elseif ($diasRestantes >= 7 && $diasRestantes <= 10) {
            $entre7y10Dias++;
        } elseif ($diasRestantes > 10 && $diasRestantes <= 15) {
            $entre10y15Dias++;
        } else {
            $mas15Dias++;
        }
    }

    return [
        ['title' => '7 días', 'Count' => $menos7Dias],
        ['title' => '10 días', 'Count' => $entre7y10Dias],
        ['title' => '15 días', 'Count' => $entre10y15Dias],
        ['title' => 'Más de 15 días', 'Count' => $mas15Dias]
    ];
}
````
Este metodo proporiona:

-   Distribución por Rangos de Urgencia: Agrupa contratos según proximidad de finalización
-   Visión Agregada: Permite identificar rápidamente volúmenes por período de tiempo
-   Formato para Visualización: Estructura optimizada para gráficos en el dashboard

Funcionamiento Técnico:

-   Ejecuta una consulta única para obtener todos los contratos relevantes
-   Implementa clasificación programática mediante un bucle y condicionales
-   Define rangos temporales estratégicos (7, 10, 15 días) para categorización
-   Genera una estructura de datos estandarizada compatible con componentes de visualización







### 2. Sistema de Broadcast y Canales

```php:routes/channels.php
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    if ((int) $user->id === (int) $id) {
        app(DashboardService::class)->updateUserPresence($user, true);
        return true;
    }
    return false;
});
```

El sistema de canales implementa:
- **Autenticación de Usuarios**: Verifica que cada usuario solo pueda acceder a su propio canal
- **Seguimiento de Presencia**: Registra cuando un usuario se conecta al canal
- **Integración con DashboardService**: Actualiza el estado de presencia automáticamente

### 3. Middleware de Seguimiento

```php:app/Http/Middleware/TrackUserActivity.php
class TrackUserActivity
{
    public function __construct(protected DashboardService $dashboardService)
    {
    }

    public function handle(Request $request, Closure $next)
    {
        if ($request->user()) {
            $this->dashboardService->updateUserPresence($request->user(), true);
        }
        return $next($request);
    }
}
```

El middleware proporciona:
- **Seguimiento Automático**: Monitorea la actividad del usuario en cada petición
- **Actualización de Estado**: Mantiene actualizado el estado de presencia del usuario
- **Integración con DashboardService**: Utiliza el servicio para gestionar los estados

## Flujo de Trabajo

1. **Conexión de Usuario**
   - Usuario inicia sesión
   - Se conecta al canal de broadcast personal
   - El middleware comienza a rastrear su actividad

2. **Mantenimiento de Estado**
   - El sistema mantiene un registro en caché de usuarios activos
   - Se actualiza en tiempo real con cada interacción
   - Expira después de 5 minutos de inactividad

3. **Visualización en Dashboard**
   - Los datos se agrupan por departamento
   - Se muestran estadísticas en tiempo real
   - Se incluyen gráficos de actividad

## Consideraciones Técnicas

### Caché
- Utiliza el sistema de caché predeterminado de Laravel
- No requiere Redis u otros servicios externos
- Mantiene datos por 5 minutos para optimizar recursos

### Broadcast
- Utiliza canales privados para seguridad
- Integrado con el sistema de autenticación de Laravel
- Permite seguimiento en tiempo real

### Rendimiento
- Consultas optimizadas con eager loading
- Uso eficiente de la caché
- Agrupación de datos para reducir consultas

## Mantenimiento

Para mantener el sistema funcionando correctamente:
1. Monitorear los logs de conexión/desconexión
2. Verificar la caché periódicamente
3. Asegurar que los canales de broadcast estén funcionando

## Debugging

Los logs proporcionan información sobre:
- Conexiones de usuarios
- Desconexiones de usuarios
- Errores de autenticación en canales

## Extensibilidad

El sistema está diseñado para ser extensible:
- Fácil adición de nuevas métricas
- Posibilidad de agregar más canales
- Personalización de tiempos de caché

