<?php

namespace App\Config;

use Illuminate\Support\Facades\Log;

class NotificationRules
{
    /**
     * Obtiene todas las reglas de notificaciones configuradas
     */
    public static function getRules(): array
    {
        return config('notifications.rules', []);
    }

    /**
     * Obtiene la regla para un modelo y acción específicos
     */
    public static function getRule(string $modelType, string $action): ?array
    {
        $rules = self::getRules();
        return $rules[$modelType][$action] ?? null;
    }

    /**
     * Verifica si existe una regla para un modelo y acción
     */
    public static function hasRule(string $modelType, string $action): bool
    {
        return self::getRule($modelType, $action) !== null;
    }

    /**
     * Obtiene todos los tipos de modelos disponibles
     */
    public static function getAvailableModels(): array
    {
        return array_keys(self::getRules());
    }

    /**
     * Obtiene todas las acciones disponibles para un modelo
     */
    public static function getAvailableActions(string $modelType): array
    {
        $rules = self::getRules();
        return array_keys($rules[$modelType] ?? []);
    }

    /**
     * Obtiene configuración de canales
     */
    public static function getChannelConfig(string $channel): array
    {
        return config("notifications.channels.{$channel}", []);
    }

    /**
     * Verifica si un canal está habilitado
     */
    public static function isChannelEnabled(string $channel): bool
    {
        $config = self::getChannelConfig($channel);
        return $config['enabled'] ?? false;
    }

    /**
     * Obtiene el template_id de Brevo para una plantilla específica
     */
    public static function getMailTemplateConfig(string $templateKey): int
    {
        $defaultTemplate = config('notifications.mail_templates.brevo.default_template', 46);
        
        // Obtener todos los templates de una vez
        $allTemplates = config('notifications.mail_templates.brevo.templates', []);
        $templateId = $allTemplates[$templateKey] ?? $defaultTemplate;
        
        // DEBUG temporal
        Log::info("🔍 DEBUG getMailTemplateConfig", [
            'template_key' => $templateKey,
            'config_path' => "notifications.mail_templates.brevo.templates.{$templateKey}",
            'template_id_found' => $templateId,
            'default_template' => $defaultTemplate,
            'config_exists' => isset($allTemplates[$templateKey]),
            'all_config' => $allTemplates
        ]);
        
        return $templateId;
    }

    /**
     * Obtiene configuración completa de plantillas de email (método anterior)
     */
    public static function getMailTemplateFullConfig(string $templateKey): array
    {
        return config("notifications.mail_templates.brevo.templates.{$templateKey}", []);
    }

    /**
     * Obtiene variables de plantilla para un template_id específico
     */
    public static function getTemplateVariables(int $templateId): array
    {
        return config("notifications.mail_templates.brevo.template_variables.{$templateId}", []);
    }
} 