**Escenario Base**:
- Un empleado tiene dos horarios para hoy:
  - Horario 1: 8:00 - 15:00
  - Horario 2: 15:00 - 22:00

**Casos a Considerar**:

1. **Caso Ideal**:
```
- Empleado ficha Horario 1 a las 8:00 (estado: en_curso)
- Al llegar a las 15:00:
  - Verifica que Horario 1 está en_curso
  - Verifica que existe Horario 2 que empieza ahora
  - Finaliza Horario 1
  - Inicia Horario 2
```

2. **Caso No Fichó Primer Horario**:
```
- Empleado no fichó a las 8:00
- Ficha directamente Horario 2 a las 15:00
- No se debe modificar el Horario 1
```

3. **Caso Finalizó Antes**:
```
- Empleado fichó Horario 1 a las 8:00
- Finalizó manualmente a las 14:30
- Al llegar a las 15:00:
  - No hacer nada porque ya está finalizado
```

4. **Caso Estado Incorrecto**:
```
- Horario 1 está en pausa/descanso
- No realizar transición automática
- Requiere intervención manual
```

5. **Caso Descanso Obligatorio en horario sin descanso obligatorio**:
```
- El descanso obligatorio se decide tomar en el primer horario el cual no tiene descanso obligatorio.
- Se agrega descanso obligatorio al primer horario y se contabiliza el horario completo del segundo.
```

6. **Caso Descanso Obligatorio en horario sin descanso obligatorio con parcialidad**:
```
- El descanso obligatorio se decide tomar en el primer horario el cual no tiene descanso obligatorio y además esta coincide con una parcialidad del descanso obligatorio tomando el resto del descanso en el segundo horario.
- Se agrega una parte del descanso obligatorio al primer horario y el resto al segundo horario.
- Requiere intervención manual para reactivarse.
```
