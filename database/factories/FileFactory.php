<?php

namespace Database\Factories;

use App\Models\File;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\File>
 */
class FileFactory extends Factory
{
    protected $model = File::class;
    
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'parent_id' => null,
            'hash' => Str::uuid(),
            'size' => $this->faker->numberBetween(100, 5000) * 1024,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Generate a folder in the storage 
     */
    public function withFolder(array $attributes = [])
    {
        $file = $this->create($attributes);

        if (!Storage::disk(File::DISK)->exists($file->path)) {
            Storage::disk(File::DISK)->makeDirectory($file->path);
        }

        return $file;
    }


    /**
     * Generate a file in the storage
     */
    public function withFile(array $attributes = [], string $content = '')
    {
        $file = $this->create($attributes);

        if (!Storage::disk(File::DISK)->exists($file->path)) {
            Storage::disk(File::DISK)->put($file->path, $content);
        }

        return $file;
    }
    
}
