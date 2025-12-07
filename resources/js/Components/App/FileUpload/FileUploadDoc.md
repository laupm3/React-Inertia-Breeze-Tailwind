# 📁 Sistema FileUpload - Documentación Completa

## 🎯 **¿Qué es este sistema?**
Un conjunto de componentes React modernos y optimizados para manejar archivos en aplicaciones web. Incluye drag & drop, validaciones automáticas, vista previa, descarga de archivos y una interfaz intuitiva.

## 🏗️ **Componentes del Sistema**
- **`FileUploadArea`** → Componente principal para subir archivos
- **`FileUploadCard`** → Tarjetas individuales que muestran cada archivo
- **`FileViewer`** → Visor modal para previsualizar archivos (imágenes, PDFs, videos)

## 🚀 **Uso Básico**

### **Caso 1: Formulario Simple**
```jsx
import { useState } from 'react';
import FileUploadArea from '@/Components/App/FileUpload/FileUploadArea';

function MiFormulario() {
    const [archivos, setArchivos] = useState([]);

    const enviarFormulario = () => {
        // archivos contiene los File objects seleccionados
        console.log('Archivos a subir:', archivos);
    };

    return (
        <div>
            <FileUploadArea
                onFileChange={setArchivos}
                selectedFiles={archivos}
                multiple={true}
                accept="image/*,.pdf,.doc,.docx"
                maxFileSize={10 * 1024 * 1024} // 10MB
            />
            
            <button onClick={enviarFormulario}>
                Enviar ({archivos.length} archivos)
            </button>
        </div>
    );
}
```

### **Caso 2: Con Archivos Existentes**
```jsx
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import FileUploadArea from '@/Components/App/FileUpload/FileUploadArea';

function EditarSolicitud({ solicitud }) {
    const { data, setData, post } = useForm({
        motivo: solicitud.motivo,
        nuevos_archivos: []
    });

    const [archivosExistentes, setArchivosExistentes] = useState(
        solicitud.files || []
    );

    const eliminarArchivoServidor = async (archivo) => {
        try {
            await axios.delete(`/api/v1/files/${archivo.hash}`);
            setArchivosExistentes(prev => 
                prev.filter(f => f.hash !== archivo.hash)
            );
            toast.success('Archivo eliminado');
        } catch (error) {
            toast.error('Error al eliminar archivo');
        }
    };

    return (
        <form onSubmit={() => post('/solicitudes')}>
            <input 
                value={data.motivo} 
                onChange={e => setData('motivo', e.target.value)}
                placeholder="Motivo de la solicitud"
            />
            
            <FileUploadArea
                onFileChange={(files) => setData('nuevos_archivos', files)}
                selectedFiles={data.nuevos_archivos}
                existingFiles={archivosExistentes}
                onRemoveExisting={eliminarArchivoServidor}
                multiple={true}
                accept="image/*,.pdf,.doc,.docx"
                maxFileSize={20 * 1024 * 1024}
                downloadConfig={{
                    endpoint: '/api/v1/files/{file}/download',
                    fileIdField: 'hash',
                    fileNameField: 'name'
                }}
            />
            
            <button type="submit">Guardar cambios</button>
        </form>
    );
}
```

### **Caso 3: Con Vista Previa**
```jsx
import { useState } from 'react';
import FileUploadArea from '@/Components/App/FileUpload/FileUploadArea';
import FileViewer from '@/Components/App/FileUpload/FileViewer';

function GaleriaDocumentos() {
    const [archivos, setArchivos] = useState([]);
    const [archivoViewer, setArchivoViewer] = useState(null);
    const [viewerAbierto, setViewerAbierto] = useState(false);

    const abrirViewer = (archivo) => {
        setArchivoViewer(archivo);
        setViewerAbierto(true);
    };

    const cerrarViewer = () => {
        setViewerAbierto(false);
        setArchivoViewer(null);
    };

    const descargarArchivo = (archivo) => {
        const url = URL.createObjectURL(archivo);
        const link = document.createElement('a');
        link.href = url;
        link.download = archivo.name;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <FileUploadArea
                onFileChange={setArchivos}
                selectedFiles={archivos}
                onPreview={abrirViewer}
                multiple={true}
                showPreview={true}
                accept="image/*,.pdf,.doc,.docx"
            />
            
            <FileViewer
                file={archivoViewer}
                isOpen={viewerAbierto}
                onClose={cerrarViewer}
                onDownload={descargarArchivo}
            />
        </div>
    );
}
```

---

## 📋 **Props de FileUploadArea**

### **Props Obligatorios**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `onFileChange` | `function` | Función que recibe los archivos seleccionados |
| `selectedFiles` | `array` | Array de archivos seleccionados (estado) |

### **Props de Configuración**
| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `multiple` | `boolean` | `false` | Permitir selección múltiple |
| `accept` | `string` | `"image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"` | Tipos de archivo permitidos |
| `maxFileSize` | `number` | `10485760` (10MB) | Tamaño máximo por archivo en bytes |
| `disabled` | `boolean` | `false` | Deshabilitar el componente |
| `className` | `string` | `""` | Clases CSS adicionales |
| `id` | `string` | `"file-upload"` | ID del input file |

