<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Configuración de Canales de Notificación
    |--------------------------------------------------------------------------
    |
    | Aquí puedes configurar los canales disponibles para las notificaciones
    | y sus configuraciones específicas.
    |
    */
    'channels' => [
        'broadcast' => [
            'enabled' => env('NOTIFICATION_BROADCAST_ENABLED', true),
            'driver' => env('BROADCAST_DRIVER', 'pusher'),
            'queue' => env('NOTIFICATION_BROADCAST_QUEUE', 'notifications'),
        ],

        'mail' => [
            'enabled' => env('NOTIFICATION_MAIL_ENABLED', true),
            'provider' => 'brevo', // o 'smtp', 'mailgun', etc.
            'queue' => env('NOTIFICATION_MAIL_QUEUE', 'notifications'),
            'brevo' => [
                'api_key' => env('BREVO_API_KEY'),
                'template_id' => env('BREVO_TEMPLATE_ID'),
            ],
        ],

        'database' => [
            'enabled' => env('NOTIFICATION_DATABASE_ENABLED', true),
            'table' => 'notifications', // Tu tabla personalizada
            'queue' => env('NOTIFICATION_DATABASE_QUEUE', 'notifications'),
            'save_immediately' => env('NOTIFICATION_DATABASE_IMMEDIATE', true),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Reglas de Notificaciones por Modelo
    |--------------------------------------------------------------------------
    |
    | Aquí defines qué notificaciones se envían para cada modelo y acción,
    | incluyendo destinatarios, canales y plantillas.
    |
    */
    'rules' => [
        'empresa' => [
            'created' => [
                'recipients' => [
                    //'roles' => ['Administrator', 'Super Admin'],
                ],
                'channels' => ['broadcast'/* , 'mail' */, 'database'],
                'templates' => [
                    'title' => 'Nueva Empresa: {nombre}',
                    'content' => 'Se ha creado una nueva empresa en el sistema: {nombre}',
                    'mail' => [
                        'subject' => 'Nueva Empresa Creada - {nombre}',
                        'template' => 'empresa.created',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['empresa_id', 'action_type'],
                ],
            ],

            'updated' => [
                'recipients' => [
                    //'roles' => ['Administrator', 'Super Admin'],
                    //'user_emails' => ['samueljzd@gmail.com'],
                    'user_ids' => [1],
                ],
                'channels' => ['broadcast' , 'mail' , 'database'],
                'templates' => [
                    'title' => 'Empresa Actualizada: {nombre}',
                    'content' => 'Se ha actualizado la información de la empresa: {nombre}',
                    'mail' => [
                        'subject' => 'Empresa Actualizada - {nombre}',
                        'template' => 'empresa.updated',
                    ],
                ],
                'database' => [
                    'save_immediately' => false, // Cambiar a false para que se guarde en la nueva tabla de los jobs
                    'custom_fields' => ['empresa_id', 'action_type'],
                ],
            ],

            'deleted' => [
                'recipients' => [
                    //'roles' => ['Administrator', 'Super Admin'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Empresa Eliminada: {nombre}',
                    'content' => 'Se ha eliminado la empresa: {nombre}',
                    'mail' => [
                        'subject' => 'Empresa Eliminada - {nombre}',
                        'template' => 'empresa.deleted',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['empresa_id', 'action_type'],
                ],
            ],
        ],

        'empleado' => [
            'created' => [
                'recipients' => [
                   // 'employee' => true,
                    //'roles' => ['Human Resources'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Nuevo Empleado: {nombre}',
                    'content' => 'Se ha creado un nuevo empleado: {nombre}',
                    'mail' => [
                        'subject' => 'Bienvenido a la Empresa',
                        'template' => 'emails.empleado.welcome',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['empleado_id', 'action_type'],
                ],
            ],

            'employee_status_changed' => [
                'recipients' => [
                    'roles' => ['Administrator', 'Super Admin'],
                ],
                'channels' => ['database', 'broadcast'],
                'templates' => [
                    'title' => 'Cambio de Estado de Empleado',
                    'content' => 'El estado de {empleado.nombre} ha sido actualizado a {new_status}.',
                ],
            ],

            'nif_expiring' => [
                'recipients' => [
                   // 'employee' => true,
                    //'roles' => ['Human Resources'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'NIF próximo a vencer: {nombre}',
                    'content' => 'El NIF de {nombre} vence en {dias_restantes} días',
                    'mail' => [
                        'subject' => 'Documento próximo a vencer',
                        'template' => 'emails.empleado.nif_expiring',
                    ],
                ],
                'scheduled' => true,
                'database' => [
                    'save_immediately' => false,
                    'custom_fields' => ['empleado_id', 'dias_restantes'],
                ],
            ],
        ],

        'departamento' => [
            'updated' => [
                'recipients' => [
                    /*'roles' => ['Administrator', 'Super Admin', 'Human Resources'],
                    'permissions' => ['manage_departments', 'view_departments'],
                    'relationships' => [
                        'department_employees' => true,
                        'department_manager' => true,
                        'department_adjunto' => true,
                    ],*/
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Departamento Actualizado: {nombre}',
                    'content' => 'Se ha actualizado el departamento: {nombre}',
                    'role_based' => [
                        'manager' => [
                            'title' => 'Tu departamento ha sido actualizado: {nombre}',
                            'content' => 'Se ha actualizado el departamento que gestionas: {nombre}',
                            'mail' => [
                                'subject' => 'Actualización de tu Departamento',
                                'template' => 'emails.departamento.manager_updated',
                            ],
                        ],
                        'adjunto' => [
                            'title' => 'Actualización en tu departamento: {nombre}',
                            'content' => 'Se ha actualizado el departamento donde eres adjunto: {nombre}',
                            'mail' => [
                                'subject' => 'Actualización de Departamento',
                                'template' => 'emails.departamento.adjunto_updated',
                            ],
                        ],
                        'empleado' => [
                            'title' => 'Tu departamento ha sido actualizado: {nombre}',
                            'content' => 'Se ha actualizado la información del departamento al que perteneces: {nombre}',
                            'mail' => [
                                'subject' => 'Actualización de Departamento',
                                'template' => 'emails.departamento.employee_updated',
                            ],
                        ],
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['departamento_id', 'action_type'],
                ],
            ],
        ],
        'user' => [
            'created' => [
                'recipients' => [
                    'user' => true,
                    'permissions' => ['viewUsersPanel'],
                ],
                'channels' => ['mail', 'database', 'broadcast'],
                'templates' => [
                    'title' => 'Nuevo Usuario Creado: {name}',
                    'content' => 'Se ha creado un nuevo usuario en el sistema: {name}',
                    'mail' => [
                        'subject' => 'Nuevo Usuario Creado',
                        'template' => 'user.created',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['user_id', 'action_type'],
                ],
            ],
            'updated' => [
                'recipients' => [
                    'roles' => ['Administrator', 'Super Admin'],
                ],
                'channels' => ['database'],
                'templates' => [
                    'title' => 'Usuario Actualizado: {user.name}',
                    'content' => 'Se ha actualizado la información del usuario {user.name}.',
                ],
            ],
            'deleted' => [
                'recipients' => [
                    'roles' => ['Administrator', 'Super Admin'],
                ],
                'channels' => ['database'],
                'templates' => [
                    'title' => 'Usuario Eliminado: {user.name}',
                    'content' => 'Se ha eliminado el usuario {user.name} (ID: {user.id}).',
                ],
            ],
            'banned' => [
                'recipients' => [
                    'user' => true,
                    'relationships' => ['manager'],
                    'permissions' => ['viewUsersPanel'],
                ],
                'channels' => ['mail', 'database'],
                'templates' => [
                    'title' => 'Cuenta Bloqueada: {user.name}',
                    'content' => 'La cuenta de {user.name} ha sido bloqueada permanentemente.',
                    'mail' => [
                        'template' => 'empleado.banned',
                    ],
                ],
            ],
            'suspended' => [
                'recipients' => [
                    'user' => true,
                    'relationships' => ['manager'],
                    'permissions' => ['viewUsersPanel'],
                ],
                'channels' => ['mail', 'database'],
                'templates' => [
                    'title' => 'Cuenta Suspendida: {user.name}',
                    'content' => 'Tu cuenta ha sido suspendida temporalmente. Contacta con RRHH para más información.',
                    'mail' => [
                        'template' => 'empleado.deactivated',
                    ],
                ],
            ],
            'reactivated' => [
                'recipients' => [
                    'user' => true,
                    'relationships' => ['manager'],
                    'permissions' => ['viewUsersPanel'],
                ],
                'channels' => ['mail', 'database'],
                'templates' => [
                    'title' => 'Cuenta Reactivada: {user.name}',
                    'content' => 'Tu cuenta ha sido reactivada y ya puedes acceder al sistema.',
                    'mail' => [
                        'template' => 'empleado.reactivated',
                    ],
                ],
            ],
            'bienvenido' => [
                'recipients' => [
                    'user' => true,
                ],
                'channels' => ['mail', 'database'],
                'templates' => [
                    'title' => '¡Bienvenid@ a Empresa!: {name}',
                    'content' => 'Bienvenid@ {name} al sistema de Empresa. Tu usuario es {username}',
                    'mail' => [
                        'template' => 'user.bienvenido',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['user_id', 'action_type'],
                ],
            ],

        ],
        'solicitud_permiso' => [
            'created' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Nueva Solicitud de Permiso: {empleado_nombre}',
                    'content' => '{empleado_nombre} ha solicitado un permiso para {fecha_inicio} a {fecha_fin}',
                    'mail' => [
                        'subject' => 'Nueva Solicitud de Permiso',
                        'template' => 'emails.permiso.sent',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['permiso_id', 'action_type'],
                ],
            ],
            'aproved' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Solicitud de Permiso Aprobada: {empleado_nombre}',
                    'content' => '{empleado_nombre} ha recibido la aprobación para su permiso del {fecha_inicio} al {fecha_fin}',
                    'mail' => [
                        'subject' => 'Solicitud de Permiso Aprobada',
                        'template' => 'emails.permiso.approved',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['permiso_id', 'action_type'],
                ],
            ],
            'denied' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Solicitud de Permiso Denegada: {empleado_nombre}',
                    'content' => '{empleado_nombre} ha recibido la denegación para su permiso del {fecha_inicio} al {fecha_fin}',
                    'mail' => [
                        'subject' => 'Solicitud de Permiso Denegada',
                        'template' => 'emails.permiso.denied',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['permiso_id', 'action_type'],
                ],
            ],
        ],
        'horario' => [
            'created' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Nuevo Horario Asignado: {empleado_nombre}',
                    'content' => '{empleado_nombre} ha sido asignado a un nuevo horario: {horario_detalles}',
                    'mail' => [
                        'subject' => 'Nuevo Horario Asignado',
                        'template' => 'emails.horario.created',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['horario_id', 'action_type'],
                ],
            ],
            'retraso' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Retraso en Horario: {empleado_nombre}',
                    'content' => '{empleado_nombre} ha reportado un retraso en su horario: {horario_detalles}',
                    'mail' => [
                        'subject' => 'Retraso en Horario',
                        'template' => 'emails.horario.retraso',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['horario_id', 'action_type'],
                ],
            ],
            'ausencia_mayor' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Ausencia Mayor Reportada: {empleado_nombre}',
                    'content' => '{empleado_nombre} ha reportado una ausencia mayor a 3 días: {horario_detalles}',
                    'mail' => [
                        'subject' => 'Ausencia Mayor Reportada',
                        'template' => 'emails.horario.ausencia_mayor',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['horario_id', 'action_type'],
                ],
            ],
        ],
        'contrato' => [
            'created' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                    'permissions' => ['viewContractsPanel'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Nuevo Contrato Asignado: {empleado_nombre}',
                    'content' => '{empleado_nombre} ha sido asignado a un nuevo contrato: {contrato_detalles}',
                    'mail' => [
                        'subject' => 'Nuevo Contrato Asignado',
                        'template' => 'emails.contrato.created',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['contrato_id', 'action_type', 'tipo_contrato', 'fecha_inicio', 'fecha_fin'],
                ],
            ],
            'updated' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                    'permissions' => ['viewContractsPanel'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Contrato Actualizado: {n_expediente}',
                    'content' => 'Se ha actualizado el contrato de {empleado_nombre}. Vigencia: {fecha_inicio} al {fecha_fin}',
                    'mail' => [
                        'subject' => 'Actualización de Contrato',
                        'template' => 'emails.contrato.updated',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['contrato_id', 'action_type', 'cambios'],
                ],
            ],
            'deleted' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                    'permissions' => ['viewContractsPanel'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Contrato Eliminado: {n_expediente}',
                    'content' => 'Se ha eliminado el contrato de {empleado_nombre} con fecha de inicio {fecha_inicio}',
                    'mail' => [
                        'subject' => 'Eliminación de Contrato',
                        'template' => 'emails.contrato.deleted',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['contrato_id', 'action_type'],
                ],
            ],
            'finalizado' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                    'permissions' => ['viewContractsPanel'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Contrato Finalizado: {n_expediente}',
                    'content' => 'El contrato de {empleado_nombre} ha finalizado con fecha {fecha_fin}',
                    'mail' => [
                        'subject' => 'Finalización de Contrato',
                        'template' => 'emails.contrato.finalizado',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['contrato_id', 'action_type', 'fecha_fin'],
                ],
            ],
            'proximo_a_vencer' => [
                'recipients' => [
                    'employee' => true,
                    'relationships' => ['manager'],
                    'permissions' => ['viewContractsPanel'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Contrato Próximo a Finalizar: {n_expediente}',
                    'content' => 'El contrato de {empleado_nombre} finalizará en {dias_restantes} días ({fecha_fin})',
                    'mail' => [
                        'subject' => 'Contrato Próximo a Finalizar',
                        'template' => 'emails.contrato.proximo_vencimiento',
                    ],
                ],
                'database' => [
                    'save_immediately' => false,
                    'custom_fields' => ['contrato_id', 'action_type', 'dias_restantes', 'fecha_fin'],
                ],
                'scheduled' => true,
            ],
            'empleado_sin_contratos' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Administrator'],
                    'permissions' => ['viewContractsPanel', 'viewUsersPanel'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Acceso Desactivado: Sin Contratos Vigentes',
                    'content' => 'Su acceso al sistema ha sido desactivado porque no cuenta con contratos vigentes',
                    'title_admin' => 'Empleado Sin Contratos Vigentes',
                    'content_admin' => 'El empleado {empleado_nombre} no tiene contratos vigentes. Su acceso ha sido desactivado',
                    'mail' => [
                        'subject' => 'Acceso Desactivado - Sin Contratos Vigentes',
                        'template' => 'emails.contrato.empleado_sin_contratos',
                        'subject_admin' => 'Empleado Sin Contratos Vigentes',
                        'template_admin' => 'emails.contrato.admin_empleado_sin_contratos',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['empleado_id', 'action_type', 'ultimo_contrato_id'],
                ],
            ],
            'renovacion' => [
                'recipients' => [
                    'employee' => true,
                    'roles' => ['Human Resources', 'Manager'],
                    'permissions' => ['viewContractsPanel'],
                ],
                'channels' => ['broadcast', 'mail', 'database'],
                'templates' => [
                    'title' => 'Renovación de Contrato: {n_expediente}',
                    'content' => 'El contrato de {empleado_nombre} ha sido renovado. Nueva vigencia: {fecha_inicio} al {fecha_fin}',
                    'mail' => [
                        'subject' => 'Renovación de Contrato',
                        'template' => 'emails.contrato.renovacion',
                    ],
                ],
                'database' => [
                    'save_immediately' => true,
                    'custom_fields' => ['contrato_id', 'action_type', 'contrato_anterior_id'],
                ],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Plantillas de Email
    |--------------------------------------------------------------------------
    |
    | Configuración específica para plantillas de Brevo
    |
    */
    'mail_templates' => [
        'brevo' => [
            'default_template' => 46, 
            'templates' => [
                // Empresas - ACTUALIZADO con las nuevas plantillas
                'empresa.created' => 53,  // Nueva empresa registrada
                'empresa.updated' => 54,  // Empresa editada  
                'empresa.deleted' => 55,  // Empresa eliminada

                // Contratos
                'emails.contrato.created' => 46,              // Email básico
                'emails.contrato.updated' => 46,              // Email básico
                'emails.contrato.deleted' => 46,              // Email básico
                'emails.contrato.finalizado' => 46,           // Email básico
                'emails.contrato.proximo_vencimiento' => 46,  // Email básico
                'emails.contrato.empleado_sin_contratos' => 33, // Usuario dado de baja
                'emails.contrato.admin_empleado_sin_contratos' => 46, // Email básico
                'emails.contrato.renovacion' => 46,           // Email básico

                // Usuarios
                'user.bienvenido' => 28,           // Usuario bienvenido
                
                // Empleados
                //'empleado.created' => 28,           // Usuario nuevo
                'empleado.updated' => 31,           // Usuario actualizado
                'empleado.deactivated' => 33,       // Usuario dado de baja
                'empleado.banned' => 34,            // Usuario baneado
                'empleado.reactivated' => 35,       // Usuario reactivado
                'empleado.nif_expiring' => 32,      // Modificación de información
                'empleado.contact_update' => 32,    // Modificación de información

                // Departamentos
                'departamento.updated' => 46,       // Email básico
                'departamento.created' => 46,       // Email básico

                // Eventos
                'evento.created' => 30,             // Notificación de Evento
                'evento.updated' => 30,             // Notificación de Evento
                'evento.invitation' => 42,          // Invitación a equipo

                // Permisos y Vacaciones
                'permiso.sent' => 36,               // Solicitud enviada
                'permiso.pending' => 37,            // Pendiente de revisión
                'permiso.in_review' => 38,          // En proceso
                'permiso.approved' => 39,           // Solicitud aprobada
                'permiso.denied' => 47,             // Solicitud denegada

                // Formación
                'curso.invitation' => 45,           // Formación y cursos

                // Ofertas laborales
                'oferta.internal' => 40,            // Oferta laboral interna

                // Cumpleaños
                'empleado.birthday' => 41,          // Felicitación cumpleaños

                // Encuestas
                'survey.invitation' => 43,          // Encuesta de satisfacción

                // Exportaciones
                'export.completed' => 48,           // Exportación Data Tables

                // Seguridad
                'security.2fa_enabled' => 44,       // Activación Google Authenticator

                // Usuarios programados
                'user.scheduled_ban' => 50,         // Usuario baneado programado
                'user.scheduled_deactivation' => 51, // Usuario dado de baja programado
            ],

            // Mapeo de variables por plantilla
            'template_variables' => [
                // NUEVAS plantillas de empresa
                53 => [ // Empresa creada
                    'COMPANY_NAME' => 'company_name',
                    'COMPANY_ID' => 'company_id', 
                    'COMPANY_CREATION_DAY' => 'company_update_day',
                ],
                54 => [ // Empresa editada
                    'COMPANY_NAME' => 'company_name',
                    'COMPANY_ID' => 'company_id',
                    'COMPANY_UPDATE_DAY' => 'company_update_day',
                ],
                55 => [ // Empresa eliminada
                    'COMPANY_NAME' => 'company_name',
                    'COMPANY_ID' => 'company_id',
                    'COMPANY_CREATION_DAY' => 'company_update_day',
                ],
                
                // EXISTENTES - SIN CAMBIOS
                28 => [ // Usuario nuevo
                    'NOMBRE' => 'nombre',
                    'APELLIDOS' => 'apellidos',
                    'USERNAME' => 'username',
                    'PASSWORD' => 'password',
                ],
                31 => [ // Usuario actualizado
                    'NOMBRE' => 'nombre',
                    'APELLIDOS' => 'apellidos',
                    'USERNAME' => 'username',
                    'PASSWORD' => 'password',
                ],
                46 => [ // Email básico
                    'SUBJECT' => 'subject',
                    'TITLE' => 'title',
                    'MESSAGE' => 'message',
                ],
                30 => [ // Notificación de Evento
                    'EVENT_TYPE' => 'event_type',
                    'EVENT_CREATOR_AVATAR' => 'event_creator_avatar',
                    'EVENT_CREATOR_FULLNAME' => 'event_creator_fullname',
                    'EVENT_CREATOR_DEPARTMENT' => 'event_creator_department',
                    'EVENT_DATE' => 'event_date',
                    'EVENT_HOUR' => 'event_hour',
                    'EVENT_MESSAGE' => 'event_message',
                ],
                // ... más plantillas según necesites
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Colas
    |--------------------------------------------------------------------------
    |
    | Configuración de colas para diferentes tipos de notificaciones
    |
    */
    'queues' => [
        'default' => env('NOTIFICATION_QUEUE', 'notifications'),
        'high_priority' => env('NOTIFICATION_HIGH_PRIORITY_QUEUE', 'notifications-high'),
        'low_priority' => env('NOTIFICATION_LOW_PRIORITY_QUEUE', 'notifications-low'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Logging
    |--------------------------------------------------------------------------
    |
    | Configuración para logging de notificaciones
    |
    */
    'logging' => [
        'enabled' => env('NOTIFICATION_LOGGING_ENABLED', true),
        'level' => env('NOTIFICATION_LOG_LEVEL', 'info'),
        'channel' => env('NOTIFICATION_LOG_CHANNEL', 'stack'),
    ],
];
