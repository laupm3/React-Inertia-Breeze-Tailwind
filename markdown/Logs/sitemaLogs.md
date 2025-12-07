# Documentación Simple: Sistema de Eventos Genéricos Polimórficos

---

Un sistema que **registra automáticamente** todos los cambios que ocurren en cualquier modelo de tu aplicación (cuando se crea, actualiza o elimina un registro).

---


## 🏗️ Diagrama del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA DE EVENTOS                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   MODELO    │    │    TRAIT    │    │   EVENTO    │
│             │    │             │    │             │
│ Empleado    │───▶│HasLogsEvents│───▶│ModelChanged │
│ Departamento│    │             │    │             │
│ Contrato    │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  LISTENER   │    │     JOB     │    │   BASE DE   │
│             │    │             │    │   DATOS     │
│HandleModel  │───▶│ProcessLogs  │───▶│LogsEvent    │
│Changed      │    │Event        │    │             │
└─────────────┘    └─────────────┘    └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    COLA ASÍNCRONA                           │
│  • Procesa eventos en segundo plano                        │
│  • No afecta el rendimiento de la aplicación               │
│  • Reintenta automáticamente si falla                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Archivos y Funciones

### **1. Migración** (`database/migrations/2024_01_01_000000_create_logs_events_table.php`)
**¿Qué hace?** Crea la tabla en la base de datos para guardar todos los eventos.

**Campos importantes:**
- `event_type`: Tipo de evento (creado, actualizado, eliminado)
- `model_type`: Qué modelo se modificó
- `model_id`: ID del registro modificado
- `changes`: Qué campos cambiaron
- `original`: Campos antiguos
- `user_id`: Quién hizo el cambio
- `ip_address`: Desde qué IP se hizo
- `user_agent`: Qué navegador/aplicación se usó

---

### **2. Modelo** (`app/Models/LogsEvent.php`)
**¿Qué hace?** Maneja la tabla de eventos y permite hacer consultas.

**Funciones principales:**
- `eventable()`: Obtiene el modelo que generó el evento
- `scopeOfType()`: Filtra por tipo de evento
- `scopeForModel()`: Filtra por tipo de modelo

---

### **3. Evento** (`app/Events/Logs/ModelChanged.php`)
**¿Qué hace?** Contiene toda la información del cambio que ocurrió.

**Datos que guarda:**
- Tipo de evento (creado/actualizado/eliminado)
- Modelo que se modificó
- Datos del modelo
- Cambios específicos
- Información del usuario

---

### **4. Trait** (`app/Traits/HasLogsEvents.php`)
**¿Qué hace?** Se agrega a los modelos para que detecten automáticamente los cambios.

**Funciones principales:**
- `bootHasLogsEvents()`: Configura los listeners automáticos
- `dispatchLogsEvent()`: Envía el evento cuando algo cambia

**Eventos que detecta:**
- `created`: Cuando se crea un registro
- `updated`: Cuando se actualiza un registro
- `deleted`: Cuando se elimina un registro

---

### **5. Listener** (`app/Listeners/Logs/HandleModelChanged.php`)
**¿Qué hace?** Recibe el evento y lo envía a la cola para procesamiento asíncrono.

**Funciones principales:**
- `handle()`: Procesa el evento y crea el job
- Configuración de cola: `events`
- Timeout: 60 segundos
- Reintentos: 3 veces

---

### **6. Job** (`app/Jobs/ProcessLogsEvent.php`)
**¿Qué hace?** Se ejecuta en segundo plano y guarda el evento en la base de datos.

**Funciones principales:**
- `handle()`: Guarda el evento en la base de datos
- `failed()`: Maneja errores si algo falla
- Timeout: 60 segundos
- Reintentos: 3 veces

---

### **7. EventServiceProvider** (`app/Providers/EventServiceProvider.php`)
**¿Qué hace?** Conecta el evento con su listener.

**Configuración:**
- Registra `ModelChanged` → `HandleModelChanged`

---

## �� Cómo Usar

### **Paso 1: Aplicar el Trait**
```php
// En cualquier modelo que quieras monitorear
use App\Traits\HasLogsEvents;

class Empleado extends Model
{
    use HasLogsEvents;
    // ¡Listo! Ahora se registrarán todos los cambios
}
```

### **Paso 2: Ejecutar Migraciones**
```bash
php artisan migrate
```

### **Paso 3: Iniciar Worker de Colas**
```bash
php artisan queue:work
php artisan queue:work --queue=events,default
```

```bash
# Ver jobs pendientes
php artisan queue:monitor

# Ver jobs fallidos
php artisan queue:failed

# Reintentar jobs fallidos
php artisan queue:retry all
```
