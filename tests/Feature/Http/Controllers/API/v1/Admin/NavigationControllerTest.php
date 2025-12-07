<?php

namespace Tests\Feature\Http\Controllers\API\v1\Admin;

use App\Models\Link;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class NavigationControllerTest extends TestCase
{
    use DatabaseTransactions, WithFaker;

    protected $admin;

    /**
     * Configuración previa para cada test
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = \App\Models\User::role('Super Admin')->first();
    }

    #[Test]
    public function it_validates_required_fields_when_creating_link()
    {
        $this->actingAs($this->admin);

        $response = $this->postJson('/api/v1/admin/navigation', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    #[Test]
    public function it_validates_unique_name_when_creating_link()
    {
        $this->actingAs($this->admin);

        // Crear un enlace existente
        Link::create([
            'name' => 'Enlace Existente',
            'route_name' => 'existente.route'
        ]);

        // Intentar crear otro con el mismo nombre
        $response = $this->postJson('/api/v1/admin/navigation', [
            'name' => 'Enlace Existente',
            'route_name' => 'existente.route'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    #[Test]
    public function it_validates_parent_id_exists_when_creating_link()
    {
        $this->actingAs($this->admin);

        $response = $this->postJson('/api/v1/admin/navigation', [
            'name' => 'Enlace Nuevo',
            'url' => '/nuevo',
            'parent_id' => 999 // ID que no existe
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parent_id']);
    }

    #[Test]
    public function it_validates_required_id_when_updating_link()
    {
        $this->actingAs($this->admin);

        // Crear un enlace existente
        $link = Link::create([
            'name' => 'Enlace Existente',
            'route_name' => 'existente.route'
        ]);

        $response = $this->putJson("/api/v1/admin/navigation/$link->id", [
            'name' => 'Enlace Actualizado',
            'route_name' => 'original.route',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['id']);
    }

    #[Test]
    public function it_prevents_link_from_being_its_own_parent_when_updating()
    {
        $this->actingAs($this->admin);

        $link = Link::create([
            'name' => 'Enlace Original',
            'route_name' => 'original.route'
        ]);

        $response = $this->putJson("/api/v1/admin/navigation/$link->id", [
            'id' => $link->id, // Debe incluir el ID del enlace
            'name' => 'Enlace Actualizado',
            'route_name' => 'original.route',
            'parent_id' => $link->id // Intenta ser su propio padre
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parent_id']);
    }
}
