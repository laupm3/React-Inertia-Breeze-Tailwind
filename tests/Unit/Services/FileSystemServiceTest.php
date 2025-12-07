<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Models\Folder;
use App\Interfaces\FileStorageInterface;
use App\Services\Storage\FileSystemService;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Log;
use Mockery;

class FileSystemServiceTest extends TestCase
{
    use DatabaseTransactions;

    protected FileSystemService $service;
    protected $mockStorage;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear un mock de FileStorageInterface
        $this->mockStorage = Mockery::mock(FileStorageInterface::class);

        // Inyectar el mock en el servicio
        $this->service = new FileSystemService($this->mockStorage);

        // Desactivar logging verboso para pruebas
        $this->service->setVerboseLogging(false);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function crea_directorio_correctamente()
    {
        // Preparar
        $folder = Folder::factory()->create();

        // Configurar expectativa del mock
        $this->mockStorage->shouldReceive('createDirectory')
            ->once()
            ->with($folder)
            ->andReturn(true);

        // Ejecutar
        $result = $this->service->createDirectory($folder);

        // Verificar
        $this->assertTrue($result);
    }

    #[Test]
    public function maneja_excepcion_al_crear_directorio()
    {
        // Preparar
        $folder = Folder::factory()->create();

        // Configurar mock para lanzar excepción
        $this->mockStorage->shouldReceive('createDirectory')
            ->once()
            ->with($folder)
            ->andThrow(new \Exception('Error simulado'));

        // Esperar que se registre el error
        Log::shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) use ($folder) {
                return strpos($message, 'Error al crear directorio') !== false &&
                    $context['path'] === $folder->path;
            });

        // Ejecutar
        $result = $this->service->createDirectory($folder);

        // Verificar que retorna false cuando hay excepción
        $this->assertFalse($result);
    }

    #[Test]
    public function elimina_directorio_correctamente()
    {
        // Preparar
        $folder = Folder::factory()->create();

        // Configurar expectativa para el método deleteDirectory
        $this->mockStorage->shouldReceive('deleteDirectory')
            ->once()
            ->with($folder)
            ->andReturn(true);

        // Ejecutar - eliminar con force=true
        $result = $this->service->deleteDirectory($folder, true);

        // Verificar
        $this->assertTrue($result);
    }

    #[Test]
    public function mueve_a_papelera_cuando_elimina_sin_force()
    {
        // Preparar
        $folder = Folder::factory()->create();

        // Configurar expectativa para moveToTrash
        $this->mockStorage->shouldReceive('moveToTrash')
            ->once()
            ->with($folder)
            ->andReturn(true);

        // Ejecutar - eliminar sin force (papelera)
        $result = $this->service->deleteDirectory($folder, false);

        // Verificar
        $this->assertTrue($result);
    }

    #[Test]
    public function mueve_directorio_correctamente()
    {
        // Preparar
        $folder = Folder::factory()->create();
        $oldPath = 'old/path';

        // Configurar expectativa
        $this->mockStorage->shouldReceive('moveDirectory')
            ->once()
            ->with($folder, $oldPath)
            ->andReturn(true);

        // Ejecutar
        $result = $this->service->moveDirectory($folder, $oldPath);

        // Verificar
        $this->assertTrue($result);
    }

    #[Test]
    public function rechaza_acciones_de_archivos_para_carpetas()
    {
        // Preparar - Crear una carpeta real (no un archivo)
        $folder = Folder::factory()->create([
            'tipo_fichero_id' => Folder::TIPO_CARPETA // Usa la constante correcta para tipo carpeta
        ]);

        // Verificar que el método de tu modelo funciona como esperamos
        $this->assertFalse($folder->esArchivo(), "La carpeta no debería identificarse como archivo");

        // No debería llamar al método del almacenamiento
        $this->mockStorage->shouldNotReceive('putFile');

        // Ejecutar
        $result = $this->service->putFile($folder, 'contenido');

        // Verificar
        $this->assertFalse($result);
    }

    #[Test]
    public function guarda_archivo_correctamente()
    {
        // Preparar
        $file = Folder::factory()->file()->create();
        $content = 'Contenido del archivo';

        // Configurar expectativa
        $this->mockStorage->shouldReceive('putFile')
            ->once()
            ->with($file, $content)
            ->andReturn(true);

        // Ejecutar
        $result = $this->service->putFile($file, $content);

        // Verificar
        $this->assertTrue($result);
    }

    #[Test]
    public function lee_archivo_correctamente()
    {
        // Preparar
        $file = Folder::factory()->file()->create();
        $content = 'Contenido del archivo';

        // Configurar expectativa
        $this->mockStorage->shouldReceive('getFile')
            ->once()
            ->with($file)
            ->andReturn($content);

        // Ejecutar
        $result = $this->service->getFile($file);

        // Verificar
        $this->assertEquals($content, $result);
    }

    #[Test]
    public function asegura_que_directorio_existe_creandolo_si_es_necesario()
    {
        // Preparar
        $folder = Folder::factory()->create();

        // Caso 1: El directorio no existe
        $this->mockStorage->shouldReceive('directoryExists')
            ->once()
            ->with($folder)
            ->andReturn(false);

        $this->mockStorage->shouldReceive('createDirectory')
            ->once()
            ->with($folder)
            ->andReturn(true);

        // Ejecutar - debería crearse
        $result = $this->service->ensureDirectoryExists($folder);

        // Verificar
        $this->assertTrue($result);

        // Caso 2: El directorio ya existe
        $this->mockStorage->shouldReceive('directoryExists')
            ->once()
            ->with($folder)
            ->andReturn(true);

        // No debería llamar a createDirectory

        // Ejecutar - no debería crearse
        $result = $this->service->ensureDirectoryExists($folder);

        // Verificar
        $this->assertTrue($result);
    }

    #[Test]
    public function restaura_desde_papelera_correctamente()
    {
        // Preparar
        $folder = Folder::factory()->create();
        $customDestination = 'custom/path';

        // Configurar expectativa
        $this->mockStorage->shouldReceive('restoreFromTrash')
            ->once()
            ->with($folder, $customDestination)
            ->andReturn(true);

        // Ejecutar
        $result = $this->service->restoreFromTrash($folder, $customDestination);

        // Verificar
        $this->assertTrue($result);
    }

    #[Test]
    public function lista_elementos_en_papelera()
    {
        // Preparar datos de ejemplo en la papelera
        $trashItems = [
            ['hash' => 'abc123', 'path' => 'folder1'],
            ['hash' => 'def456', 'path' => 'folder2']
        ];

        // Configurar expectativa
        $this->mockStorage->shouldReceive('listTrashItems')
            ->once()
            ->with(10, 5)
            ->andReturn($trashItems);

        // Ejecutar
        $result = $this->service->listTrashItems(10, 5);

        // Verificar
        $this->assertSame($trashItems, $result);
        $this->assertCount(2, $result);
    }

    #[Test]
    public function maneja_errores_en_list_trash_items()
    {
        // Configurar mock para lanzar excepción
        $this->mockStorage->shouldReceive('listTrashItems')
            ->once()
            ->andThrow(new \Exception('Error al listar'));

        // Ejecutar
        $result = $this->service->listTrashItems();

        // Verificar que devuelve array vacío cuando hay error
        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    #[Test]
    public function sincroniza_directorios_correctamente()
    {
        // Crear algunas carpetas para la prueba
        $folders = Folder::factory()->count(3)->create();

        // Mockear la consulta para devolver estas carpetas
        // (Esto es más complicado y puede requerir un enfoque diferente)

        // Configurar expectativas para ensureDirectoryExists
        $this->mockStorage->shouldReceive('directoryExists')
            ->times(3)
            ->andReturn(false);

        $this->mockStorage->shouldReceive('createDirectory')
            ->times(3)
            ->andReturn(true);

        // Ejecutar
        $result = $this->service->syncAllDirectories(true, 5);

        // Verificar
        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
    }

    #[Test]
    public function permite_cambiar_implementacion_de_almacenamiento()
    {
        // Preparar
        $newStorage = Mockery::mock(FileStorageInterface::class);
        $folder = Folder::factory()->create();

        // Configurar expectativa en el nuevo storage
        $newStorage->shouldReceive('directoryExists')
            ->once()
            ->with($folder)
            ->andReturn(true);

        // Ejecutar - cambiar implementación
        $this->service->useStorage($newStorage);

        // Verificar que usa el nuevo storage
        $result = $this->service->ensureDirectoryExists($folder);
        $this->assertTrue($result);
    }

    #[Test]
    public function activa_logging_verboso()
    {
        // Preparar
        $folder = Folder::factory()->create();

        // Configurar mock para fallar
        $this->mockStorage->shouldReceive('createDirectory')
            ->once()
            ->with($folder)
            ->andReturn(false);

        // Activar logging verboso
        $this->service->setVerboseLogging(true);

        // Esperar llamada al log
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function ($message) {
                return strpos($message, 'No se pudo crear directorio') !== false;
            });

        // Ejecutar
        $result = $this->service->createDirectory($folder);

        // Verificar el resultado de la operación
        $this->assertFalse($result, 'La operación debería fallar');

        // Verificar que el estado de logging verboso está activado
        $this->assertTrue(
            $this->service->isVerboseLoggingEnabled(),
            'El logging verboso debería estar activado'
        );
    }

    #[Test]
    public function desactiva_logging_verboso()
    {
        // Preparar
        $folder = Folder::factory()->create();

        // Configurar mock para fallar
        $this->mockStorage->shouldReceive('createDirectory')
            ->once()
            ->with($folder)
            ->andReturn(false);

        // Desactivar logging verboso
        $this->service->setVerboseLogging(false);

        // No debería logear con verbose off
        Log::shouldReceive('warning')->never();

        // Ejecutar
        $result = $this->service->createDirectory($folder);

        // Verificar el resultado de la operación
        $this->assertFalse($result, 'La operación debería fallar');

        // Verificar que el estado de logging verboso está desactivado
        $this->assertFalse(
            $this->service->isVerboseLoggingEnabled(),
            'El logging verboso debería estar desactivado'
        );
    }
}
