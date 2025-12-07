import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import folderStructure from "@/Components/FoldersFiles/folderStructure";
import FileUploadForm from "@/Components/FoldersFiles/newFile";
import Modal from "@/Components/Modal";
import FolderIcon from "@/Components/FoldersFiles/folderIcon";
import Breadcrumbs from "@/Components/FoldersFiles/breadcrumbs";
import FilesRecents from "@/Components/FoldersFiles/filesRecents";
import ViewToggleButtons from "@/Components/FoldersFiles/viewToggleButtons";
import GoBackButton from "@/Components/FoldersFiles/goBackButton";

export default function FoldersComponent({}) {
  const [currentFolder, setCurrentFolder] = useState("Mis Carpetas");
  const [recentFiles, setRecentFiles] = useState([]);
  const [folderStack, setFolderStack] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("list");

  // Guardar archivos recientes en localStorage
  const saveRecentFilesToLocalStorage = (recentFiles) => {
    localStorage.setItem("recentFiles", JSON.stringify(recentFiles));
  };

  // Cargar archivos recientes desde localStorage
  const loadRecentFilesFromLocalStorage = () => {
    const storedFiles = localStorage.getItem("recentFiles");
    return storedFiles ? JSON.parse(storedFiles) : [];
  };

  // Actualizar archivos recientes al abrir un archivo
  const addFileToRecentFiles = (file) => {
    setRecentFiles((prevFiles) => {
      const updatedFiles = [
        file,
        ...prevFiles.filter(
          (recentFile) =>
            recentFile.name !== file.name ||
            recentFile.location !== file.location
        ),
      ].slice(0, 10); // Limitar a 10 archivos recientes
      saveRecentFilesToLocalStorage(updatedFiles);
      return updatedFiles;
    });
  };

  // Cargar archivos recientes al montar el componente
  useEffect(() => {
    const loadedFiles = loadRecentFilesFromLocalStorage();
    setRecentFiles(loadedFiles);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleBreadcrumbClick = (index) => {
    const newFolderStack = folderStack.slice(0, index);
    const newCurrentFolder = folderStack[index];
    setFolderStack(newFolderStack);
    setCurrentFolder(newCurrentFolder);
  };

  const openFolder = (key) => {
    setFolderStack([...folderStack, currentFolder]);
    setCurrentFolder(key);
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between mb-6 ">
          <Breadcrumbs
            folderStack={folderStack}
            currentFolder={currentFolder}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
          <button
            onClick={openModal}
            className="bg-orange-500 text-white px-4 rounded-md hover:bg-orange-600 ml-auto"
          >
            + Nuevo
          </button>
          <Modal show={isModalOpen} onClose={closeModal}>
            <FileUploadForm onClose={closeModal} />
          </Modal>
        </div>

        {currentFolder !== "Mis Carpetas" && (
          <GoBackButton
            folderStack={folderStack}
            setFolderStack={setFolderStack}
            currentFolder={currentFolder}
            setCurrentFolder={setCurrentFolder}
            handleBreadcrumbClick={handleBreadcrumbClick}
          />
        )}

        <FolderIcon
          folderStructure={folderStructure}
          currentFolder={currentFolder}
          openFolder={openFolder}
        />
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)}
          </h2>
          <ViewToggleButtons view={view} setView={setView} />
        </div>
        <FilesRecents
          recentFiles={recentFiles}
          currentFolder={currentFolder}
          view={view}
          addFileToRecentFiles={addFileToRecentFiles}
        />
      </div>
    </>
  );
};

FoldersComponent.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;