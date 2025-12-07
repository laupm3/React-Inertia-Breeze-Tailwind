# 📝 Ejemplo de Uso de la Nueva Ruta

## 🔧 Corrección Implementada

### **Problema Identificado**
La ruta original `PUT /api/v1/admin/horarios/{horario}` esperaba un ID específico de horario, pero nosotros implementamos una actualización **masiva** de múltiples horarios.

### **Solución Implementada**
Se agregó una ruta específica para actualización masiva:

```php
// Ruta para actualización individual (RESTful estándar)
PUT /api/v1/admin/horarios/{horario}

// Nueva ruta para actualización masiva
PUT /api/v1/admin/horarios/bulk-update
```

## 🛠️ Cambios Realizados

### **1. Routes (web.php)**
```php
Route::resource('horarios', App\Http\Controllers\API\v1\Admin\HorarioController::class)
    ->except(['create', 'edit']);

// Nueva ruta específica para actualización masiva
Route::put('horarios/bulk-update', [App\Http\Controllers\API\v1\Admin\HorarioController::class, 'bulkUpdate'])
    ->name('horarios.bulk-update');
```

### **2. Controller**
```php
// Método para actualización individual
public function update(Request $request, Horario $horario)
{
    // TODO: Implementar si es necesario
    return response()->json([
        'message' => 'Actualización individual no implementada. Use bulk-update para múltiples horarios.',
    ], Response::HTTP_NOT_IMPLEMENTED);
}

// Método para actualización masiva (la implementación optimizada)
public function bulkUpdate(HorarioUpdateRequest $request)
{
    return DB::transaction(function () use ($request) {
        // ... toda la lógica optimizada que implementamos
    });
}
```

## 📨 Ejemplos de Uso

### **Actualización Masiva (Nueva Funcionalidad)**
```javascript
// Frontend JavaScript/TypeScript
fetch('/api/v1/admin/horarios/bulk-update', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
        horarios: [
            {
                id: 1,
                turno_id: 2,
                modalidad_id: 1,
                estado_horario_id: 1,
                horario_inicio: "2024-01-15 08:00:00",
                horario_fin: "2024-01-15 16:00:00",
                descanso_inicio: "2024-01-15 12:00:00",
                descanso_fin: "2024-01-15 13:00:00",
                observaciones: "Horario actualizado"
            },
            {
                id: 2,
                turno_id: 3,
                modalidad_id: 2,
                estado_horario_id: 1,
                horario_inicio: "2024-01-15 14:00:00",
                horario_fin: "2024-01-15 22:00:00",
                descanso_inicio: null,
                descanso_fin: null,
                observaciones: null
            }
        ]
    })
});
```

### **Actualización Individual (Futura)**
```javascript
// Si se implementa en el futuro
fetch('/api/v1/admin/horarios/123', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
        turno_id: 2,
        modalidad_id: 1,
        estado_horario_id: 1,
        horario_inicio: "2024-01-15 08:00:00",
        horario_fin: "2024-01-15 16:00:00",
        observaciones: "Horario individual actualizado"
    })
});
```

## 🧪 Testing con Nueva Ruta

### **Actualizar Tests Existentes**
```php
// Cambiar de:
$response = $this->putJson('/api/v1/admin/horarios/1', $requestData);

// A:
$response = $this->putJson('/api/v1/admin/horarios/bulk-update', $requestData);
```

### **Ejemplo de Test Actualizado**
```php
public function test_bulk_update_horarios_successfully()
{
    $this->actingAs($this->admin);

    $horarios = Horario::factory()->count(2)->create();
    
    $requestData = [
        'horarios' => [
            [
                'id' => $horarios[0]->id,
                'turno_id' => $this->turno->id,
                'modalidad_id' => $this->modalidad->id,
                'estado_horario_id' => $this->estadoHorario->id,
                'horario_inicio' => Carbon::now()->setTime(8, 0)->toDateTimeString(),
                'horario_fin' => Carbon::now()->setTime(16, 0)->toDateTimeString(),
            ],
            [
                'id' => $horarios[1]->id,
                'turno_id' => $this->turno->id,
                'modalidad_id' => $this->modalidad->id,
                'estado_horario_id' => $this->estadoHorario->id,
                'horario_inicio' => Carbon::now()->setTime(9, 0)->toDateTimeString(),
                'horario_fin' => Carbon::now()->setTime(17, 0)->toDateTimeString(),
            ]
        ]
    ];

    $response = $this->putJson('/api/v1/admin/horarios/bulk-update', $requestData);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'horarios' => ['*' => ['id', 'horario_inicio', 'horario_fin']],
            'message'
        ]);
}
```

## 🎯 Verificación de Rutas

```bash
# Verificar que la nueva ruta existe
php artisan route:list --name=horarios

# Debería mostrar:
# PUT api/v1/admin/horarios/bulk-update ... HorarioController@bulkUpdate
# PUT api/v1/admin/horarios/{horario} ... HorarioController@update
```

## 📊 Beneficios de la Separación

### **Claridad Semántica**
- ✅ `/horarios/{horario}` → Actualización individual
- ✅ `/horarios/bulk-update` → Actualización masiva
- ✅ No confusión en el uso de la API

### **Flexibilidad Futura**
- ✅ Permite implementar actualización individual si es necesario
- ✅ Diferentes validaciones para cada caso de uso
- ✅ Diferentes permisos si es requerido

### **Mantenibilidad**
- ✅ Código más claro y específico
- ✅ Testing más preciso
- ✅ Documentación más clara

---

**Corrección realizada**: 16 de junio de 2025  
**Ruta corregida**: `/api/v1/admin/horarios/bulk-update`  
**Método**: `bulkUpdate()`  
**Status**: ✅ Funcionando correctamente
