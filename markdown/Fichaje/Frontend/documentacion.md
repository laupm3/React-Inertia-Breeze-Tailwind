## Fichajes

- Se ha manejado la ya existente lógica del `ClockContext.jsx` y se ha implementado la conexión al Backend

Por el momento se maneja una lógica de `cuatro` rutas que manejan cada una un estado del fichaje:
- `user.fichaje.inicio` ➜ Realiza el fichaje
- `user.fichaje.fin` ➜ Realiza la finalizacion del fichaje
- `user.fichaje.descanso.inicio` ➜ Realiza el inicio del descanso
- `user.fichaje.descanso.fin` ➜ Realiza la finalizacion del descanso

---

### Los valores que maneja el formulario son:

```javascript
const FormDefaultValues = () => {
  return {
    fichaje_entrada: '',
    fichaje_salida: '',
    descanso_inicio: '',
    descanso_fin: '',
    latitud: '',
    longitud: '',
    ip_address_entrada: '',
    ip_address_salida: '',
  }
};
``` 

---

### El formulario se envía con axios

- También se maneja la lógica para no poder fichar mas de una vez diaria en caso de recibir una respuesta de `finalizado`
```javascript
axios.post(route(routeName), editedForm.data)
  .then(response => {
    setState(response.data.estado)
    if (response.data.estado === 'finalizado') {
      setIsClockingIn(false);
      setIsPaused(false);
      setTimeElapsed(0);
      setStartTime(null);
      localStorage.removeItem(`clockInState_${userId}`);
    }
  })
  .catch(error => {
    console.error('Error en la solicitud:', error);
  })
``` 

---

### Actualización del formulario

- Esta se realiza con la función `updateForm()` la cual actualiza los datos cada vez que se pulsa el botón de fichaje, mandando asi los datos actualizados del momento de esta acción

```javascript
const updateForm = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  try {
    // Await the location retrieval first
    const location = await getGeolocation();
    const ip = await getUserIP();

    // Update the form's default values with the new location
    form.setData({
      ...form.data,
      fichaje_entrada: `${year}-${month}-${day}`,
      fichaje_salida: `${year}-${month}-${day}`,
      descanso_inicio: `${year}-${month}-${day}`,
      descanso_fin: `${year}-${month}-${day}`,
      latitud: location.latitude,
      longitud: location.longitude,
      ip_address_entrada: ip,
      ip_address_salida: ip,
    });
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};
``` 

---

### Funciones que manejan las acciones

- Manejo del fichaje de entrada:

```javascript
const handleClockIn = async () => {
  if (state !== 'finalizado') {
    try {
      // Then proceed with the update
      handleUpdate('user.fichaje.inicio');

      const now = new Date().getTime();
      setStartTime(now - timeElapsed * 1000);
      setIsClockingIn(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error in clock in process:', error);
      // Handle location error (e.g., show user a message)
    }
  } else if (state === 'finalizado') {
    setOpenModalAdvice(true);
  }
};
``` 

- Manejo del fichaje de salida:

```javascript
const confirmHandleFinalize = () => {
  handleUpdate('user.fichaje.fin');
  setIsClockingIn(false);
  setIsPaused(false);
  setTimeElapsed(0);
  setStartTime(null);
  localStorage.removeItem(`clockInState_${userId}`);
};
``` 

- Manejo del Inicio y finalización del descanso:

```javascript
const handlePause = () => {
  if (!isPaused) {
    setIsPaused(true);
    handleUpdate('user.fichaje.descanso.inicio');
  } else {
    const now = new Date().getTime();
    handleUpdate('user.fichaje.descanso.fin');
    setStartTime(now - timeElapsed * 1000);
    setIsPaused(false);
  }
};
``` 