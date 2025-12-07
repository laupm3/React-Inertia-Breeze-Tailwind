# Sistema de Control de Jobs - Job Logs

Este sistema permite llevar un control completo de todos los jobs ejecutados en Laravel, proporcionando trazabilidad, monitoreo y gestión de trabajos en cola.

## 🚀 Características

- ✅ **Trazabilidad completa**: Registro de todos los jobs ejecutados
- ✅ **Estados en tiempo real**: Pending, Running, Completed, Failed, Cancelled
- ✅ **Relaciones polimórficas**: Conecta jobs con cualquier modelo
- ✅ **Payload personalizable**: Almacena información adicional del job
- ✅ **Manejo de errores**: Captura y almacena errores con stack trace
- ✅ **Métricas de rendimiento**: Tiempo de ejecución y duración
- ✅ **API REST completa**: Para integración con frontend
- ✅ **Trait reutilizable**: Fácil implementación en cualquier job

## 📁 Estructura del Sistema

```
app/
├── Enums/
│   └── JobStatus.php              # Estados de los jobs
├── Models/
│   └── JobLog.php                 # Modelo principal
├── Traits/
│   └── JobLoggable.php            # Trait para jobs
├── Jobs/
│   └── ExportDataJob.php          # Ejemplo de job
├── Http/
│   ├── Controllers/
│   │   ├── JobLogController.php   # Controlador principal
│   │   └── ExportController.php   # Controlador de exportaciones
│   └── Resources/
│       └── JobLogResource.php     # Transformación de datos
└── database/
    └── migrations/
        └── create_job_logs_table.php
```

## 🛠️ Instalación y Configuración

### 1. Migración
```bash
php artisan migrate
```

### 2. Configurar Queue Driver
En `.env`:
```env
QUEUE_CONNECTION=database
```

### 3. Ejecutar Queue Worker
```bash
php artisan queue:work
```

## 📖 Uso del Sistema

### Implementar en un Job

```php
<?php

namespace App\Jobs;

use App\Models\User;
use App\Traits\JobLoggable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class MiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, JobLoggable;

    public function __construct(
        public User $user,
        public array $data = []
    ) {}

    public function handle(): void
    {
        $this->executeWithLogging(
            callback: function () {
                // Tu lógica del job aquí
                $this->updateJobPayload(['step' => 'Procesando datos...']);
                
                // Más lógica...
                $this->updateJobPayload(['step' => 'Completado']);
                
                return 'Resultado del job';
            },
            source: $this->user, // Modelo que disparó el job
            payload: [
                'user_id' => $this->user->id,
                'data' => $this->data,
            ]
        );
    }

    public function failed(\Throwable $exception): void
    {
        $this->markJobAsFailed($exception);
    }
}
```

### Dispatch del Job

```php
// Desde un controlador
MiJob::dispatch($user, ['param1' => 'value1']);

// O usando el helper
dispatch(new MiJob($user, ['param1' => 'value1']));
```

## 🔌 API Endpoints

### Job Logs (Administración)

```http
GET    /api/job-logs              # Listar todos los job logs
GET    /api/job-logs/stats        # Estadísticas
GET    /api/job-logs/{id}         # Ver job log específico
POST   /api/job-logs/{id}/cancel  # Cancelar job
POST   /api/job-logs/{id}/retry   # Reintentar job fallido
DELETE /api/job-logs/cleanup      # Limpiar logs antiguos
```

### Exportaciones (Usuarios)

```http
POST   /api/exports               # Iniciar exportación
GET    /api/exports/status        # Estado de exportaciones del usuario
GET    /api/exports/{id}/status   # Estado de exportación específica
GET    /api/exports/{id}/download # Descargar archivo exportado
```

## 📊 Ejemplos de Uso

### 1. Iniciar Exportación

```javascript
// Frontend - Iniciar exportación
const response = await axios.post('/api/exports', {
    export_type: 'users',
    filters: {
        search: 'john'
    }
});

console.log(response.data.message);
// "Exportación iniciada. Puedes consultar el progreso en el panel de jobs."
```

### 2. Consultar Estado

```javascript
// Frontend - Consultar estado
const status = await axios.get('/api/exports/status');
console.log(status.data.job_logs);

// Ejemplo de respuesta:
{
    "job_logs": [
        {
            "id": 1,
            "job_name": "App\\Jobs\\ExportDataJob",
            "status": {
                "value": "running",
                "label": "Ejecutándose",
                "color": "blue",
                "icon": "play"
            },
            "progress": 60,
            "payload": {
                "step": "Generando archivo...",
                "export_type": "users"
            },
            "created_at": "2025-07-08T21:00:00.000000Z"
        }
    ]
}
```

### 3. Descargar Archivo

