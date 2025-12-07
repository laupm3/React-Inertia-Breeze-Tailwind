# Documentación del Sistema de Gestión de Contratos

## 1. Visión General

El sistema de gestión de contratos permite administrar el ciclo de vida completo de los contratos de empleados, desde su creación hasta su finalización. El sistema notifica a las partes interesadas sobre eventos importantes relacionados con los contratos, como vencimientos, renovaciones y cambios.

## 2. Introducción

El sistema de gestión de contratos es una funcionalidad clave de la aplicación que permite administrar contratos de empleados, notificar sobre eventos importantes y gestionar automáticamente el acceso al sistema cuando un empleado ya no tiene contratos vigentes.

## Estado Actual

El sistema está completamente implementado y funcional, con las siguientes características verificadas:

- ✅ Creación y gestión de contratos
- ✅ Detección automática de contratos vencidos y próximos a vencer
- ✅ Notificaciones configurables a todas las partes interesadas
- ✅ Desactivación automática de acceso para empleados sin contratos vigentes
- ✅ Comandos para verificación y pruebas del sistema

La última prueba completa del sistema fue realizada el 9 de julio de 2025, confirmando que todos los componentes funcionan según lo esperado.

## 3. Componentes Principales

### 3.1 Modelo de Contrato

El modelo `Contrato` almacena la información esencial de los contratos de empleados y proporciona métodos útiles para su gestión.

```php
// app/Models/Contrato.php
class Contrato extends Model
{
    use HasFactory;
    use SoftDeletes;

    // Relaciones con otros modelos
    public function empleado() { ... }
    public function tipoContrato() { ... }
    public function departamento() { ... }
    public function centro() { ... }
    public function anexos() { ... }
    public function solicitudesPermiso() { ... }
    public function jornada() { ... }
    public function horarios() { ... }
    public function permisos() { ... }

    // Métodos auxiliares
    public function diasRestantes(): int { ... }
    public function esVigente(): bool { ... }
}
```

**Métodos destacados:**

- `diasRestantes()`: Calcula los días restantes hasta que venza el contrato.
- `esVigente()`: Determina si el contrato está actualmente vigente.

### 3.2 Eventos

El sistema utiliza eventos para notificar sobre cambios en los contratos:

| Evento                        | Descripción                                           |
|-------------------------------|-------------------------------------------------------|
| ContratoCreado                | Se dispara cuando se crea un nuevo contrato           |
| ContratoActualizado           | Se dispara cuando se actualiza un contrato existente  |
| ContratoEliminado             | Se dispara cuando se elimina un contrato              |
| ContratoVencido               | Se dispara cuando un contrato llega a su fecha de fin |
| ContratoProximoAVencer        | Se dispara cuando un contrato está próximo a vencer   |
| EmpleadoSinContratosVigentes  | Se dispara cuando un empleado ya no tiene contratos vigentes |

### 3.3 Listeners

Los listeners responden a los eventos y ejecutan acciones específicas:

| Listener                       | Evento asociado                | Descripción                                                        |
|--------------------------------|-------------------------------|--------------------------------------------------------------------|
| NotificarContratoCreado        | ContratoCreado                | Notifica sobre la creación de un contrato                          |
| NotificarContratoActualizado   | ContratoActualizado           | Notifica sobre actualizaciones de un contrato                      |
| NotificarContratoEliminado     | ContratoEliminado             | Notifica sobre la eliminación de un contrato                       |
| NotificarContratoVencido       | ContratoVencido               | Notifica sobre el vencimiento de un contrato                       |
| NotificarContratoProximoAVencer| ContratoProximoAVencer        | Notifica sobre contratos próximos a vencer                         |
| DesactivarAccesoEmpleado       | EmpleadoSinContratosVigentes  | Desactiva el acceso al sistema para empleados sin contratos vigentes|

### 3.4 Comando de Verificación

El comando `VerificarContratosCommand` se ejecuta programáticamente para detectar contratos vencidos o próximos a vencer:

```php
// app/Console/Commands/VerificarContratosCommand.php
class VerificarContratosCommand extends Command
{
    protected $signature = 'contratos:verificar
                            {--solo-vencidos : Verificar solo contratos vencidos}
                            {--solo-proximos : Verificar solo contratos próximos a vencer}
                            {--dias-retrasados=1 : Verificar contratos vencidos en los últimos N días}';
    
    public function handle() { ... }
}
```

### 3.5 Comando de Creación de Contratos de Prueba

El comando `CrearContratosPruebaCommand` permite crear contratos con fechas de vencimiento específicas para probar el sistema de notificaciones:

```php
// app/Console/Commands/CrearContratosPruebaCommand.php
class CrearContratosPruebaCommand extends Command
{
    protected $signature = 'contratos:crear-pruebas
                            {--vence-hoy : Crear un contrato que vence hoy}
                            {--vence-pronto=3 : Crear un contrato que vence en X días}
                            {--vence-pasado=5 : Crear un contrato que venció hace X días}';
    
    public function handle() { ... }
}
```

El comando ofrece las siguientes características:

- Detección automática de las columnas en la tabla `contratos`
- Selección aleatoria de modelos relacionados (Empleado, TipoContrato, etc.)
- Manejo automático de campos obligatorios faltantes
- Creación de registros relacionados si es necesario (asignaciones, etc.)
- Tratamiento inteligente de errores de restricciones de integridad

### 3.6 Configuración de Notificaciones

Las notificaciones se configuran en `notifications.php`:

```php
'contrato' => [
    'created' => [ ... ],
    'updated' => [ ... ],
    'deleted' => [ ... ],
    'finalizado' => [ ... ],
    'proximo_a_vencer' => [ ... ],
    'empleado_sin_contratos' => [ ... ],
    'renovacion' => [ ... ],
],
```

## 4. Diagrama de Secuencia

El siguiente diagrama muestra la secuencia de eventos cuando un contrato vence:

```
VerificarContratosCommand → ContratoVencido → NotificarContratoVencido
  → Verificar otros contratos → EmpleadoSinContratosVigentes → DesactivarAccesoEmpleado
```
