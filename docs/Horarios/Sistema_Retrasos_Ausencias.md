# Sistema de Detección y Gestión de Retrasos y Ausencias

## Descripción General

Este sistema permite la detección automática de retrasos y ausencias en los horarios laborales, generando notificaciones y gestionando justificantes (`AbsenceNote`) para los empleados. Está diseñado para integrarse con el proyecto **React-Inertia-Breeze-Tailwind-Socialite**.

---

## Arquitectura

El sistema utiliza una arquitectura orientada a eventos con los siguientes componentes:

```
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│ RetrasosService  ────►  Eventos    │────────► Listeners   │
└─────────────┘        └─────────────┘        └─────────────┘
       │                                            │
       ▼                                            ▼
┌─────────────┐                             ┌─────────────┐
│ AbsenceNote │                             │Notificaciones│
└─────────────┘                             └─────────────┘
```

## Reglas de Negocio

1. **Retraso Menor** (<15 min):
   - No requiere acción especial.
   - Se registra en logs para seguimiento.

2. **Retraso Significativo** (15-60 min):
   - Notificación automática al manager directo.
   - No requiere justificante obligatorio.

3. **Ausencia Mayor** (>60 min):
   - Notificación automática al manager y RRHH.
   - Creación automática de `AbsenceNote` en estado `PENDING`.
   - Requiere justificante obligatorio.

4. **Estados del Justificante (`AbsenceNote`)**:
   - `PENDING`: Pendiente de revisión.
   - `APPROVED`: Justificante aprobado, horario marcado como justificado.
   - `REJECTED`: Justificante rechazado, mantiene estado de absentismo.

---

## Componentes Principales

### 1. Modelo Horario

El modelo `Horario` incluye métodos para detectar retrasos y gestionar justificantes:

```php
tieneRetrasoSignificativo()  // Detecta retrasos entre 15-60 min.
tieneAusenciaMayor()         // Detecta retrasos mayores a 60 min.
getMinutosRetraso()          // Calcula minutos de retraso exactos.
requiereJustificante()       // Determina si se requiere justificante.
tieneNotaAusencia()          // Verifica si ya existe un justificante.
absenceNote()                // Relación con la nota de ausencia.
marcarComoJustificado()      // Actualiza estado a justificado.
```

### 2. Servicio `RetrasosService`

El servicio `RetrasosService` procesa fichajes y evalúa retrasos:

```php
verificarRetrasos(Horario $horario)    // Analiza retrasos y dispara eventos.
crearNotaAusencia()                    // Genera AbsenceNote automáticamente.
procesarFichaje(Horario $horario)      // Punto de entrada principal.
```

### 3. Eventos

Eventos principales para notificación:

- **RetrasoDetectado**: Para retrasos entre 15-60 minutos.
- **AusenciaMayorDetectada**: Para retrasos mayores a 60 minutos.
- **HorarioCreado**: Para cuando se crea un nuevo horario.
- **HorarioActualizado**: Para cuando se actualiza un horario existente.
- **HorarioEliminado**: Para cuando se elimina un horario.

### 4. Listeners

Los listeners procesan eventos y envían notificaciones:

- `NotificarRetrasoSignificativo`: Notifica a managers sobre retrasos.
- `NotificarAusenciaMayor`: Notifica a managers y RRHH sobre ausencias mayores.
- `NotificarHorarioCreado`: Notifica a los administradores cuando se crea un horario.
- `NotificarHorarioActualizado`: Notifica a los administradores cuando se actualiza un horario.
- `NotificarHorarioEliminado`: Notifica a los administradores cuando se elimina un horario.

### 5. AbsenceNote (Justificantes)

El modelo `AbsenceNote` gestiona las justificaciones de ausencias y retrasos:

```php
// Estados principales
PENDING   // Pendiente de revisión.
APPROVED  // Justificante aprobado.
REJECTED  // Justificante rechazado.
```

### 6. GenericNotificationTrait

