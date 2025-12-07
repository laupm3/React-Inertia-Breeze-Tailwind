<?php

namespace App\Traits;

use App\Models\File;
use App\Events\Storage\Files\Nominas\NominaFileCreated;
use App\Events\Storage\Files\Nominas\NominaFileUpdated;
use App\Events\Storage\Files\Nominas\NominaFileDeleted;

trait HandlesNominaFiles
{
    /**
     * Determina si un archivo es una nómina basándose en su path
     *
     * @param File $file
     * @return bool
     */
    public function isNominaFile(File $file): bool
    {
        // Verificar si es un archivo (no una carpeta)
        if ($this->isFolderType($file)) {
            return false;
        }

        // Verificar si el path contiene la cadena "Nominas"
        return strpos($file->path, '/Nominas/') !== false ||
               (strpos($file->nombre, 'Nomina_') !== false && preg_match('/_\d{4}_/', $file->nombre));
    }

    /**
     * Determina si un archivo es una carpeta
     *
     * @param File $file
     * @return bool
     */
    protected function isFolderType(File $file): bool
    {
        $folderTypeId = \App\Models\TipoFichero::where('nombre', 'Carpeta')->first()?->id;
        return $file->tipo_fichero_id === $folderTypeId;
    }

    /**
     * Dispara el evento correspondiente para la creación de un archivo de nómina
     *
     * @param File $file
     * @return void
     */
    public function dispatchNominaCreatedEvent(File $file): void
    {
        if ($this->isNominaFile($file)) {
            event(new NominaFileCreated($file));
        }
    }

    /**
     * Dispara el evento correspondiente para la actualización de un archivo de nómina
     *
     * @param File $file
     * @return void
     */
    public function dispatchNominaUpdatedEvent(File $file): void
    {
        if ($this->isNominaFile($file)) {
            event(new NominaFileUpdated($file));
        }
    }

    /**
     * Dispara el evento correspondiente para la eliminación de un archivo de nómina
     *
     * @param File $file
     * @return void
     */
    public function dispatchNominaDeletedEvent(File $file): void
    {
        if ($this->isNominaFile($file)) {
            event(new NominaFileDeleted($file));
        }
    }
}