### **Props de Archivos Existentes**
| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `existingFiles` | `array` | `[]` | Archivos ya guardados en el servidor |
| `onRemoveExisting` | `function` | `null` | Función para eliminar archivos existentes |
| `showExistingFiles` | `boolean` | `true` | Mostrar archivos existentes |
| `allowRemoveExisting` | `boolean` | `true` | Permitir eliminar archivos existentes |

### **Props de Vista Previa y Descarga**
| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `showPreview` | `boolean` | `true` | Mostrar botón de vista previa |
| `onPreview` | `function` | `null` | Función para abrir vista previa |
| `onDownload` | `function` | `null` | Función personalizada de descarga |
| `downloadConfig` | `object` | Ver abajo | Configuración de endpoints de descarga |

### **Props de Personalización**
| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `text` | `string` | `"Haga clic aquí o arrastre archivos para cargar"` | Texto del área de subida |
| `onRemoveSelected` | `function` | `null` | Función personalizada para eliminar archivos seleccionados |

---

## ⚙️ **Configuración de Descarga (downloadConfig)**

```jsx
downloadConfig={{
    endpoint: '/api/v1/files/{file}/download',    // URL base para descarga
    fileIdField: 'hash',                          // Campo del archivo que contiene el ID
    fileNameField: 'name'                         // Campo del archivo que contiene el nombre
}}
```

### **Ejemplos de Configuración**

**Para API estándar:**
```jsx
downloadConfig={{
    endpoint: '/api/v1/files/{file}/download',
    fileIdField: 'hash',
    fileNameField: 'name'
}}
```

**Para API personalizada:**
```jsx
downloadConfig={{
    endpoint: '/api/documentos/{file}/descargar',
    fileIdField: 'id',
    fileNameField: 'nombre'
}}
```

**Para descarga directa desde storage:**
```jsx
downloadConfig={{
    endpoint: '/storage/uploads/{file}',
    fileIdField: 'filename',
    fileNameField: 'original_name'
}}
```

---

## 👁️ **Props de FileViewer**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `file` | `object` | Archivo a mostrar en el visor |
| `isOpen` | `boolean` | Controla si el visor está abierto |
| `onClose` | `function` | Función para cerrar el visor |
| `onDownload` | `function` | Función personalizada para descargar |

### **Tipos de Archivo Soportados**
- **Imágenes:** jpg, jpeg, png, gif, bmp, svg, webp (con zoom y navegación)
- **PDFs:** Visualización directa en el navegador
- **Videos:** mp4, webm, ogg, mov, avi (reproductor integrado)
- **Audio:** mp3, wav, ogg, m4a, aac (reproductor integrado)
- **Otros:** Información del archivo con opción de descarga

---

## 🔧 **Estructura de Archivos**

### **Archivos Seleccionados (File Objects)**
```javascript
// Los archivos que selecciona el usuario son objetos File nativos
{
    name: "documento.pdf",
    size: 1048576,
    type: "application/pdf",
    lastModified: 1640995200000
}
```

### **Archivos Existentes**
```javascript
// Estructura esperada para archivos del servidor
{
    hash: "abc123def456",          // ID único del archivo
    name: "documento.pdf",         // Nombre del archivo
    size: 1048576,                // Tamaño en bytes
    extension: "pdf",             // Extensión (opcional, se extrae del name)
    mime_type: "application/pdf"  // Tipo MIME (opcional)
}
```

---

## 🛠️ **Casos de Uso Avanzados**

### **Validaciones Personalizadas**
```jsx
function FormularioConValidaciones() {
    const [archivos, setArchivos] = useState([]);

    const validarArchivos = (nuevosArchivos) => {
        // Validar nombres duplicados
        const nombres = nuevosArchivos.map(f => f.name);
        const duplicados = nombres.filter((item, index) => nombres.indexOf(item) !== index);
        
        if (duplicados.length > 0) {
            toast.error(`Archivos duplicados: ${duplicados.join(', ')}`);
            return false;
        }

        // Validar total de archivos
        if (nuevosArchivos.length > 5) {
            toast.error('Máximo 5 archivos permitidos');
            return false;
        }

        return true;
    };

    return (
        <FileUploadArea
            onFileChange={(files) => {
                if (validarArchivos(files)) {
                    setArchivos(files);
                }
            }}
            selectedFiles={archivos}
            multiple={true}
            maxFileSize={5 * 1024 * 1024}
        />
    );
}
```

### **Subida Automática**
```jsx
function SubidaAutomatica() {
    const [archivos, setArchivos] = useState([]);
    const [archivosSubidos, setArchivosSubidos] = useState([]);

    const subirArchivo = async (archivo) => {
        const formData = new FormData();
        formData.append('file', archivo);
        
        try {
            const response = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setArchivosSubidos(prev => [...prev, response.data]);
            toast.success(`${archivo.name} subido correctamente`);
        } catch (error) {
            toast.error(`Error subiendo ${archivo.name}`);
        }
    };

    return (
        <div>
            <FileUploadArea
                onFileChange={async (files) => {
                    setArchivos(files);
                    
                    // Subir cada archivo automáticamente
                    for (const archivo of files) {
                        await subirArchivo(archivo);
                    }
                }}
                selectedFiles={archivos}
                existingFiles={archivosSubidos}
                multiple={true}
            />
        </div>
    );
}
```

