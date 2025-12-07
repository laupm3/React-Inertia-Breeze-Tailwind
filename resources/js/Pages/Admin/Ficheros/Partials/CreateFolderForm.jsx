import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { router } from "@inertiajs/react";
//import { use } from "i18next";
//import { set } from "date-fns";
import { toast } from "sonner";


export default function CreateFolderForm({ onClose, currentFolder, currentFiles, setIsCreateFolderOpen }) {

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectSeguridadArchivo, setSelectSeguridadArchivo] = useState("L1");
  const [selectNivelAcceso, setSelectNivelAcceso] = useState("Bajo");
  const [nombreCarpeta, setNombreCarpeta] = useState("");
  const inputNombreCarpetaRef = useRef(null);

  useEffect( () => {
   inputNombreCarpetaRef.current.focus(); 
  }, []);

  const currentFolderPath = currentFolder.path.split('/');
  currentFolderPath.pop();
  

  const handleCreateFolder = async () => {
    setUploading(true);
  
    try {
      const response = await axios.post(route('admin.files.folder.store'), {
        nombre: nombreCarpeta,
        parent_id: currentFolder.id || 1, // Si no hay carpeta seleccionada, se asigna la raíz
        nivel_seguridad: selectSeguridadArchivo,
        nivel_acceso: selectNivelAcceso,
      });
  
      //setUploadResult(response.data);
      router.visit(`/user/folders/${currentFolder.hash}`, { preserveState: true });
      toast.success("Carpeta creada correctamente!");
      
    } catch (error) {
      //setUploadResult(error.response.data);
      toast.error("Error: No se ha podido crear la carpeta!");

    } finally {
      setUploading(false);
      setIsCreateFolderOpen(false);
    }
  };


  return (
    <div className="w-full bg-gray-50">
      <Card className="w-full max-h-[94dvh] shadow-lg rounded-lg overflow-hidden px-2 pt-4 pb-2">
        {/* Título */}
        <div className="pl-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
            Nueva Carpeta en <strong className="text-custom-orange">{currentFolderPath[currentFolderPath.length - 1] == "Empleados" ? " 📁Principal" : ` 📁${currentFolder.nombre}`}</strong>
          </h2>
        </div>

        {/* Contenido */}
        <CardContent className="flex-grow space-y-6 -ml-2">

          <div className="space-y-2">

            {/* Otros campos del formulario */}
            <div className="space-y-2">
                <div>
                    <Label htmlFor="security-type" className="text-sm font-medium text-gray-800 dark:text-gray-300 mr-4">
                        Nombre de la carpeta <span className="text-custom-orange text-lg">*</span>
                    </Label>
                    <input type="text" placeholder="Nueva carpeta"
                        className="w-2/5 rounded-md border-gray-300 text-sm shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900" 
                        value={nombreCarpeta}
                        onChange={(e) => setNombreCarpeta(e.target.value)}
                        ref={inputNombreCarpetaRef}
                    />
                </div>

              <div className="flex items-center gap-5">
                <Label htmlFor="security-type" className="text-sm font-medium text-gray-800 dark:text-gray-300">
                  Tipo de seguridad del archivo
                </Label>
                <select
                  id="security-type"
                  className="block mt-1 rounded-md border-gray-300 text-sm shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900"
                  value={selectSeguridadArchivo}
                  onChange={(e) => setSelectSeguridadArchivo(e.target.value)}
                >
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                </select>
                <ul>
                  <li className="text-xs text-gray-500"><span className="text-lg text-custom-orange mr-1">*</span>L1: No requiere autenticación</li>
                  <li className="text-xs text-gray-500 ml-3">L2: Requiere contraseña</li>
                  <li className="text-xs text-gray-500 ml-3">L3: Requiere autenticación en 2 pasos</li>
                </ul>
              </div>

              <div>
                    <Label htmlFor="acceso-type" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mr-4">
                        Visible por
                    </Label>
                    <select
                        id="acceso-type"
                        className="block mt-1 rounded-md border-gray-300 text-sm shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900"
                        value={selectNivelAcceso}
                        onChange={ (e) => setSelectNivelAcceso(e.target.value)}
                    >
                        <option value="Bajo">Nivel Bajo</option>
                        <option value="Medio">Nivel Medio</option>
                        <option value="Alto">Nivel Alto</option>
                        <option value="Crítico">Crítico</option>
                    </select>
                </div>

            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-1">
              <Button
                variant="outline"
                className="text-orange-500 border-orange-500 hover:bg-transparent hover:text-custom-gray-default mt-4 rounded-full"
                onClick={onClose}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button
                className="bg-orange-500 text-white hover:bg-orange-600 mt-4 rounded-full"
                onClick={handleCreateFolder}
                disabled={uploading}
              >
                {uploading ? "Creando..." : "Crear Carpeta"}
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
        </CardContent>
      </Card>
    </div>
  );
}
