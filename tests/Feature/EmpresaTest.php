<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Empresa;
use App\Events\Empresa\EmpresaCreada;
use Illuminate\Support\Facades\Event;
use App\Notifications\SystemNotification;
use Illuminate\Support\Facades\Notification;
use App\Listeners\Empresa\NotificarEmpresaCreada;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;

class EmpresaTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_sends_email_to_admins_when_empresa_is_created()
    {
        // Fake the notifications
        Notification::fake();

        // Create an admin user
        $admin = User::factory()->create(['role' => 'Administrator']);

        // Create a new empresa
        $empresa = Empresa::factory()->create();

        // Fire the event
        event(new EmpresaCreada($empresa));

        // Assert that the notification was sent to the admin
        Notification::assertSentTo(
            [$admin],
            SystemNotification::class,
            function ($notification, $channels) use ($empresa) {
                return $notification->data['empresa_id'] === $empresa->id;
            }
        );
    }
}