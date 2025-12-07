import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { use } from "i18next";

export default function FileUploadForm({ onClose, currentFolder, currentFiles }) {
  console.log('currentFolder >> ', currentFolder);
  console.log('currentFiles >> ', currentFiles);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [hashFolderSelected, setHashFolderSelected] = useState(currentFolder.hash);
  const [idFolderSelected, setIdFolderSelected] = useState(currentFolder.id);

  const onDrop = useCallback(
    (acceptedFiles) => {
      // Limita el total de archivos a 50
      const availableSlots = 50 - files.length;
      const filesToAdd = acceptedFiles.slice(0, availableSlots);
      setFiles((prevFiles) => [...prevFiles, ...filesToAdd]);
    },
    [files]
  );

  useEffect(() => {
    console.log('hashSelected >> ', hashFolderSelected)
  }, [hashFolderSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Se aceptan los tipos de archivo indicados
    accept: {
      "application/pdf": [".pdf"],
      "application/zip": [".zip"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "image/jpeg": [".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "text/csv": [".csv"]
    },
    maxFiles: 50, // 50 archivos máx.
    maxSize: 200 * 1024 * 1024, // 200 MB en total (bytes)
    multiple: true,
  });

  const handleUpload = async () => {
    /* if (!hash) {
      alert("Debes ingresar un hash para la carpeta destino.");
      return;
    } */
    
    if (files.length === 0) {
      alert("No hay archivos para subir.");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    // Se agregan los archivos. Cada archivo se enviará con el campo "files[]"
    files.forEach((file) => {
      formData.append("files[]", file);
    });
    // Enviar también el hash del directorio destino
    formData.append("folder_hash", hashFolderSelected);
    formData.append("folder_id", idFolderSelected);

    try {
      const response = await axios.post("/admin/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadResult(response.data);
      console.log("Respuesta del backend:", response.data);
    } catch (error) {
      console.error("Error al subir archivos:", error.response || error);
      setUploadResult(
        error.response ? error.response.data : { message: "Error de red" }
      );
    } finally {
      setUploading(false);
    }
  };

  const detectFolderHash = (idCarpeta) => {
    const hash = currentFiles.find(file => file.id == idCarpeta).hash;
    setHashFolderSelected(hash);
    setIdFolderSelected(idCarpeta);
  }

  return (
    <div className="bg-gray-50">
      <Card className="justify-between shadow-lg rounded-lg overflow-hidden">
        {/* Título */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">
            Cargar documentos
          </h2>
          <p className="mb-4">Carga masivamente o individualmente archivos</p>
          <div>
            <label htmlFor="selectFolder">Carpeta </label>
            <select name="selectFolder" id="selectFolder" className="text-black ml-2 rounded-3xl" onChange={(e) => detectFolderHash(e.target.value)}>
              <option value={currentFolder.id}>Carpeta Padre ./</option>
              {currentFiles.filter(file => file.tipo_fichero_id == 1)
              .sort((a, b) => {
                const nameA = a.nombre;
                const nameB = b.nombre;
            
                const numA = Number(nameA);
                const numB = Number(nameB);
            
                if (!isNaN(numA) && !isNaN(numB)) {
                  // Si ambos son números, ordenar numéricamente
                  return numA - numB;
                } else {
                  // Si no son números, ordenar alfabéticamente (insensible a mayúsculas)
                  //return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
                  return;
                }
              })
              .map((file, index) => (
                <option key={index} value={file.id}>{file.nombre}</option>
              ))}
            </select>
          </div>
          
        </div>

        {/* Contenido */}
        <CardContent className="flex-grow p-6 space-y-6">
          
          {/* <p className="text-sm text-gray-500">
            El tamaño máximo para los archivos nuevos es de: -- MB, para el límite global es: -- MB
          </p> */}

          {/* Sección de archivos */}
          <div className="space-y-4">
            <span><strong>Archivos</strong></span>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              id="my-dropzone"
              className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50"
            >
              <input {...getInputProps()} />
              <DownArrow className="w-10 h-10 text-gray-400" />
              {isDragActive ? (
                <span className="text-sm font-medium text-gray-500 mt-2">
                  Suelta los archivos aquí...
                </span>
              ) : (
                <span className="text-sm font-medium text-gray-500 mt-2">
                  Arrastra y suelta aquí para añadir archivos
                </span>
              )}
              <span className="text-xs text-gray-400">
                PDF, zip, doc, docx, xls, xlsx, jpg, png, webp, csv
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="p-2 border rounded">
                  {file.name}
                </div>
              ))}
            </div>

            {/* Botones */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="text-orange-500 border-orange-500 hover:bg-orange-100"
                onClick={onClose}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button
                className="bg-orange-500 text-white hover:bg-orange-600"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Subiendo..." : "Guardar cambios"}
              </Button>
            </div>

            {/* Mostrar respuesta */}
            {uploadResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <pre className="text-xs text-gray-700">
                  {JSON.stringify(uploadResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Otros campos del formulario */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-type" className="text-sm font-medium text-gray-800 dark:text-gray-300">
                Tipo de archivo
              </Label>
              <select
                id="file-type"
                className="block w-full mt-1 rounded-md border-gray-300 text-sm shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900"
              >
                <option>Documento</option>
                <option>Imagen</option>
                <option>Audio</option>
                <option>Video</option>
              </select>
            </div>

            <div>
              <Label htmlFor="security-type" className="text-sm font-medium text-gray-800 dark:text-gray-300">
                Tipo de seguridad del archivo
              </Label>
              <select
                id="security-type"
                className="block w-full mt-1 rounded-md border-gray-300 text-sm shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900"
              >
                <option>L1</option>
                <option>L2</option>
                <option>L3</option>
              </select>
            </div>

            <div>
              <Label htmlFor="reason" className="text-sm font-medium text-gray-800 dark:text-gray-300">
                Razón de la subida del archivo
              </Label>
              <textarea
                id="reason"
                className="block w-full mt-1 rounded-md border-gray-300 text-sm shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Escribe una razón aquí..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DownArrow(props) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 15 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.68396 3.05371C7.93172 3.05371 8.13257 3.29249 8.13257 3.58704V12.9661L10.9556 9.60992C11.1308 9.40164 11.4149 9.40164 11.5901 9.60992C11.7652 9.8182 11.7652 10.1559 11.5901 10.3642L8.00117 14.6309C7.91705 14.7308 7.80294 14.787 7.68396 14.787C7.56498 14.787 7.45087 14.7308 7.36675 14.6309L3.77788 10.3642C3.60268 10.1559 3.60268 9.8182 3.77788 9.60992C3.95307 9.40164 4.23712 9.40164 4.41231 9.60992L7.23535 12.9661V3.58704C7.23535 3.29249 7.4362 3.05371 7.68396 3.05371Z"
        fill="#CBCBCB"
        stroke="#CBCBCB"
      />
    </svg>
  );
}
