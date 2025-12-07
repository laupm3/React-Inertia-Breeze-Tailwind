import { useState } from "react";
import ConfirmsPasswordFolders from "./ConfirmsPasswordFolders"; // Asegúrate de que la ruta sea correcta
import folderStructure from "./folderStructure";

const FilesRecents = ({
  recentFiles,
  currentFolder,
  view,
  addFileToRecentFiles,
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // Guardamos el archivo seleccionado

  const handleFileClick = (file) => {
    if (file.parentFolder === "S") {
      setSelectedFile(file); // Guardamos el archivo seleccionado
      setIsAuthModalOpen(true); // Abrimos el modal de confirmación
    } else {
      addFileToRecentFiles(file); // Si no es "S", agregar el archivo a los recientes
      window.open("https://www.google.com", "_blank"); // Aquí deberías colocar la lógica para abrir el archivo
    }
  };

  const getFolderData = (folderKey) => folderStructure[folderKey];

  const getFolderFiles = (folderKey) => {
    const folderData = getFolderData(folderKey);
    return folderData?.files || [];
  };

  const getAllSubFolderKeys = (folderKey) => {
    const folderData = getFolderData(folderKey);
    if (!folderData?.folders) return [folderData];
    return folderData.folders.reduce(
      (keys, subFolder) => keys.concat(getAllSubFolderKeys(subFolder.key)),
      [folderKey]
    );
  };

  const getRecentFilesForHierarchy = (folderKey) => {
    const relevantKeys = getAllSubFolderKeys(folderKey);
    return recentFiles.filter(
      (file) =>
        relevantKeys.includes(file.parentFolder) &&
        file.parentFolder !== "Seguridad"
    );
  };

  const folderFiles = getFolderFiles(currentFolder);

  const filesToShow =
    currentFolder.nivel_acceso_id == "2"
      ? recentFiles.filter((file) => file.parentFolder !== "S")
      : folderFiles.length > 0
      ? folderFiles
      : getRecentFilesForHierarchy(currentFolder);

  return (
    <div className="p-5">
      {filesToShow.length > 0 ? (
        view === "list" ? (
          <div className="shadow-md rounded-md p-4 bg-custom-gray-default dark:bg-custom-blackSemi">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600">
                  <th className="py-2 px-4">Nombre</th>
                  <th className="py-2 px-4">Ubicación</th>
                  <th className="py-2 px-4">Fecha de última actualización</th>
                </tr>
              </thead>
              <tbody>
                {filesToShow.map((file, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 dark:hover:bg-custom-gray-semiDark cursor-pointer"
                    onClick={() => handleFileClick(file)} // Agregar lógica aquí
                  >
                    <td className="py-2 px-4">{file.nombre}</td>
                    <td className="py-2 px-4">{file.parent_id}</td>
                    <td className="py-2 px-4">{file.updated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filesToShow.map((file, index) => (
              <div
                key={index}
                className="flex flex-col items-center border dark:bg-custom-blackSemi  p-4 rounded-3xl shadow-md hover:shadow-lg"
                onClick={() => handleFileClick(file)} // Agregar lógica aquí
              >
                {/* Vista previa del archivo */}
                {file.previewUrl ? (
                  <img
                    src={file.previewUrl}
                    alt={file.nombre}
                    className="h-32 w-full object-cover rounded-md mb-2"
                  />
                ) : (
                  <div className="h-32 w-full flex items-center justify-center bg-gray-200 dark:bg-custom-gray-darker rounded-md mb-2">
                    <span className="text-gray-500 text-sm">Sin vista previa</span>
                  </div>
                )}
                <p className="text-sm font-medium text-center">{file.nombre}</p>
                <p className="text-xs text-gray-500 text-center">{file.parent_id}</p>
              </div>
            ))}
          </div>
        )
      ) : (
        <p className="text-gray-500 text-center">
          {currentFolder === "Mis Carpetas"
            ? "No hay archivos recientes."
            : "Esta carpeta no contiene archivos."}
        </p>
      )}

      {/* Modal de confirmación de contraseña */}
      <ConfirmsPasswordFolders
        show={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirmed={() => {
          // Aquí no se agrega el archivo a los recientes si es de "S"
          window.open("https://www.google.com", "_blank"); // Abrir el archivo directamente
        }}
      />
    </div>
  );
};

export default FilesRecents;