La lógica de notificaciones se gestiona a través del `GenericNotificationTrait`, que proporciona métodos genéricos para enviar notificaciones y es utilizado por todos los listeners relacionados con horarios.

---

## Flujo de Trabajo

**Detección:**
- Un fichaje se registra o actualiza en `HorarioController`.
- Se llama a `retrasosService->procesarFichaje()`.

**Evaluación:**
- Se verifica si ya existe un justificante aprobado.
- Se analiza la magnitud del retraso (menor, significativo, mayor).

**Acción:**
- Para retrasos >15min: se dispara evento `RetrasoDetectado`.
- Para ausencias >60min: se crea `AbsenceNote` y dispara `AusenciaMayorDetectada`.
- Para la creación, actualización o eliminación de horarios, se disparan los eventos correspondientes.

**Notificación:**
- Los listeners procesan eventos y envían notificaciones a destinatarios correspondientes utilizando la configuración en `notifications.php` y el trait genérico.

**Justificación:**
- Empleado o RRHH puede subir documentación justificante.
- Manager/RRHH puede aprobar o rechazar justificante.
- Si se aprueba, el horario cambia a estado "Justificado".

---

## Comandos Útiles

### 1. **Verificación Masiva de Retrasos**

```bash
# Verifica retrasos del día actual
php artisan horarios:verificar-retrasos

# Verifica retrasos de un periodo específico
php artisan horarios:verificar-retrasos --desde=2025-07-01 --hasta=2025-07-31
```

### 2. **Probar los Listeners**

Ejecuta el comando para probar los listeners con un horario específico:

```bash
php artisan listeners:test {horario_id} --retraso=30
```

Por ejemplo:

```bash
php artisan listeners:test 1 --retraso=45
```

Esto ejecutará los listeners asociados a los eventos `RetrasoDetectado` y `AusenciaMayorDetectada` para el horario con ID `1`.

### 3. **Listar las Notas de Ausencia**

Ejecuta el comando para listar todas las notas de ausencia:

```bash
php artisan absence-notes:list
```

Para listar las notas de ausencia asociadas a un horario específico:

```bash
php artisan absence-notes:list {horario_id}
```

Por ejemplo:

```bash
php artisan absence-notes:list 1
```

Esto mostrará todas las notas de ausencia asociadas al horario con ID `1`.

---

## Integración en Controladores

### Controlador Principal (API HorarioController)

El sistema está diseñado para funcionar principalmente a través del servicio `RetrasosService`. La lógica de detección de retrasos se ejecuta automáticamente cuando se procesan los fichajes en el controlador principal:

```php
// filepath: app\Http\Controllers\API\v1\User\HorarioController.php

public function update(Request $request, Horario $horario)
{
    // Código existente para actualizar el horario
    
    // Procesar fichaje en busca de retrasos si se actualizó el campo fichaje_entrada
    if ($horario->isDirty('fichaje_entrada')) {
        $this->retrasosService->procesarFichaje($horario);
    }
    
    // Resto del código
}
```

---

## Consideraciones Técnicas

- **Rendimiento:** La detección se realiza solo cuando cambia el campo `fichaje_entrada`.
- **Duplicidad:** Se verifica si ya existe un `AbsenceNote` antes de crear uno nuevo.
- **Estados:** Se respeta el estado de justificantes aprobados para no generar notificaciones redundantes.
- **Configuración:** Los umbrales (15 min y 60 min) podrían ser configurables en el futuro.

---

## Próximos Pasos

- Implementar la lógica de `getManagersDeEmpleado()` para recuperar managers reales.
- Completar las implementaciones de envío de notificaciones concretas.
- Crear interfaz para que empleados suban justificantes.
- Implementar vistas de aprobación/rechazo para managers y RRHH.
- Añadir configuración dinámica de umbrales de retraso.

---

## Conclusión

Este sistema proporciona una solución robusta para la detección automática de retrasos y ausencias, generando notificaciones apropiadas y facilitando el proceso de justificación.
