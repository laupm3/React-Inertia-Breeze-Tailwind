# Documentación API de Eventos - Teams, Departamentos y Empresas

## Rutas de API
Todas las rutas requieren autenticación (`auth:sanctum`) y verificación.

### Base URL
```
/api/v1/user/eventos
```

## Endpoints

### Obtener Equipos con Permisos
Retorna los equipos donde el usuario tiene permisos de crear y actualizar.

```
GET /eventos/teams
```

#### Respuesta
```json
{
    "teams": [
        {
            "id": 1,
            "name": "Nombre del Equipo",
            "personal_team": true,
            "permissions": ["create", "update", "read"]
        }
    ]
}
```

### Obtener Departamentos con Contrato
Retorna los departamentos donde el usuario tiene un contrato activo.

```
GET /eventos/departamentos
```

#### Respuesta
```json
{
    "departments": [
        {
            "id": 1,
            "nombre": "Nombre del Departamento"
        }
    ]
}
```

### Obtener Empresas con Permisos
Retorna las empresas si el usuario tiene permisos para crear eventos de empresa.

```
GET /eventos/empresas
```

#### Respuesta
```json
{
    "empresas": [
        {
            "id": 1,
            "nombre": "Nombre de la Empresa"
        }
    ]
}
```

## Servicios

### EventService
Ubicación: `app/Services/EventService.php`

#### Métodos
```php
/**
 * Obtener equipos donde el usuario tiene permisos de crear y actualizar
 *
 * @param User $user
 * @return Collection
 */
public function getTeamsWithPermissions(User $user): Collection

/**
 * Obtener empresas si el usuario tiene permisos para crear eventos de empresa
 *
 * @param User $user
 * @return Collection
 */
public function getEmpresasWithPermissions(User $user): Collection
```

## Resources

### TeamResource
Ubicación: `app/Http/Resources/TeamResource.php`

Transforma el modelo Team en una respuesta JSON con los siguientes campos:
- id
- name
- personal_team
- permissions

### DepartamentoResource
Ubicación: `app/Http/Resources/DepartamentoResource.php`

Transforma el modelo Departamento en una respuesta JSON con los siguientes campos:
- id
- nombre

### EmpresaResource
Ubicación: `app/Http/Resources/EmpresaResource.php`

Transforma el modelo Empresa en una respuesta JSON con los siguientes campos:
- id
- nombre

## Controlador
Ubicación: `app/Http/Controllers/API/v1/User/EventoController.php`

### Métodos
```php
/**
 * Obtener equipos donde el usuario tiene permisos de crear y actualizar
 * 
 * @return \Illuminate\Http\JsonResponse
 */
public function getTeamsWithPermissions()

/**
 * Obtener los departamentos del usuario en los que tiene un contrato activo
 * 
 * @return \Illuminate\Http\JsonResponse
 */
public function getDepartmentsWithContract()

/**
 * Obtener empresas donde el usuario tiene permisos para crear eventos
 * 
 * @return \Illuminate\Http\JsonResponse
 */
public function getEmpresasWithPermissions()
```

## Notas
- Todas las rutas están protegidas por autenticación
- Los permisos se verifican a nivel de servicio
- Las respuestas siguen un formato consistente usando Resources
- Se manejan casos donde el usuario no tiene acceso o datos asociados
- Las rutas están agrupadas bajo el prefijo `api/v1/user` para mantener una estructura organizada
- Todas las rutas están protegidas por autenticación
- Los permisos se verifican a nivel de servicio
- Las respuestas siguen un formato consistente usando Resources
- Se manejan casos donde el usuario no tiene acceso o datos asociados
- Las rutas están agrupadas bajo el prefijo `api/v1/user` para mantener una estructura organizada

### Equipos, Departamentos y Empresas

```javascript
// Obtener equipos con permisos de crear y actualizar del usuario autenticado
const teamsUrl = route('api.v1.user.eventos.teams');

// Obtener departamentos con contrato activo del usuario autenticado
const departmentsUrl = route('api.v1.user.eventos.departamentos');

// Obtener empresas donde el usuario tiene permisos para crear eventos
const empresasUrl = route('api.v1.user.eventos.empresas');
```

