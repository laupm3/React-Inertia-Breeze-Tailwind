<?php

namespace App\Exceptions\Storage;

use Illuminate\Support\Collection;

class FileProcessingException extends \Exception
{
    protected array $failedFiles;
    protected ?Collection $successfulFiles = null;

    public function __construct(
        string $message,
        array $failedFiles = [],
        ?Collection $successfulFiles = null
    ) {
        parent::__construct($message);
        $this->failedFiles = $failedFiles;
        $this->successfulFiles = $successfulFiles ?? collect();
    }

    public function getFailedFiles(): array
    {
        return $this->failedFiles;
    }

    public function getSuccessfulFiles(): ?Collection
    {
        return $this->successfulFiles;
    }

    public function hasSuccessfulFiles(): bool
    {
        return $this->successfulFiles->isNotEmpty();
    }

    public function getFailedCount(): int
    {
        return count($this->failedFiles);
    }

    public function getSuccessfulCount(): int
    {
        return $this->successfulFiles->count();
    }
}
