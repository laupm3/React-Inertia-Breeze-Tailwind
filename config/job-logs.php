<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Job Logs Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for the job logs system.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Default Settings
    |--------------------------------------------------------------------------
    */
    'defaults' => [
        'retention_days' => env('JOB_LOGS_RETENTION_DAYS', 30),
        'max_logs_per_user' => env('JOB_LOGS_MAX_PER_USER', 1000),
        'cleanup_batch_size' => env('JOB_LOGS_CLEANUP_BATCH_SIZE', 100),
    ],

    /*
    |--------------------------------------------------------------------------
    | Job Types Configuration
    |--------------------------------------------------------------------------
    */
    'job_types' => [
        'export' => [
            'timeout' => 300, // 5 minutes
            'tries' => 3,
            'retry_after' => 60,
        ],
        'notification' => [
            'timeout' => 120, // 2 minutes
            'tries' => 5,
            'retry_after' => 30,
        ],
        'processing' => [
            'timeout' => 600, // 10 minutes
            'tries' => 2,
            'retry_after' => 120,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    */
    'notifications' => [
        'enabled' => env('JOB_LOGS_NOTIFICATIONS_ENABLED', true),
        'failed_jobs_threshold' => env('JOB_LOGS_FAILED_THRESHOLD', 10),
        'notification_email' => env('JOB_LOGS_NOTIFICATION_EMAIL', 'admin@example.com'),
    ],

    /*
    |--------------------------------------------------------------------------
    | API Settings
    |--------------------------------------------------------------------------
    */
    'api' => [
        'pagination' => [
            'default' => 15,
            'max' => 100,
        ],
        'rate_limiting' => [
            'enabled' => true,
            'max_requests' => 60,
            'decay_minutes' => 1,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Storage Settings
    |--------------------------------------------------------------------------
    */
    'storage' => [
        'disk' => env('JOB_LOGS_STORAGE_DISK', 'public'),
        'path' => env('JOB_LOGS_STORAGE_PATH', 'exports'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Monitoring Settings
    |--------------------------------------------------------------------------
    */
    'monitoring' => [
        'enabled' => env('JOB_LOGS_MONITORING_ENABLED', true),
        'alert_on_failure' => true,
        'alert_on_timeout' => true,
        'timeout_threshold' => 300, // 5 minutes
    ],

    /*
    |--------------------------------------------------------------------------
    | Cleanup Settings
    |--------------------------------------------------------------------------
    */
    'cleanup' => [
        'enabled' => env('JOB_LOGS_CLEANUP_ENABLED', true),
        'schedule' => 'daily', // daily, weekly, monthly
        'keep_completed' => true,
        'keep_failed' => true,
        'keep_cancelled' => false,
    ],
]; 