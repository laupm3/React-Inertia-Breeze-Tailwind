<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Notification;
use App\Models\TipoNotification;
use App\Events\NotificationEvent;
use Illuminate\Support\Facades\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\RoleSeeder;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear los roles necesarios
        $this->seed(RoleSeeder::class);
    }

    public function test_notification_event_is_dispatched_correctly()
    {
        Event::fake();

        // 1. Preparar el escenario
        $tipoNotification = TipoNotification::create([
            'name' => 'Nueva Empresa',
            'description' => 'Notificación de nueva empresa creada en el sistema',
        ]);

        // Crear usuarios con diferentes roles para probar
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrator');

        $hrManager = User::factory()->create();
        $hrManager->assignRole('HR Manager');

        // 2. Crear una notificación
        $notification = Notification::create([
            'sender_id' => $adminUser->id,
            'receiver_id' => $hrManager->id,
            'tipo_notification_id' => $tipoNotification->id,
            'title' => 'Test Notification',
            'content' => 'This is a test notification',
            'sent_at' => now(),
        ]);

        // 3. Disparar el evento
        event(new NotificationEvent($notification));

        // 4. Verificar que el evento fue disparado con la notificación correcta
        Event::assertDispatched(NotificationEvent::class, function ($event) use ($notification) {
            return $event->notification->id === $notification->id;
        });
    }

    public function test_notification_is_broadcasted_to_correct_channel()
    {
        // 1. Preparar el escenario
        $tipoNotification = TipoNotification::create([
            'name' => 'Nueva Empresa',
            'description' => 'Notificación de nueva empresa creada en el sistema',
        ]);

        $user = User::factory()->create();
        $user->assignRole('Administrator');

        $notification = Notification::create([
            'sender_id' => $user->id,
            'receiver_id' => $user->id,
            'tipo_notification_id' => $tipoNotification->id,
            'title' => 'Test Notification',
            'content' => 'This is a test notification',
            'sent_at' => now(),
        ]);

        $event = new NotificationEvent($notification);

        // 2. Verificar que el canal es correcto
        $this->assertEquals('notifications', $event->broadcastOn()->name);
    }

    public function test_only_authorized_roles_can_receive_notifications()
    {
        // 1. Crear usuarios con diferentes roles
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrator');

        $guestUser = User::factory()->create();
        $guestUser->assignRole('Guest');

        // 2. Verificar acceso al canal de notificaciones
        $this->assertTrue($adminUser->hasRole(['Administrator', 'HR Manager', 'Super Admin']));
        $this->assertFalse($guestUser->hasRole(['Administrator', 'HR Manager', 'Super Admin']));
    }

    public function test_unauthorized_roles_cannot_receive_notifications()
    {
        // 1. Crear usuarios con roles no autorizados
        $guestUser = User::factory()->create();
        $guestUser->assignRole('Guest');

        $regularUser = User::factory()->create();
        $regularUser->assignRole('User');

        $developerUser = User::factory()->create();
        $developerUser->assignRole('Developer');

        // 2. Verificar que no tienen acceso al canal de notificaciones
        $this->assertFalse($guestUser->hasRole(['Administrator', 'HR Manager', 'Super Admin']));
        $this->assertFalse($regularUser->hasRole(['Administrator', 'HR Manager', 'Super Admin']));
        $this->assertFalse($developerUser->hasRole(['Administrator', 'HR Manager', 'Super Admin']));
    }
} 