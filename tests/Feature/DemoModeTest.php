<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoModeTest extends TestCase
{
    use RefreshDatabase;

    private string $demoEmail = 'invitado@empresa.com';

    /**
     * Test that the guest user is blocked from POST requests.
     */
    public function test_guest_user_cannot_perform_post_requests(): void
    {
        $user = User::factory()->create([
            'email' => $this->demoEmail,
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/admin/departamentos', [
                'nombre' => 'Departamento de Prueba',
            ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Modo lectura activado: No se permite modificar datos en la versión demo.',
        ]);
    }

    /**
     * Test that the guest user is blocked from PUT requests.
     */
    public function test_guest_user_cannot_perform_put_requests(): void
    {
        $user = User::factory()->create([
            'email' => $this->demoEmail,
        ]);

        $response = $this->actingAs($user)
            ->putJson('/api/v1/shared/users/1', [
                'name' => 'Nuevo Nombre',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test that the guest user is blocked from DELETE requests.
     */
    public function test_guest_user_cannot_perform_delete_requests(): void
    {
        $user = User::factory()->create([
            'email' => $this->demoEmail,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson('/api/v1/admin/users/1');

        $response->assertStatus(403);
    }


    /**
     * Test that a regular user is NOT blocked by the demo middleware.
     */
    public function test_regular_user_is_not_blocked_by_demo_middleware(): void
    {
        $user = User::factory()->create([
            'email' => 'regular@example.com',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/dashboard');

        // Check if we get the demo mode message
        $content = $response->getContent();
        $this->assertStringNotContainsString(
            'Modo lectura activado: No se permite modificar datos en la versión demo.',
            $content
        );
    }
}
