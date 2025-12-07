# Sistema de Eventos

## Descripción General
Sistema para gestionar eventos internos de la empresa, permitiendo la creación y gestión de eventos por departamento, equipo y empresa.

## Tipos de Eventos
1. **Empresa**
   - Solo pueden ser creados por Administradores y RRHH
   - Visibles para todos los empleados con contratos vigentes en las empresas seleccionadas

2. **Departamento**
   - Pueden ser creados por Managers de departamento y usuarios con contratos vigentes
   - Visibles solo para miembros del departamento
   - Los participantes se agregan automáticamente al crear el evento

3. **Team**
   - Pueden ser creados por cualquier miembro del equipo
   - Visibles solo para miembros del equipo
   - Los miembros del equipo se agregan automáticamente al crear el evento

4. **Privado**
   - Pueden ser creados por cualquier usuario
   - Visibles solo para los participantes seleccionados

## Roles y Permisos

### Roles
- **Super Admin / Administrator**: Acceso total a todos los eventos
- **Human Resources / HR Manager**: Acceso total a todos los eventos
- **Department Manager**: Gestión de eventos departamentales
- **Department Assistant**: Gestión de eventos departamentales
- **Usuario Regular**: Gestión de eventos propios y teams

### Permisos por Rol
| Acción | Admin/RRHH | Dept Manager | Dept Assistant | Usuario |
|--------|------------|--------------|----------------|---------|
| Ver todos los eventos | ✓ | ✗ | ✗ | ✗ |
| Crear evento empresa | ✓ | ✗ | ✗ | ✗ |
| Crear evento departamento | ✓ | ✓ | ✓ | ✓* |
| Crear evento team | ✓ | ✓ | ✓ | ✓** |
| Crear evento privado | ✓ | ✓ | ✓ | ✓ |
| Modificar cualquier evento | ✓ | ✗ | ✗ | ✗ |
| Modificar eventos propios | ✓ | ✓ | ✓ | ✓ |

\* *Si tiene contrato vigente en el departamento*
\** *Si pertenece al team*

## Estructura del Sistema

### Modelos
- `Evento.php`: Modelo principal para eventos
  - Campos:
    - `nombre`: Nombre del evento (requerido)
    - `descripcion`: Descripción del evento (opcional)
    - `fecha_inicio`: Fecha y hora de inicio (requerido)
    - `fecha_fin`: Fecha y hora de fin (opcional)
    - `tipo_evento_id`: Tipo de evento (requerido)
    - `created_by`: Usuario que crea el evento
    - `team_id`: Equipo asociado (opcional)
    - `departamento_id`: Departamento asociado (opcional)
  - Relaciones:
    - `tipoEvento`: Tipo de evento
    - `createdBy`: Usuario creador
    - `users`: Participantes
    - `team`: Equipo asociado
    - `departamento`: Departamento asociado

### Controladores
- `EventoController.php`: Maneja las vistas y acciones web
- `API/v1/User/EventoController.php`: Maneja las peticiones API

### Servicios
- `EventService.php`: Lógica de negocio y validaciones
  - Métodos principales:
    - `createEvento`: Crea un nuevo evento y asigna participantes
    - `updateEvento`: Actualiza un evento existente
    - `removeParticipant`: Elimina un participante
    - `canCreateEvento`: Verifica permisos de creación
    - `canManageEvento`: Verifica permisos de gestión

### Requests
- `EventoRequest.php`: Validación de formularios
  - Reglas:
    - `nombre`: Requerido, string, máx 255 caracteres
    - `descripcion`: Opcional, string
    - `fecha_inicio`: Requerido, fecha válida
    - `fecha_fin`: Opcional, fecha posterior o igual a fecha_inicio
    - `tipo_evento_id`: Requerido, debe existir
    - `team_id`: Opcional, debe existir
    - `departamento_id`: Opcional, debe existir

### Resources
- `EventoResource.php`: Transformación de datos para API
- `TipoEventoResource.php`: Transformación de datos para API

### Rutas
#### Web Routes (Inertia)
```php
Route::prefix('user')
    ->name('user.')
    ->group(function () {
        // Rutas CRUD básicas
        Route::resource('eventos', EventoController::class)
            ->except(['create', 'edit']);
        
        // Rutas adicionales
        Route::controller(EventoController::class)
            ->prefix('eventos')
            ->name('eventos.')
            ->group(function () {
                Route::get('/tipos', 'tipos')->name('tipos');
                Route::delete('/{evento}/participants/{userId}', 'removeParticipant')
                    ->name('participants.remove');
            });
    });
```

#### Nombres de Rutas Disponibles
| Método | URI | Nombre | Acción |
|--------|-----|---------|--------|
| GET | /user/eventos | user.eventos.index | Listar eventos |
| POST | /user/eventos | user.eventos.store | Crear evento |
| GET | /user/eventos/{evento} | user.eventos.show | Ver evento |
| PUT/PATCH | /user/eventos/{evento} | user.eventos.update | Actualizar evento |
| DELETE | /user/eventos/{evento} | user.eventos.destroy | Eliminar evento |
| GET | /user/eventos/tipos | user.eventos.tipos | Listar tipos |
| DELETE | /user/eventos/{evento}/participants/{userId} | user.eventos.participants.remove | Eliminar participante |

## Flujo de Trabajo

### 1. Creación de Evento
1. Usuario accede a la vista de creación
2. Sistema valida permisos según tipo de evento
3. Usuario completa formulario
4. EventoRequest valida datos
5. EventService procesa la creación:
   - Crea el evento
   - Agrega usuarios específicos
   - Agrega usuarios del departamento si aplica
   - Agrega usuarios del equipo si aplica
   - Asegura que el creador sea participante

### 2. Consulta de Eventos
1. Usuario accede al listado (`user.eventos.index`)
2. EventService filtra eventos según permisos
3. Se cargan relaciones necesarias (withFullRelations)
4. Se transforman datos según el contexto (web/api)

### 3. Modificación de Evento
1. Usuario solicita modificar evento (`user.eventos.update`)
2. EventService valida permisos
3. EventoRequest valida datos
4. Se actualizan datos y relaciones
5. Se notifica a participantes (pendiente)

### 4. Gestión de Participantes
- Los participantes se agregan automáticamente según el tipo de evento
- El creador siempre es participante
- Se pueden agregar participantes adicionales
- No se puede eliminar al creador como participante

## Reglas de Negocio
1. Un usuario solo puede tener un rol
2. Los contratos vigentes determinan la visibilidad de eventos departamentales
3. No hay sistema de invitaciones, los participantes son agregados directamente
4. Los participantes pueden salir del evento o ser eliminados
5. No hay límite de participantes por evento
6. Solo el creador puede modificar el evento (excepto roles superiores)

## Consideraciones Técnicas
1. Uso de soft deletes para eventos
2. Transacciones DB para asegurar integridad
3. Eager loading para optimizar consultas
4. Validaciones centralizadas
5. Lógica de negocio en servicios
6. Manejo automático de participantes según tipo de evento

## Futuras Implementaciones
1. Sistema de notificaciones
2. Notificaciones por email
3. Archivos adjuntos
4. Historial de cambios
5. Calendario integrado