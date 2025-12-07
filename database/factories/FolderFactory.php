<?php

namespace Database\Factories;

use App\Models\ExtensionFichero;
use App\Models\Folder;
use App\Models\NivelAcceso;
use App\Models\NivelSeguridad;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Folder>
 */
class FolderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Folder::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'created_by' => fn(array $attributes) => $attributes['user_id'],
            'nivel_acceso_id' => NivelAcceso::PUBLICO,
            'nivel_seguridad_id' => NivelSeguridad::L1,
            'tipo_fichero_id' => Folder::TIPO_CARPETA,
            'extension_id' => null,
            'name' => $this->faker->word(),
            'path' => 'path/' . $this->faker->word(),
            'hash' => Str::uuid(),
            'size' => 0,
            'is_erasable' => true,
            'is_visible' => true,
            'is_sharable' => true,
            'description' => $this->faker->realText(100),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indica que el modelo es un archivo.
     * 
     * @param ExtensionFichero|null $extension La extensión a usar (opcional)
     * @return $this
     */
    public function file(?ExtensionFichero $extension = null)
    {
        static $defaultExtension = null;

        if (!$extension && $defaultExtension === null) {
            $defaultExtension = ExtensionFichero::first() ??
                new ExtensionFichero(['id' => 1, 'nombre' => 'txt']);
        }

        $ext = $extension ?? $defaultExtension;

        return $this->state(function (array $attributes) use ($ext) {
            return [
                'tipo_fichero_id' => Folder::TIPO_ARCHIVO,
                'extension_id' => $ext->id,
                'name' => $attributes['name'] . '.' . $ext->nombre,
                'size' => $this->faker->numberBetween(1024, 10485760),
            ];
        });
    }

    /**
     * Establece un hash específico para pruebas.
     * 
     * @param string $hash El hash a establecer
     * @return $this
     */
    public function withHash(string $hash)
    {
        return $this->state(['hash' => $hash]);
    }

    /**
     * Establece una ruta específica para pruebas.
     * 
     * @param string $path La ruta a establecer
     * @return $this
     */
    public function withPath(string $path)
    {
        return $this->state(['path' => $path]);
    }

    /**
     * Establece el nivel de acceso a privado.
     * 
     * @return $this
     */
    public function asPrivate()
    {
        return $this->state(['nivel_acceso_id' => NivelAcceso::PRIVADO]);
    }

    /**
     * Simula un elemento en la papelera.
     * 
     * @return $this
     */
    public function inTrash()
    {
        return $this->state(['deleted_at' => now()->subDays(1)]);
    }

    /**
     * Establece la carpeta como hija de otra carpeta.
     * 
     * @param Folder $parent La carpeta padre
     * @return $this
     */
    public function childOf(Folder $parent)
    {
        return $this->state(function (array $attributes) use ($parent) {
            return [
                'parent_id' => $parent->id,
                'path' => $parent->path . '/' . Str::slug($attributes['name'])
            ];
        });
    }
}
