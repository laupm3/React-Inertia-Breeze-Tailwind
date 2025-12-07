<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use App\Enums\UserStatus;

trait UsuarioNotificacionesTrait
{
    use NotificacionesTrait;

    // Ruta base donde se encuentran las plantillas Markdown de notificaciones de usuario
    private const TEMPLATES_BASE_PATH = 'resources/markdown/Notifications/User/';

    /**
     * Notifica a todos los administradores sobre un cambio en un usuario.
     */
    protected function notifyAdminsAboutUsuario(User $usuario, string $action): void
    {
        try {
            // Notificar a administradores
            $this->notifyUsersByRole(['Administrator', 'Super Admin'], $usuario, $action);

            Log::info("✅ Notificaciones de usuario ({$action}) enviadas correctamente");
        } catch (\Exception $e) {
            Log::error("❌ Error al enviar notificaciones de usuario ({$action}):", [
                'error' => $e->getMessage(),
                'user_id' => $usuario->id ?? 'N/A', // Usar null coalescing para seguridad
                'action' => $action
            ]);
            throw $e;
        }
    }

    /**
     * Obtiene el título para la notificación de usuario.
     * El título aún puede ser más descriptivo que el cuerpo del mensaje.
     */
    protected function getTitle($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof User)) {
            return "Notificación del Sistema";
        }

        // Prepara los datos dinámicos que se usarán en el título (incluye los estados).
        $dynamicData = $this->prepareData($model, $action);

        // Define la plantilla del título según la acción.
        $subjectTemplate = match ($action) {
            'created' => 'Nuevo Usuario Creado: {{ user.name }}',
            // Mantenemos el old_status -> new_status en el título porque da un buen resumen del cambio.
            'updated' => 'Usuario Actualizado: {{ user.name }} ({{ old_status_label }} -> {{ new_status_label }})',
            'deleted' => 'Usuario Eliminado: {{ user.name }}', // No se usará, pero mantenemos por consistencia.
            default => 'Notificación de Usuario: {{ user.name }}'
        };

        // Rellena la plantilla del título con los datos dinámicos.
        return $this->fillTemplatePlaceholders($subjectTemplate, $dynamicData);
    }

    /**
     * Crea el contenido principal (en Markdown) para la notificación de usuario.
     */
    protected function createContent($model, string $action, bool $isEmployee = false): string
    {
        if (!($model instanceof User)) {
            return "Notificación del sistema.";
        }

        $templateFileName = '';
        // Prepara los datos dinámicos que se usarán en el contenido (incluye los estados).
        $dynamicData = $this->prepareData($model, $action);

        if ($action === 'created') {
            $templateFileName = 'user_created.md';
        } elseif ($action === 'updated') {
            $templateFileName = 'user_updated.md';
        } else {
            // Un fallback si la acción no es 'created' ni 'updated'.
            // Usar plantilla genérica para acciones no manejadas específicamente
            $templateFileName = 'user_default.md';
            Log::warning("No se encontró plantilla específica para la acción '{$action}'. Usando plantilla genérica.");
        }

        $templatePath = self::TEMPLATES_BASE_PATH . $templateFileName;

        // Verifica si el archivo de plantilla Markdown existe.
        if (!File::exists(base_path($templatePath))) {
            Log::error("❌ Archivo de plantilla Markdown no encontrado: " . base_path($templatePath), ['template_path' => base_path($templatePath)]);
            return "Contenido no disponible. Archivo de plantilla para '{$action}' de usuario no encontrado.";
        }

        // Lee el contenido de la plantilla.
        $markdownTemplate = File::get(base_path($templatePath));

        // Rellena los placeholders en la plantilla Markdown con los datos dinámicos.
        return $this->fillTemplatePlaceholders($markdownTemplate, $dynamicData);
    }

    /**
     * Prepara y recopila todos los datos dinámicos necesarios para rellenar las plantillas
     * de título y contenido de la notificación de usuario.
     */
    protected function prepareData($model, string $action): array
    {
        if (!($model instanceof User)) {
            return [];
        }

        /** @var \App\Models\User|null $authUser */
        $authUser = Auth::user();

        $data = [
            'user_id' => $model->id,
            'action_url' => route('admin.users.index'), // URL genérica para ver la lista de usuarios.
            'action_text' => 'Ver Usuarios',
            'user' => [ // Datos del usuario afectado por la notificación.
                'name' => $model->name,
                'email' => $model->email,
            ]

        ];

        $data['old_status'] = $model->getOriginal('status') ?? $model->status;
        $data['new_status'] = $model->status;

        $data['old_status_label'] = UserStatus::tryFrom((int)$data['old_status'])?->label() ?? 'Desconocido';
        $data['new_status_label'] = UserStatus::tryFrom((int)$data['new_status'])?->label() ?? 'Desconocido';

        $data['status_changed'] = $data['old_status'] !== $data['new_status'];

        return $data;
    }

    /**
     * Rellena los placeholders en una cadena de plantilla con los datos proporcionados.
     */
    protected function fillTemplatePlaceholders(string $templateString, array $data): string
    {
        $renderedString = $templateString;

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                // Maneja placeholders anidados (ej. {{ user.name }})
                foreach ($value as $subKey => $subValue) {
                    $placeholder = "{{ {$key}.{$subKey} }}";
                    $renderedString = str_replace($placeholder, $subValue, $renderedString);
                }
            } else {
                // Maneja placeholders de nivel superior (ej. {{ admin.name }})
                $placeholder = "{{ {$key} }}";
                $renderedString = str_replace($placeholder, $value, $renderedString);
            }
        }
        return $renderedString;
    }
}
