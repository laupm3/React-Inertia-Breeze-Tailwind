<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Export Queue Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración específica para el sistema de colas de exportación
    |
    */

    'default_queue' => env('EXPORT_QUEUE', 'exports'),
    'default_export_max_records' => env('EXPORT_MAX_RECORDS', 100),

    'queues' => [
        'exports' => [
            'connection' => env('EXPORT_QUEUE_CONNECTION', 'database'),
            'table' => env('EXPORT_QUEUE_TABLE', 'jobs'),
            'retry_after' => env('EXPORT_QUEUE_RETRY_AFTER', 300), // 5 minutos
            'timeout' => env('EXPORT_QUEUE_TIMEOUT', 300), // 5 minutos
            'tries' => env('EXPORT_QUEUE_TRIES', 3),
            'max_exceptions' => env('EXPORT_QUEUE_MAX_EXCEPTIONS', 3),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Export Thresholds
    |--------------------------------------------------------------------------
    |
    | Umbrales para decidir cuándo usar cola vs exportación directa
    |
    */

    'thresholds' => [
        'xlsx' => [
            'direct_export_max_records' => env('XLSX_DIRECT_EXPORT_MAX_RECORDS', 100),
            'queue_recommended_min_records' => env('XLSX_QUEUE_RECOMMENDED_MIN_RECORDS', 1000),
        ],
        'csv' => [
            'direct_export_max_records' => env('CSV_DIRECT_EXPORT_MAX_RECORDS', 100),
            'queue_recommended_min_records' => env('CSV_QUEUE_RECOMMENDED_MIN_RECORDS', 500),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | File Storage Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración para el almacenamiento de archivos de exportación
    |
    */

    'storage' => [
        'disk' => config('filesystems.default'),
        'path' => env('EXPORT_STORAGE_PATH', 'exports'),
        'delete_after_download' => env('EXPORT_DELETE_AFTER_DOWNLOAD', true),
        'expiration_days' => env('EXPORT_FILE_EXPIRATION_DAYS', 1),
        'max_file_size_mb' => env('EXPORT_MAX_FILE_SIZE_MB', 100),
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración para optimizar el rendimiento de las exportaciones
    |
    */

    'performance' => [
        'chunk_size' => env('EXPORT_CHUNK_SIZE', 500),
        'memory_limit' => env('EXPORT_MEMORY_LIMIT', '512M'),
        'max_execution_time' => env('EXPORT_MAX_EXECUTION_TIME', 300),
        'records_per_second_estimate' => env('EXPORT_RECORDS_PER_SECOND', 100),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración para las notificaciones de exportación
    |
    */

    'notifications' => [
        'cache_ttl_hours' => env('EXPORT_NOTIFICATION_CACHE_TTL', 24),
        'enable_email_notifications' => env('EXPORT_ENABLE_EMAIL_NOTIFICATIONS', false),
        'enable_browser_notifications' => env('EXPORT_ENABLE_BROWSER_NOTIFICATIONS', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Monitoring Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración para el monitoreo de exportaciones
    |
    */

    'monitoring' => [
        'enable_logging' => env('EXPORT_ENABLE_LOGGING', true),
        'log_level' => env('EXPORT_LOG_LEVEL', 'info'),
        'enable_metrics' => env('EXPORT_ENABLE_METRICS', false),
        'metrics_prefix' => env('EXPORT_METRICS_PREFIX', 'export'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cleanup Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración para la limpieza automática de archivos
    |
    */

    'cleanup' => [
        'enabled' => env('EXPORT_CLEANUP_ENABLED', true),
        'schedule' => env('EXPORT_CLEANUP_SCHEDULE', 'daily'),
        'older_than_days' => env('EXPORT_CLEANUP_OLDER_THAN_DAYS', 7),
        'batch_size' => env('EXPORT_CLEANUP_BATCH_SIZE', 100),
    ],

];