### **Integración con Formularios Inertia**
```jsx
import { useForm } from '@inertiajs/react';

function FormularioInertia({ entidad = null }) {
    const { data, setData, post, put, processing } = useForm({
        nombre: entidad?.nombre || '',
        descripcion: entidad?.descripcion || '',
        archivos: []
    });

    const [archivosExistentes, setArchivosExistentes] = useState(
        entidad?.files || []
    );

    const enviarFormulario = (e) => {
        e.preventDefault();
        
        if (entidad) {
            put(`/entidades/${entidad.id}`);
        } else {
            post('/entidades');
        }
    };

    return (
        <form onSubmit={enviarFormulario}>
            <input
                type="text"
                value={data.nombre}
                onChange={e => setData('nombre', e.target.value)}
                placeholder="Nombre"
            />
            
            <textarea
                value={data.descripcion}
                onChange={e => setData('descripcion', e.target.value)}
                placeholder="Descripción"
            />
            
            <FileUploadArea
                onFileChange={(files) => setData('archivos', files)}
                selectedFiles={data.archivos}
                existingFiles={archivosExistentes}
                onRemoveExisting={async (archivo) => {
                    await axios.delete(`/api/v1/files/${archivo.hash}`);
                    setArchivosExistentes(prev => 
                        prev.filter(f => f.hash !== archivo.hash)
                    );
                }}
                multiple={true}
                accept="image/*,.pdf,.doc,.docx"
                downloadConfig={{
                    endpoint: '/api/v1/files/{file}/download',
                    fileIdField: 'hash',
                    fileNameField: 'name'
                }}
            />
            
            <button type="submit" disabled={processing}>
                {processing ? 'Guardando...' : 'Guardar'}
            </button>
        </form>
    );
}
```

---

## 🐛 **Solución de Problemas**

### **Error: "No se puede descargar el archivo"**
- Verificar que el `downloadConfig` tiene los campos correctos
- Comprobar que el endpoint existe en el backend
- Revisar que el archivo tiene el campo ID especificado en `fileIdField`

### **Error: "Archivo demasiado grande"**
- Aumentar `maxFileSize` en el componente
- Verificar límites del servidor (PHP `upload_max_filesize`, `post_max_size`)
- Comprobar límites de Nginx/Apache

### **Los archivos existentes no se muestran**
- Verificar estructura del array `existingFiles`
- Asegurar que cada archivo tiene los campos `hash/id`, `name` y `size`
- Comprobar que `showExistingFiles` es `true`

### **La vista previa no funciona**
- Verificar que el archivo tiene extensión en el nombre
- Comprobar que el tipo de archivo está soportado
- Revisar que los endpoints de preview existen en el backend

### **Drag & Drop no funciona**
- Verificar que el componente no está dentro de un elemento con `pointer-events: none`
- Comprobar que no hay handlers de eventos que interfieran
- Asegurar que el componente no está deshabilitado

---

## 🎨 **Personalización de Estilos**

Los componentes usan Tailwind CSS y pueden personalizarse mediante la prop `className`:

```jsx
<FileUploadArea
    className="border-2 border-dashed border-blue-300 bg-blue-50"
    // ... otros props
/>
```

### **Clases CSS Principales**
- `.file-upload-area` - Contenedor principal
- `.file-upload-dropzone` - Zona de drop
- `.file-upload-cards` - Contenedor de tarjetas
- `.file-upload-card` - Tarjeta individual
- `.file-viewer-modal` - Modal del visor

---

## 📝 **Mejores Prácticas**

1. **Siempre validar archivos** tanto en frontend como backend
2. **Usar IDs únicos** (como hash) para archivos del servidor
3. **Manejar errores apropiadamente** con toast notifications
4. **Optimizar archivos grandes** con validaciones de tamaño
5. **Proporcionar feedback visual** durante subidas/descargas
6. **Implementar limpieza** de archivos temporales no utilizados
7. **Usar endpoints seguros** para descargas con autenticación

---

## 🔗 **Endpoints Backend Requeridos**

Para funcionalidad completa, tu backend debe proveer:

```php
// Descarga de archivos
Route::get('/api/v1/files/{fileHash}/download', [FileController::class, 'download']);

// Vista previa (opcional)
Route::get('/api/v1/files/{fileHash}/preview', [FileController::class, 'preview']);

// Eliminar archivos (opcional)
Route::delete('/api/v1/files/{fileHash}', [FileController::class, 'destroy']);

// Subir archivos
Route::post('/api/v1/files', [FileController::class, 'store']);
```

Esta documentación cubre todos los aspectos del sistema FileUpload refactorizado y optimizado. Los componentes son modulares, reutilizables y fáciles de integrar en cualquier aplicación React con Inertia.js.
