# Sistema de Gestión de Anexos de Contrato
![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=flat&logo=laravel)
![Inertia](https://img.shields.io/badge/Inertia-0.11.x-9B4DCA)
![Breeze](https://img.shields.io/badge/Breeze-1.x-6C757D)

## 📝 Descripción General
Sistema de gestión de anexos para contratos laborales que permite a los administradores crear, actualizar y eliminar anexos con validaciones robustas de fechas y control de permisos.

## 🚀 Características Principales
- CRUD completo de anexos
- Validación robusta de fechas
- Control de permisos granular
- Soft delete para mantener histórico
- API RESTful
- Tests automatizados

## 🛣️ Endpoints de la API

### Crear Anexo
```http
POST /api/v1/admin/contratos/{contrato}/anexos
```
**Request Body:**
```json
{
  "jornada_id": 1,
  "fecha_inicio": "2025-06-18 09:00:00",
  "fecha_fin": "2025-07-18 18:00:00"
}
```

### Actualizar Anexo
```http
PUT /api/v1/admin/contratos/{contrato}/anexos/{anexo}
```

### Eliminar Anexo
```http
DELETE /api/v1/admin/contratos/{contrato}/anexos/{anexo}
```

## 🔒 Sistema de Permisos
| Operación | Permiso Requerido |
|-----------|------------------|
| Crear     | `createAnnexes`  |
| Editar    | `editAnnexes`    |
| Eliminar  | `deleteAnnexes`  |

## ✅ Validaciones
- **fecha_inicio:**
  - Requerido
  - Formato datetime válido
- **fecha_fin:**
  - Requerido
  - Formato datetime válido
  - Debe ser posterior a fecha_inicio
- **jornada_id:**
  - Opcional
  - Debe existir en la tabla jornadas

## 🏗️ Estructura Técnica

### Componentes Principales
- **Controlador:** `app/Http/Controllers/API/v1/Admin/ContratoController.php`
- **Requests:**
  - `AnexoStoreRequest` (creación)
  - `AnexoUpdateRequest` (edición)
- **Modelo:** `App\Models\Anexo`
- **Rutas:** `routes/api.php`

### Validación Personalizada
```php
// AppServiceProvider.php
Validator::extend('datetime', function ($attribute, $value, $parameters, $validator) {
    return strtotime($value) !== false;
});

// AnexoStoreRequest.php
public function rules(): array
{
    return [
        'jornada_id' => ['nullable', 'exists:jornadas,id'],
        'fecha_inicio' => ['required', 'datetime'],
        'fecha_fin' => ['required', 'datetime', 'after:fecha_inicio'],
    ];
}
```

## 🧪 Tests
```bash
php artisan test tests/Feature/Http/Controllers/API/v1/Admin/ContratoAnexoTest.php
```

Se incluyen tests para:
- Creación exitosa de anexos
- Validación de datos inválidos
- Actualización de anexos
- Eliminación de anexos
- Validación de fechas
- Verificación de permisos
- Autenticación requerida

## 📋 Respuestas de la API

### Creación Exitosa
```json
{
  "anexo": {
    "id": 1,
    "contrato_id": 123,
    "jornada_id": 1,
    "fecha_inicio": "2025-06-18 09:00:00",
    "fecha_fin": "2025-07-18 18:00:00"
  },
  "message": "Anexo creado correctamente."
}
```

### Error de Validación
```json
{
  "message": "Los datos proporcionados no son válidos.",
  "errors": {
    "fecha_fin": [
      "La fecha fin debe ser posterior a la fecha inicio"
    ]
  }
}
```

## 📝 Notas
- Compatible con Laravel 11+
- Validación robusta de fechas
- Soft delete implementado
- Control de permisos obligatorio
- Tests completos de integración

---

**Autor:** Equipo de desarrollo RRHH  
**Última actualización:** Junio 2025
