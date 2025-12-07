<?php

namespace App\Exceptions\Storage;

class NoFilesProvidedException extends \Exception
{
    public function __construct(string $message = "No se proporcionaron archivos para procesar")
    {
        parent::__construct($message);
    }
}
