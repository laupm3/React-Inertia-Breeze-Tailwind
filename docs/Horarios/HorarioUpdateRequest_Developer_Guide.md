# HorarioUpdateRequest - Documentación para Desarrolladores

## Descripción
Clase optimizada para validación y manejo de requests de actualización masiva de horarios con implementaciones de performance avanzadas.

## 📁 Ubicación
`app/Http/Requests/Horario/HorarioUpdateRequest.php`

## 🔧 Características Principales

### **1. Validación Optimizada**
- Validación customizada con `withValidator()` 
- Una sola query para validar existencia de múltiples horarios
- Caché inteligente de resultados de validación

### **2. Métodos Públicos**

#### `authorize(): bool`
```php
public function authorize(): bool
{
    return $this->user()->hasPermissionTo('editSchedule', 'web');
}
```
**Descripción**: Verifica que el usuario tenga permisos para editar horarios.
**Retorna**: `true` si autorizado, `false` en caso contrario.

#### `rules(): array`
```php
public function rules(): array
{
    return [
        'horarios' => 'required|array|min:1',
        'horarios.*.id' => 'required|integer', // Sin exists - validado en withValidator
        'horarios.*.turno_id' => 'required|integer|exists:turnos,id',
        // ... más reglas
    ];
}
```
**Descripción**: Define las reglas de validación básicas.
**Nota**: `horarios.*.id` NO usa `exists` rule para evitar queries innecesarias.

#### `withValidator(Validator $validator): void`
```php
public function withValidator(Validator $validator): void
{
    $validator->after(function (Validator $validator) {
        if ($validator->errors()->isNotEmpty()) {
            return; // Skip si ya hay errores
        }

        $horarioIds = collect($this->input('horarios', []))->pluck('id')->filter();
        
        // ✅ UNA SOLA QUERY para validar existencia
        $this->validatedHorarios = Horario::whereIn('id', $horarioIds)->get()->keyBy('id');
        
        // Validar usando resultados en memoria
        foreach ($this->input('horarios', []) as $index => $horarioData) {
            if (!isset($horarioData['id']) || !$this->validatedHorarios->has($horarioData['id'])) {
                $validator->errors()->add(
                    "horarios.{$index}.id",
                    'El horario especificado no existe.'
                );
            }
        }
    });
}
```
**Descripción**: Validación customizada que optimiza queries de existencia.
**Performance**: O(1) en lugar de O(n) queries.

#### `getValidatedHorarios(): Collection`
```php
public function getValidatedHorarios()
{
    // Retorna caché si está disponible
    if ($this->validatedHorarios !== null) {
        return $this->validatedHorarios;
    }

    // Fallback (no debería ejecutarse después de withValidator)
    $horarioIds = collect($this->validated()['horarios'])->pluck('id');
    $this->validatedHorarios = Horario::whereIn('id', $horarioIds)->get()->keyBy('id');
    
    return $this->validatedHorarios;
}
```
**Descripción**: Retorna horarios validados con acceso eficiente por ID.
**Performance**: 0 queries adicionales al usar caché de `withValidator()`.
**Retorna**: `Collection` keyed por ID para acceso O(1).

#### `getHorarioData(): array`
```php
public function getHorarioData(): array
{
    return $this->validated()['horarios'];
}
```
**Descripción**: Retorna array de datos de horarios validados.
**Uso**: Para iteración en el controller.

### **3. Propiedades Privadas**

#### `$validatedHorarios`
```php
private $validatedHorarios = null;
```
**Descripción**: Caché de horarios validados para evitar queries duplicadas.
**Tipo**: `Collection|null`
**Inicialización**: En `withValidator()` durante la validación.

## 🚀 Flujo de Optimización

### **Secuencia de Ejecución**
1. **Laravel ejecuta** `rules()` - validaciones básicas
2. **Laravel ejecuta** `withValidator()` - validación customizada
   - Ejecuta 1 query para obtener horarios
   - Valida existencia usando resultados
   - Cachea horarios en `$validatedHorarios`
3. **Controller llama** `getValidatedHorarios()` - retorna caché
4. **Controller llama** `getHorarioData()` - retorna datos validados

### **Queries Ejecutadas**
- **Validación Laravel**: 0 queries (removimos `exists`)
- **withValidator()**: 1 query (batch select)
- **getValidatedHorarios()**: 0 queries (usa caché)
- **Total**: 1 query vs N+1 queries anteriormente

## 📊 Comparación de Performance

### **Implementación Anterior**
```php
// ❌ N queries individuales
'horarios.*.id' => 'exists:horarios,id'

// ❌ Query adicional en controller
$horarios = Horario::whereIn('id', $ids)->get();
```

### **Implementación Optimizada**
```php
// ✅ 0 queries en rules
'horarios.*.id' => 'required|integer'

// ✅ 1 query total en withValidator
$this->validatedHorarios = Horario::whereIn('id', $horarioIds)->get()->keyBy('id');

// ✅ 0 queries adicionales
return $this->validatedHorarios; // Caché
```

## 🧪 Testing

### **Test de Performance**
```php
public function test_validation_performance_with_multiple_horarios()
{
    $horarios = Horario::factory()->count(10)->create();
    $data = ['horarios' => $horarios->map(fn($h) => ['id' => $h->id, ...])];
    
    DB::enableQueryLog();
    $request = new HorarioUpdateRequest();
    $validator = Validator::make($data, $request->rules());
    $request->withValidator($validator);
    
    $queries = DB::getQueryLog();
    $this->assertCount(1, $queries); // Solo 1 query
}
```

### **Test de Caché**
```php
public function test_get_validated_horarios_uses_cache()
{
    $request = new HorarioUpdateRequest();
    // ... setup data
    
    DB::enableQueryLog();
    $request->getValidatedHorarios(); // Primera llamada
    $request->getValidatedHorarios(); // Segunda llamada
    
    $queries = DB::getQueryLog();
    $this->assertCount(0, $queries); // No queries adicionales
}
```

## 🔍 Casos de Uso

### **Controller Integration**
```php
public function update(HorarioUpdateRequest $request)
{
    return DB::transaction(function () use ($request) {
        // ✅ Horarios ya validados y cacheados
        $existingHorarios = $request->getValidatedHorarios();
        $horariosData = collect($request->getHorarioData())->keyBy('id');

        // ✅ Iteración eficiente con Collections
        $existingHorarios->each(function ($horario) use ($horariosData) {
            $horarioData = $horariosData->get($horario->id);
            $horario->update([...]);
        });
        
        // ✅ Batch loading de relaciones
        $horariosWithRelations = Horario::with(Horario::RELATIONSHIPS)
            ->whereIn('id', $existingHorarios->pluck('id'))
            ->get();

        return response()->json([
            'horarios' => HorarioResource::collection($horariosWithRelations),
            'message' => 'Horarios actualizados correctamente.'
        ]);
    });
}
```

## 📝 Notas de Implementación

### **Consideraciones**
- El caché `$validatedHorarios` es por instancia de Request
- `withValidator()` se ejecuta automáticamente por Laravel
- El fallback en `getValidatedHorarios()` es por seguridad, no debería ejecutarse
- Compatible con Laravel's validation system sin breaks

### **Limitaciones**
- Máximo recomendado: ~100 horarios por request
- Requiere memoria suficiente para cachear horarios
- Los horarios deben existir al momento de validación

### **Extensibilidad**
- Fácil agregar más validaciones en `withValidator()`
- Patrón reutilizable para otras entidades
- Compatible con middleware de rate limiting

---

**Última actualización**: 16 de junio de 2025  
**Versión**: v1.0  
**Autor**: Equipo de Desarrollo