```javascript
// Frontend - Descargar archivo completado
const download = await axios.get('/api/exports/1/download');
window.open(download.data.download_url, '_blank');
```

## 🎯 Casos de Uso Comunes

### 1. Exportaciones Masivas
```php
// Exportar usuarios con filtros
ExportDataJob::dispatch(
    user: $user,
    exportType: 'users',
    filters: ['status' => 'active', 'department' => 'IT']
);
```

### 2. Procesamiento de Archivos
```php
// Procesar archivo subido
ProcessFileJob::dispatch(
    user: $user,
    filePath: $uploadedFile->getPathname(),
    options: ['format' => 'csv']
);
```

### 3. Envío de Notificaciones Masivas
```php
// Enviar notificaciones a usuarios
SendBulkNotificationJob::dispatch(
    user: $admin,
    recipients: $userIds,
    message: $notificationData
);
```

## 🔍 Consultas Útiles

### Obtener Jobs por Usuario
```php
$userJobs = JobLog::bySource(User::class, $user->id)
    ->latest()
    ->get();
```

### Jobs Fallidos Recientes
```php
$failedJobs = JobLog::byStatus(JobStatus::FAILED)
    ->where('created_at', '>=', now()->subDay())
    ->get();
```

### Estadísticas por Tipo de Job
```php
$stats = JobLog::selectRaw('job_name, COUNT(*) as total, 
    SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed')
    ->groupBy('job_name')
    ->get();
```

## 🎨 Frontend Integration

### Componente de Progreso

```jsx
import React, { useState, useEffect } from 'react';

const JobProgress = ({ jobId }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await axios.get(`/api/exports/${jobId}/status`);
                setJob(response.data.job_log);
                
                if (!response.data.is_completed && !response.data.is_failed) {
                    setTimeout(checkStatus, 2000); // Poll cada 2 segundos
                }
            } catch (error) {
                console.error('Error checking job status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [jobId]);

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="job-progress">
            <div className="status-badge" style={{ color: job.status.color }}>
                {job.status.label}
            </div>
            <div className="progress-bar">
                <div 
                    className="progress-fill" 
                    style={{ width: `${job.progress}%` }}
                />
            </div>
            <div className="step-info">
                {job.payload?.step || 'Procesando...'}
            </div>
        </div>
    );
};
```

## 🚨 Manejo de Errores

### Errores Comunes y Soluciones

1. **Job no se ejecuta**
   - Verificar que el queue worker esté corriendo
   - Revisar logs en `storage/logs/laravel.log`

2. **Error de permisos**
   - Verificar permisos de escritura en `storage/`
   - Asegurar que el usuario del worker tenga permisos

3. **Jobs fallan repetidamente**
   - Revisar `failed_jobs` table
   - Verificar dependencias y configuración

### Logs de Debug

```php
// En el job
Log::info('Job started', ['job_id' => $this->jobLog->id]);
Log::error('Job failed', ['error' => $exception->getMessage()]);
```

## 📈 Monitoreo y Métricas

### Dashboard de Administración

```php
// Obtener métricas para dashboard
$metrics = [
    'total_jobs' => JobLog::count(),
    'pending_jobs' => JobLog::byStatus(JobStatus::PENDING)->count(),
    'running_jobs' => JobLog::byStatus(JobStatus::RUNNING)->count(),
    'failed_jobs' => JobLog::byStatus(JobStatus::FAILED)->count(),
    'avg_execution_time' => JobLog::whereNotNull('execution_time')->avg('execution_time'),
];
```

### Alertas Automáticas

```php
// En un comando programado
$failedJobs = JobLog::byStatus(JobStatus::FAILED)
    ->where('created_at', '>=', now()->subHour())
    ->count();

if ($failedJobs > 10) {
    // Enviar alerta al administrador
    Mail::to('admin@example.com')->send(new JobFailureAlert($failedJobs));
}
```

## 🔧 Personalización

### Agregar Nuevos Estados

```php
// En JobStatus enum
case CANCELLED = 'cancelled';

public function label(): string
{
    return match($this) {
        // ... otros casos
        self::CANCELLED => 'Cancelado',
    };
}
```

### Campos Adicionales

```php
// En la migración
$table->string('priority')->default('normal');
$table->json('metadata')->nullable();
```

### Hooks Personalizados

```php
// En el trait JobLoggable
protected function onJobCompleted(): void
{
    // Lógica personalizada cuando el job se completa
    event(new JobCompletedEvent($this->jobLog));
}
```

## 📚 Recursos Adicionales

- [Laravel Queue Documentation](https://laravel.com/docs/queues)
- [Laravel Job Batching](https://laravel.com/docs/queues#job-batching)
- [Laravel Horizon](https://laravel.com/docs/horizon)

---
