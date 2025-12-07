import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { router } from "@inertiajs/react";
import { is } from "date-fns/locale";
import { toast } from "sonner";


export default function EditFolderForm({ onClose, currentFolder, folderContextMenu, isModalEditFolderOpen, setIsModalEditFolderOpen, setIsModalRenameFolderOpen }) {

    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [nombreCarpeta, setNombreCarpeta] = useState(folderContextMenu.nombre || "Nuevo nombre");
    const inputNombreCarpetaRef = useRef(null);

    useEffect(() => {
        inputNombreCarpetaRef.current.focus();
    }, []);

    const currentFolderPath = currentFolder.path.split('/');
    currentFolderPath.pop();

    const handleUpdateName = async (folder) => {
        setUploading(true);

        const formData = new FormData();
        formData.append("nombre", nombreCarpeta);

        try {
            const response = await axios.patch(`/admin/files/update/${folder.id}`, {
                nombre: nombreCarpeta,
            });
            //setUploadResult(response.data);
            //console.log("Respuesta del backend:", response.data);
            router.visit(`/user/folders/${currentFolder.hash}`, { preserveState: true });
            toast.success("Nombre del fichero modificado correctamente!");
            setIsModalRenameFolderOpen(false);

        } catch (error) {
            //console.error("Error al cambiar el nombre: ", error.response || error);
            toast.error("Error: No se ha podido cambiar el nombre del fichero!");
            /* setUploadResult(
              error.response ? error.response.data : { message: "Error de red" }
            ); */
        } finally {
            //setUploading(false);
        }
    };

    return (
        <div className="w-full bg-gray-50">
            <Card className="w-full max-h-[94dvh] shadow-lg rounded-lg overflow-hidden px-4 pt-6 pb-2">
                {/* Título */}
                <div className="pl-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
                        Cambiar nombre de carpeta <strong className="text-custom-orange">{folderContextMenu.nombre}</strong>
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
                                <input type="text" placeholder="Nueva carpeta" autoFocus
                                    className="w-2/5 rounded-md border-gray-300 text-sm shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900"
                                    value={nombreCarpeta}
                                    onChange={(e) => setNombreCarpeta(e.target.value)}
                                    ref={inputNombreCarpetaRef}
                                />
                            </div>

                        </div>

                        {/* Botones */}
                        <div className="flex justify-end space-x-4 pt-2">
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
                                onClick={() => handleUpdateName(folderContextMenu)}
                                disabled={uploading}
                            >
                                {uploading ? "Actualizando..." : "Guardar cambios"}
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
