<?php

namespace Tests\Unit\Services\Storage;

use App\Models\ExtensionFichero;
use App\Models\Folder;
use App\Models\User;
use App\Services\Storage\FolderService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FolderServiceTest extends TestCase
{
    use DatabaseTransactions;

    protected FolderService $folderService;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->folderService = new FolderService();

        // Crear un usuario para las pruebas
        $this->user = User::factory()->create();

        // Limpiar la caché entre pruebas
        Cache::flush();
    }

    #[Test]
    public function it_creates_a_simple_path()
    {
        $result = $this->folderService->createPath('test_folder', [], $this->user);

        $this->assertInstanceOf(Folder::class, $result);
        $this->assertEquals('test_folder', $result->path);
        $this->assertEquals('test_folder', $result->name);
        $this->assertTrue($result->esCarpeta());
        $this->assertEquals(0, $result->size);
        $this->assertEquals($this->user->id, $result->user_id);
    }

    #[Test]
    public function it_creates_a_nested_path()
    {
        $result = $this->folderService->createPath('level1/level2/level3', [], $this->user);

        $this->assertInstanceOf(Folder::class, $result);
        $this->assertEquals('level1/level2/level3', $result->path);
        $this->assertEquals('level3', $result->name);

        // Verificar que se crearon todas las carpetas intermedias
        $this->assertDatabaseHas('folders', ['path' => 'level1']);
        $this->assertDatabaseHas('folders', ['path' => 'level1/level2']);
        $this->assertDatabaseHas('folders', ['path' => 'level1/level2/level3']);
    }

    #[Test]
    public function it_reuses_existing_folders_in_path()
    {
        // Crear primero level1
        $folder1 = $this->folderService->createPath('level1', [], $this->user);

        // Ahora crear la ruta completa
        $result = $this->folderService->createPath('level1/level2/level3', [], $this->user);

        $this->assertEquals('level1/level2/level3', $result->path);

        // Verificar que level1 es el mismo que se creó antes
        $reloadedFolder1 = Folder::where('path', 'level1')->first();
        $this->assertEquals($folder1->id, $reloadedFolder1->id);
    }

    #[Test]
    public function it_creates_a_path_with_custom_name()
    {
        $result = $this->folderService->createPath('custom_path', ['name' => 'Custom Name'], $this->user);

        $this->assertInstanceOf(Folder::class, $result);
        $this->assertEquals('custom_path', $result->path);
        $this->assertEquals('Custom Name', $result->name);
        $this->assertTrue($result->esCarpeta());
        $this->assertEquals(0, $result->size);
        $this->assertEquals($this->user->id, $result->user_id);
    }

    #[Test]
    public function it_throws_exception_for_empty_path()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->folderService->createPath('', [], $this->user);
    }

    #[Test]
    public function it_creates_subfolder_in_parent()
    {
        // Crear carpeta padre
        $parent = $this->folderService->createPath('parent_folder', [], $this->user);

        // Crear subcarpeta
        $subfolder = $this->folderService->createSubfolder($parent, 'child_folder', [], $this->user);

        $this->assertEquals('parent_folder/child_folder', $subfolder->path);
        $this->assertEquals('child_folder', $subfolder->name);
        $this->assertEquals($parent->id, $subfolder->parent_id);
    }

    #[Test]
    public function it_creates_nested_subfolders()
    {
        $parent = $this->folderService->createPath('parent_folder', [], $this->user);

        $subfolder = $this->folderService->createSubfolder(
            $parent,
            'child/grandchild/greatgrandchild',
            [],
            $this->user
        );

        $this->assertEquals('parent_folder/child/grandchild/greatgrandchild', $subfolder->path);

        // Verificar que se crearon todas las subcarpetas intermedias
        $this->assertDatabaseHas('folders', ['path' => 'parent_folder/child']);
        $this->assertDatabaseHas('folders', ['path' => 'parent_folder/child/grandchild']);
    }

    #[Test]
    public function it_moves_folder_to_new_location()
    {
        // Crear estructura inicial
        $sourceFolder = $this->folderService->createPath('source/subfolder', [], $this->user);
        $targetFolder = $this->folderService->createPath('target', [], $this->user);

        // Mover la carpeta
        $result = $this->folderService->moveFolder($sourceFolder, $targetFolder);

        // Verificar que se movió correctamente
        $this->assertEquals('target/subfolder', $result->fresh()->path);

        // Verificar que ya no existe en la ruta original
        $this->assertDatabaseMissing('folders', ['path' => 'source/subfolder']);
    }

    #[Test]
    public function it_moves_folder_with_contents()
    {
        // Crear estructura con contenido
        $sourceFolder = $this->folderService->createPath('source/folder_to_move', [], $this->user);

        // Crear una subcarpeta y un archivo dentro del origen
        $this->folderService->createSubfolder($sourceFolder, 'subfolder', [], $this->user);

        // Crear un archivo en la carpeta de origen
        $extensionId = $this->folderService->getOrCreateExtensionId('txt');
        $this->folderService->createFile($sourceFolder, 'test.txt', [
            'extension_id' => $extensionId
        ], $this->user);

        // Crear carpeta destino
        $targetFolder = $this->folderService->createPath('target', [], $this->user);

        // Mover la carpeta
        $result = $this->folderService->moveFolder($sourceFolder, $targetFolder);

        // Verificar que la carpeta principal se movió
        $this->assertEquals('target/folder_to_move', $result->fresh()->path);

        // Verificar que el contenido también se movió
        $this->assertDatabaseHas('folders', ['path' => 'target/folder_to_move/subfolder']);
        $this->assertDatabaseHas('folders', ['path' => 'target/folder_to_move/test.txt']);
    }

    #[Test]
    public function it_throws_exception_when_moving_folder_to_itself()
    {
        $folder = $this->folderService->createPath('folder', [], $this->user);

        $this->expectException(\LogicException::class);
        $this->expectExceptionMessage('Node must not be a descendant');
        $this->folderService->moveFolder($folder, $folder);
    }

    #[Test]
    public function it_deletes_folder_and_contents()
    {
        // Crear estructura con contenido
        $folder = $this->folderService->createPath('parent', [], $this->user);
        $this->folderService->createSubfolder($folder, 'child', [], $this->user);

        // Borrar la carpeta
        $result = $this->folderService->deleteFolder($folder);

        $this->assertTrue($result);

        // En soft delete, los registros deben seguir existiendo pero con deleted_at
        $this->assertSoftDeleted('folders', ['path' => 'parent']);
        $this->assertSoftDeleted('folders', ['path' => 'parent/child']);
    }

    #[Test]
    public function it_force_deletes_folder_permanently()
    {
        $folder = $this->folderService->createPath('to_delete', [], $this->user);

        $result = $this->folderService->deleteFolder($folder, true);

        $this->assertTrue($result);

        // Los registros no deben existir en absoluto
        $this->assertDatabaseMissing('folders', ['path' => 'to_delete']);
    }

    #[Test]
    public function it_creates_file_in_folder()
    {
        // Crear carpeta y extensión
        $folder = $this->folderService->createPath('files', [], $this->user);
        $extensionId = $this->folderService->getOrCreateExtensionId('pdf');

        // Crear archivo
        $file = $this->folderService->createFile(
            $folder,
            'document.pdf',
            ['extension_id' => $extensionId, 'size' => 1024],
            $this->user
        );

        $this->assertInstanceOf(Folder::class, $file);
        $this->assertEquals('files/document.pdf', $file->path);
        $this->assertEquals('document.pdf', $file->name);
        $this->assertEquals(1024, $file->size);
        $this->assertEquals($extensionId, $file->extension_id);
        $this->assertTrue($file->esArchivo());
        $this->assertFalse($file->esCarpeta());
    }

    #[Test]
    public function it_sanitizes_file_names()
    {
        $folder = $this->folderService->createPath('files', [], $this->user);
        $extensionId = $this->folderService->getOrCreateExtensionId('txt');

        // Nombre con caracteres problemáticos
        $file = $this->folderService->createFile(
            $folder,
            'test<script>alert("xss")</script>.txt',
            ['extension_id' => $extensionId],
            $this->user
        );

        // Verificar que se sanitizó correctamente
        $this->assertEquals('testscriptalertxssscript.txt', $file->name);
    }

    #[Test]
    public function it_overwrites_existing_file_when_specified()
    {
        $folder = $this->folderService->createPath('files', [], $this->user);
        $extensionId = $this->folderService->getOrCreateExtensionId('txt');

        // Crear archivo inicial
        $file1 = $this->folderService->createFile(
            $folder,
            'same_name.txt',
            ['extension_id' => $extensionId, 'size' => 100],
            $this->user
        );

        // Intentar crear otro con el mismo nombre con overwrite=true
        $file2 = $this->folderService->createFile(
            $folder,
            'same_name.txt',
            ['extension_id' => $extensionId, 'size' => 200],
            $this->user,
            true // overwrite
        );

        // Verificar que se creó un nuevo registro
        $this->assertNotEquals($file1->id, $file2->id);
        $this->assertEquals(200, $file2->size);

        // Verificar que solo existe un archivo con ese nombre
        $this->assertEquals(1, Folder::where('path', 'files/same_name.txt')->count());
    }

    #[Test]
    public function it_throws_exception_for_duplicate_file_without_overwrite()
    {
        $folder = $this->folderService->createPath('files', [], $this->user);
        $extensionId = $this->folderService->getOrCreateExtensionId('txt');

        // Crear archivo inicial
        $this->folderService->createFile(
            $folder,
            'duplicate.txt',
            ['extension_id' => $extensionId],
            $this->user
        );

        // Intentar crear otro con el mismo nombre sin overwrite
        $this->expectException(\InvalidArgumentException::class);
        $this->folderService->createFile(
            $folder,
            'duplicate.txt',
            ['extension_id' => $extensionId],
            $this->user,
            false // no overwrite
        );
    }

    #[Test]
    public function it_gets_existing_extension_id()
    {
        // Crear una extensión
        $extension = ExtensionFichero::create([
            'nombre' => 'docx',
            'descripcion' => 'Microsoft Word Document'
        ]);

        // Obtener su ID
        $id = $this->folderService->getOrCreateExtensionId('docx');

        $this->assertEquals($extension->id, $id);
    }

    #[Test]
    public function it_creates_new_extension_when_needed()
    {
        // Asegurarnos que no existe la extensión
        ExtensionFichero::where('nombre', 'xyz')->delete();

        $id = $this->folderService->getOrCreateExtensionId('xyz');

        $this->assertNotNull($id);
        $this->assertDatabaseHas('extension_ficheros', ['nombre' => 'xyz']);
    }

    #[Test]
    public function it_normalizes_extension_case()
    {
        // Crear con minúsculas
        $id1 = $this->folderService->getOrCreateExtensionId('png');

        // Consultar con mayúsculas
        $id2 = $this->folderService->getOrCreateExtensionId('PNG');

        $this->assertEquals($id1, $id2);

        // Verificar que solo hay una entrada en la base de datos
        $this->assertEquals(1, ExtensionFichero::where('nombre', 'png')->count());
    }

    #[Test]
    public function it_gets_folder_contents_separated_by_type()
    {
        // Crear estructura de prueba
        $rootFolder = $this->folderService->createPath('test_root', [], $this->user);

        // Añadir subcarpetas
        $this->folderService->createSubfolder($rootFolder, 'subfolder1', [], $this->user);
        $this->folderService->createSubfolder($rootFolder, 'subfolder2', [], $this->user);

        // Añadir archivos
        $extensionId = $this->folderService->getOrCreateExtensionId('txt');
        $this->folderService->createFile($rootFolder, 'file1.txt', ['extension_id' => $extensionId], $this->user);
        $this->folderService->createFile($rootFolder, 'file2.txt', ['extension_id' => $extensionId], $this->user);

        // Obtener contenidos
        $contents = $this->folderService->getFolderContents($rootFolder);

        // Verificar que tenemos separados carpetas y archivos
        $this->assertCount(2, $contents['folders']);
        $this->assertCount(2, $contents['files']);
        $this->assertEquals(4, $contents['total']);
    }

    #[Test]
    public function it_filters_contents_by_type()
    {
        $rootFolder = $this->folderService->createPath('filter_root', [], $this->user);

        // Añadir subcarpetas y archivos
        $this->folderService->createSubfolder($rootFolder, 'folder1', [], $this->user);
        $extensionId = $this->folderService->getOrCreateExtensionId('txt');
        $this->folderService->createFile($rootFolder, 'doc.txt', ['extension_id' => $extensionId], $this->user);

        // Filtrar solo carpetas
        $folderContents = $this->folderService->getFolderContents($rootFolder, [
            'filter_type' => 'folders'
        ]);

        $this->assertCount(1, $folderContents['folders']);
        $this->assertCount(0, $folderContents['files']);

        // Filtrar solo archivos
        $fileContents = $this->folderService->getFolderContents($rootFolder, [
            'filter_type' => 'files'
        ]);

        $this->assertCount(0, $fileContents['folders']);
        $this->assertCount(1, $fileContents['files']);
    }

    #[Test]
    public function it_supports_search_within_folder_contents()
    {
        $rootFolder = $this->folderService->createPath('search_root', [], $this->user);

        // Crear contenido variado
        $this->folderService->createSubfolder($rootFolder, 'important_folder', [], $this->user);
        $this->folderService->createSubfolder($rootFolder, 'regular_folder', [], $this->user);

        $extensionId = $this->folderService->getOrCreateExtensionId('txt');
        $this->folderService->createFile(
            $rootFolder,
            'important_document.txt',
            ['extension_id' => $extensionId],
            $this->user
        );
        $this->folderService->createFile(
            $rootFolder,
            'regular_document.txt',
            ['extension_id' => $extensionId],
            $this->user
        );

        // Buscar por "important"
        $searchResults = $this->folderService->getFolderContents($rootFolder, [
            'search' => 'important'
        ]);

        $this->assertEquals(2, $searchResults['total']); // 1 carpeta + 1 archivo
    }
}
