<?php

namespace Tests\Unit\Storage;

use Tests\TestCase;
use App\Models\Folder;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Support\Facades\Storage;
use App\Services\Storage\LocalFileStorage;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\File;

class LocalFileStorageTest extends TestCase
{
    use DatabaseTransactions;

    protected LocalFileStorage $localStorage;
    protected $disk;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear disco falso para las pruebas
        Storage::fake('local');
        $this->disk = Storage::disk('local');

        // Inicializar el storage con el disco falso
        $this->localStorage = new LocalFileStorage();

        // Crear carpetas base que requiere el sistema
        $this->disk->makeDirectory('folders');
        $this->disk->makeDirectory('files');
        $this->disk->makeDirectory('trash');
        $this->disk->makeDirectory('trash/metadata');
    }

    #[Test]
    public function puede_crear_un_directorio()
    {
        // Preparar - Usando la factory
        $folder = Folder::factory()
            ->withPath('carpeta_test')
            ->withHash('abc123')
            ->create();

        // Ejecutar
        $result = $this->localStorage->createDirectory($folder);

        // Verificar
        $this->assertTrue($result);
        $this->assertTrue($this->localStorage->directoryExists($folder));
    }

    #[Test]
    public function puede_verificar_si_un_directorio_existe()
    {
        // Preparar
        $folder = Folder::factory()
            ->withPath('carpeta_existe')
            ->withHash('def456')
            ->create();

        // Crear directorio usando el método que estamos probando
        $this->localStorage->createDirectory($folder);

        // Ejecutar y Verificar
        $this->assertTrue($this->localStorage->directoryExists($folder));

        // Verificar el caso negativo
        $folderNoExiste = Folder::factory()
            ->withPath('carpeta_no_existe')
            ->withHash('xyz999')
            ->create();

        $this->assertFalse($this->localStorage->directoryExists($folderNoExiste));
    }

    #[Test]
    public function puede_eliminar_un_directorio()
    {
        // Preparar
        $folder = Folder::factory()
            ->withPath('carpeta_eliminar')
            ->withHash('ghi789')
            ->create();

        // Crear directorio y archivo usando el método que estamos probando
        $this->setupInitialStructure($folder, 'contenido');

        // Verificar que existe antes de eliminar
        $this->assertTrue($this->localStorage->directoryExists($folder));

        // Ejecutar
        $result = $this->localStorage->deleteDirectory($folder);

        // Verificar
        $this->assertTrue($result);
        $this->assertFalse($this->localStorage->directoryExists($folder));
    }

    #[Test]
    public function puede_mover_un_directorio()
    {
        // 1. Preparar - Crear una carpeta vieja con contenido
        $oldFolder = Folder::factory()
            ->withPath('carpeta_vieja')
            ->withHash('old_dir_hash')
            ->create();

        // Crear un archivo dentro de la carpeta vieja con un hash ÚNICO
        $fileHash = 'file_' . uniqid();
        $oldFile = Folder::factory()
            ->file()
            ->childOf($oldFolder)
            ->withHash($fileHash)
            ->create();

        // Crear la estructura física
        $this->localStorage->createDirectory($oldFolder);
        $this->localStorage->putFile($oldFile, 'contenido de prueba');

        // Verificar que la estructura inicial existe
        $this->assertTrue($this->localStorage->directoryExists($oldFolder));
        $this->assertEquals('contenido de prueba', $this->localStorage->getFile($oldFile));

        // 2. Preparar - Crear una carpeta nueva (destino)
        $newFolder = Folder::factory()
            ->withPath('carpeta_nueva')
            ->withHash('new_dir_hash')
            ->create();

        // Verificar que la carpeta nueva no existe físicamente
        $this->assertFalse($this->localStorage->directoryExists($newFolder));

        // 3. Ejecutar - Mover el directorio
        $result = $this->localStorage->moveDirectory($newFolder, $oldFolder->path);

        // 4. Verificar - El movimiento fue exitoso
        $this->assertTrue($result, "El movimiento del directorio falló");

        // 5. Verificar - La carpeta vieja ya no existe
        $this->assertFalse(
            $this->localStorage->directoryExists($oldFolder),
            "La carpeta original sigue existiendo después del movimiento"
        );

        // 6. Verificar - La carpeta nueva existe
        $this->assertTrue(
            $this->localStorage->directoryExists($newFolder),
            "La carpeta destino no existe después del movimiento"
        );

        // 7. Verificar - El contenido se movió correctamente
        // IMPORTANTE: No creamos un nuevo archivo, sino que actualizamos la referencia
        // del archivo viejo para que apunte a la nueva ubicación
        $oldFile->parent_id = $newFolder->id;
        $oldFile->path = $newFolder->path . '/' . basename($oldFile->path);
        $oldFile->save();

        // Verificar que el archivo existe y tiene el mismo contenido
        $this->assertEquals(
            'contenido de prueba',
            $this->localStorage->getFile($oldFile),
            "El contenido del archivo no se movió correctamente"
        );
    }

    #[Test]
    public function puede_guardar_y_recuperar_un_archivo()
    {
        // Preparar
        $file = Folder::factory()
            ->file()
            ->withPath('archivo.txt')
            ->withHash('mno345')
            ->create();

        $content = 'Este es el contenido del archivo';

        // Ejecutar - Guardar
        $result = $this->localStorage->putFile($file, $content);

        // Verificar guardado
        $this->assertTrue($result);

        // Ejecutar - Recuperar
        $retrievedContent = $this->localStorage->getFile($file);

        // Verificar contenido
        $this->assertEquals($content, $retrievedContent);
    }

    #[Test]
    public function puede_mover_a_papelera_y_restaurar()
    {
        // Preparar
        $folder = Folder::factory()
            ->withPath('carpeta_papelera')
            ->withHash('pqr678')
            ->create();

        // Crear directorio con el método que estamos probando
        $this->setupInitialStructure($folder, 'contenido');

        // Verificar que existe antes de mover a papelera
        $this->assertTrue($this->localStorage->directoryExists($folder));

        // Ejecutar - Mover a papelera
        $result = $this->localStorage->moveToTrash($folder);

        // Verificar
        $this->assertTrue($result);
        $this->assertFalse($this->localStorage->directoryExists($folder));

        // Verificar que está en la papelera
        $trashItems = $this->localStorage->listTrashItems();
        $this->assertGreaterThanOrEqual(1, count($trashItems));

        // Buscar nuestro elemento en la papelera
        $found = false;
        foreach ($trashItems as $item) {
            if ($item['hash'] === $folder->hash) {
                $found = true;
                break;
            }
        }
        $this->assertTrue($found, "El elemento no se encontró en la papelera");

        // Ejecutar - Restaurar
        $result = $this->localStorage->restoreFromTrash($folder);

        // Verificar
        $this->assertTrue($result);
        $this->assertTrue($this->localStorage->directoryExists($folder));

        // Verificar que ya no está en la papelera
        $trashItems = $this->localStorage->listTrashItems();
        $found = false;
        foreach ($trashItems as $item) {
            if ($item['hash'] === $folder->hash) {
                $found = true;
                break;
            }
        }
        $this->assertFalse($found, "El elemento sigue en la papelera después de restaurar");
    }

    #[Test]
    public function puede_listar_elementos_en_papelera()
    {
        // Limpiar la papelera (aunque esté vacía por Storage::fake)
        $this->disk->deleteDirectory('trash');
        $this->disk->makeDirectory('trash');
        $this->disk->makeDirectory('trash/metadata');

        // Preparar - Mover varios elementos a la papelera
        $uniquePrefix = 'test_' . uniqid();

        $folder1 = Folder::factory()->withHash($uniquePrefix . '_folder1')->create();
        $folder2 = Folder::factory()->withHash($uniquePrefix . '_folder2')->create();
        $file1 = Folder::factory()->file()->withHash($uniquePrefix . '_file1')->create();

        // Crear estructuras iniciales
        $this->setupInitialStructure($folder1);
        $this->setupInitialStructure($folder2);
        $this->setupInitialStructure($file1, 'contenido archivo');

        // Mover a papelera usando la implementación que estamos probando
        $this->localStorage->moveToTrash($folder1);
        $this->localStorage->moveToTrash($folder2);
        $this->localStorage->moveToTrash($file1);

        // Ejecutar
        $allTrashItems = $this->localStorage->listTrashItems();

        // Filtrar solo nuestros elementos
        $ourTrashItems = array_filter($allTrashItems, function ($item) use ($uniquePrefix) {
            return strpos($item['hash'], $uniquePrefix) === 0;
        });

        // Verificar
        $this->assertCount(3, $ourTrashItems);

        // Verificar paginación - usando solo nuestros elementos si es posible
        $limitedItems = $this->localStorage->listTrashItems(1, 0);
        $this->assertLessThanOrEqual(1, count($limitedItems));
    }

    #[Test]
    public function puede_crear_estructura_jerarquica_de_carpetas()
    {
        // Crear una carpeta padre
        $parent = Folder::factory()
            ->withPath('carpeta_padre')
            ->withHash('parent123')
            ->create();

        // Crear una carpeta hija usando childOf()
        $child = Folder::factory()
            ->childOf($parent)
            ->withHash('child456')
            ->create();

        // Verificar relación en la BD
        $this->assertEquals($parent->id, $child->parent_id);
        $this->assertStringContainsString($parent->path, $child->path);

        // Crear la estructura física usando los métodos que estamos probando
        $result1 = $this->localStorage->createDirectory($parent);
        $result2 = $this->localStorage->createDirectory($child);

        // Verificar que se crearon físicamente
        $this->assertTrue($result1);
        $this->assertTrue($result2);
        $this->assertTrue($this->localStorage->directoryExists($parent));
        $this->assertTrue($this->localStorage->directoryExists($child));
    }

    #[Test]
    public function puede_mover_archivos_entre_carpetas()
    {
        // Crear una estructura de carpetas
        $folder1 = Folder::factory()->withHash('folder1')->create();
        $folder2 = Folder::factory()->withHash('folder2')->create();

        // Crear directorios usando los métodos que estamos probando
        $this->localStorage->createDirectory($folder1);
        $this->localStorage->createDirectory($folder2);

        // Crear un archivo en la primera carpeta
        $file = Folder::factory()
            ->file()
            ->childOf($folder1)
            ->withHash('file789')
            ->create();

        $this->localStorage->putFile($file, 'contenido del archivo');

        // Verificar que el archivo existe y se puede leer
        $content = $this->localStorage->getFile($file);
        $this->assertEquals('contenido del archivo', $content);

        // Mover el archivo a otra carpeta
        $oldPath = $file->path;
        $file->path = $folder2->path . '/' . basename($file->path);
        $file->parent_id = $folder2->id;
        $file->save();

        // Ejecutar movimiento físico
        $result = $this->localStorage->moveDirectory($file, $oldPath);

        // Verificar que el movimiento fue exitoso
        $this->assertTrue($result);

        // Verificar que el contenido sigue siendo accesible
        $newContent = $this->localStorage->getFile($file);
        $this->assertEquals('contenido del archivo', $newContent);
    }

    /**
     * Crea una estructura inicial para pruebas
     */
    protected function setupInitialStructure(Folder $folder, ?string $content = null): void
    {
        // Si es un directorio
        if ($folder->tipo_fichero_id == Folder::TIPO_CARPETA) {
            $this->localStorage->createDirectory($folder);

            // Si pasamos contenido, crear un archivo dentro
            if ($content !== null) {
                $dummyFile = Folder::factory()
                    ->file()
                    ->childOf($folder)
                    ->withHash($folder->hash . '_file')
                    ->create();

                $this->localStorage->putFile($dummyFile, $content);
            }
        }
        // Si es un archivo
        else {
            $this->localStorage->putFile($folder, $content ?? 'contenido predeterminado');
        }
    }
}
