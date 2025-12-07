<?php

namespace App\Console\Commands\Export;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class CleanupExpiredExports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exports:cleanup {--days=7 : Número de días después de los cuales limpiar archivos}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Limpia archivos de exportación expirados y metadatos en cache';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);
        
        $this->info("Limpiando archivos de exportación más antiguos de {$days} días...");
        
        $deletedFiles = $this->cleanupExpiredFiles($cutoffDate);
        $deletedCache = $this->cleanupExpiredCache($cutoffDate);
        $deletedNotifications = $this->cleanupOldNotifications($cutoffDate);
        
        $this->info("Limpieza completada:");
        $this->info("- Archivos eliminados: {$deletedFiles}");
        $this->info("- Metadatos eliminados: {$deletedCache}");
        $this->info("- Notificaciones eliminadas: {$deletedNotifications}");
        
        return 0;
    }
    
    /**
     * Limpiar archivos físicos expirados
     *
     * @param Carbon $cutoffDate
     * @return int
     */
    protected function cleanupExpiredFiles(Carbon $cutoffDate): int
    {
        $deletedFiles = 0;
        
        if (Storage::disk('local')->exists('exports')) {
            $files = Storage::disk('local')->files('exports');
            
            foreach ($files as $file) {
                $lastModified = Carbon::createFromTimestamp(Storage::disk('local')->lastModified($file));
                
                if ($lastModified->lt($cutoffDate)) {
                    Storage::disk('local')->delete($file);
                    $deletedFiles++;
                    $this->line("Eliminado archivo: {$file}");
                }
            }
        }
        
        return $deletedFiles;
    }
    
    /**
     * Limpiar metadatos en cache expirados
     *
     * @param Carbon $cutoffDate
     * @return int
     */
    protected function cleanupExpiredCache(Carbon $cutoffDate): int
    {
        $deletedCache = 0;
        $cacheKeys = Cache::get('export_metadata_keys', []);
        $updatedKeys = [];
        
        foreach ($cacheKeys as $key) {
            $metadata = Cache::get($key);
            
            if ($metadata) {
                $createdAt = Carbon::parse($metadata['created_at']);
                
                if ($createdAt->lt($cutoffDate)) {
                    Cache::forget($key);
                    $deletedCache++;
                    $this->line("Eliminado metadato: {$key}");
                } else {
                    $updatedKeys[] = $key;
                }
            }
        }
        
        Cache::put('export_metadata_keys', $updatedKeys, now()->addDays(30));
        
        return $deletedCache;
    }
    
    /**
     * Limpiar notificaciones antiguas de exportación
     *
     * @param Carbon $cutoffDate
     * @return int
     */
    protected function cleanupOldNotifications(Carbon $cutoffDate): int
    {
        $deletedNotifications = 0;
        $keys = Cache::get('export_notification_keys', []);
        $updatedKeys = [];
        
        foreach ($keys as $key) {
            $notification = Cache::get($key);
            
            if ($notification) {
                $createdAt = Carbon::parse($notification['created_at']);
                
                if ($createdAt->lt($cutoffDate)) {
                    Cache::forget($key);
                    $deletedNotifications++;
                } else {
                    $updatedKeys[] = $key;
                }
            }
        }
        
        Cache::put('export_notification_keys', $updatedKeys, now()->addDays(30));
        
        return $deletedNotifications;
    }
} 