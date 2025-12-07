import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Breadcrumbs from "@/Components/FoldersFiles/breadcrumbs";
//import FilesRecents from "@/Components/FoldersFiles/filesRecents";
//import FileUploadForm from "@/Components/FoldersFiles/newFile";
import FileUploadForm from "@/Pages/Admin/Ficheros/Partials/FileUploadForm";
import CreateFolderForm from "@/Pages/Admin/Ficheros/Partials/CreateFolderForm";
import FolderIcon from "@/Components/FoldersFiles/folderIcon";
import GoBackButton from "@/Components/FoldersFiles/goBackButton";
import Modal from "@/Components/Modal";
import ViewToggleButtons from "@/Components/FoldersFiles/viewToggleButtons";
import { te } from "date-fns/locale";

/**
 * Index component - The main component for the files page
 * 
 * @param {Object} param The props
 * @param {Array} param.files The files and folders in the current folder
 * @param {Object} param.currentFolder The current folder
 * @param {Array} param.breadcrumb The breadcrumb
 * 
 * @returns {JSX.Element} 
 */

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal cursor-pointer">
    <line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" />
    <line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" />
    <line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" />
    <line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" />
  </svg>
);

export default function Index({ files, currentFolder, breadcrumb, empleados, rootHash }) {

  const page = usePage();
  const { user } = page.props.auth;

  //const [recentFiles, setRecentFiles] = useState([]);
  const [folderStack, setFolderStack] = useState([]);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isCreateFolderOPen, setIsCreateFolderOpen] = useState(false);
  const [view, setView] = useState("grid");

  const [isGlobalFilterModalOpen, setIsGlobalFilterModalOpen] = useState(false);
  const [selectFilterTipoFichero, setSelectFilterTipoFichero] = useState("");
  const [selectFilterExtArchivo, setSelectFilterExtArchivo] = useState("");
  const [selectFilterSubidoPor, setSelectFilterSubidoPor] = useState("");
  const [tempFilterTipoArchivo, setTempFilterTipoArchivo] = useState("");
  const [tempFilterExtArchivo, setTempFilterExtArchivo] = useState("");
  const [tempFilterSubidoPor, setTempFilterSubidoPor] = useState("");
  const [searchGlobalTerm, setGlobalSearchTerm] = useState("");
  const homeHash = rootHash;
  const [activeContextMenu, setActiveContextMenu] = useState({
    type: null, // "global", "folder" o "file"
    visible: false,
    x: 0,
    y: 0,
    folder: null,
  });

  useEffect(() => {
    setFolderStack((prevStack) => [...prevStack, currentFolder]);
  }, [currentFolder]);


  const openContextMenu = (menuType, x, y, folder = null) => {
    setActiveContextMenu({
      type: menuType,
      visible: true,
      x,
      y,
      folder,
    });
  };
  
  const closeContextMenu = () => {
    setActiveContextMenu({ type: null, visible: false, x: 0, y: 0, folder: null });
  };

  const handleRightClickFolder = (e, folder) => {
    e.preventDefault();
    e.stopPropagation();
    closeContextMenu(); // cierra cualquier menú abierto
    
    const offset = view !== "grid" ? 204 : 0;
    openContextMenu("folder", e.pageX - offset, e.pageY, folder);
  };
  
  const handleClickAccionesArchivos = (e, file) => {
    e.preventDefault();
    e.stopPropagation();
    closeContextMenu();
    const offset = view !== "grid" ? 204 : 0;
    openContextMenu("file", e.pageX - offset, e.pageY, file);
  };
  
  const handleRightClickGlobal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeContextMenu();
    openContextMenu("global", e.pageX, e.pageY);
  };

  // Guardar archivos recientes en localStorage
  /* const saveRecentFilesToLocalStorage = (recentFiles) => {
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
            recentFile.nombre !== file.nombre ||
            recentFile.parent_id !== filerecentFile.parent_id
        ),
      ].slice(0, 10); // Limitar a 10 archivos recientes
      saveRecentFilesToLocalStorage(updatedFiles);
      return updatedFiles;
    });
  }; */

  // Cargar archivos recientes al montar el componente
  /*  useEffect(() => {
       const loadedFiles = loadRecentFilesFromLocalStorage();
       setRecentFiles(loadedFiles);
   }, []); */

  const openModalFileUpload = () => setIsFileUploadOpen(true);
  const closeModalFileUpload = () => setIsFileUploadOpen(false);

  const openModalCreateFolder = () => setIsCreateFolderOpen(true);
  const closeModalCreateFolder = () => setIsCreateFolderOpen(false);


  const openFolder = (folder) => {
    //setFolderStack([...folderStack, folder]);
    setFolderStack((prevStack) => [...prevStack, folder]);
    router.visit(route('user.files.navigate', { hash: folder.hash }), { preserveState: true });
  };

  const handleBreadcrumbClick = (folder) => {
    if (folder.path == "/Empleados/" + folder.nombre) {
      //router.visit(route('user.files.index'), {preserveState: true});
      router.visit(route('home'), { preserveState: true });
    } else {
      folder.hash == currentFolder.hash ? "" : router.visit(route('user.files.navigate', { hash: folder.hash }), { preserveState: true });
    }
  };

  // Función que determina si un archivo cumple con los criterios de búsqueda y filtro.
  const isGlobalFilterMatch = (file) => {
    const matchesGlobalSearch = file.nombre.toLowerCase().includes(searchGlobalTerm.toLowerCase());
    let matchesGlobalFilter = true;

    if (selectFilterTipoFichero && selectFilterTipoFichero !== "") {
      matchesGlobalFilter = matchesGlobalFilter && file.tipo_fichero_id == selectFilterTipoFichero;
    }
    if (selectFilterExtArchivo && selectFilterExtArchivo !== "") {
      matchesGlobalFilter = matchesGlobalFilter && file.extension_id == selectFilterExtArchivo;
    }
    if (selectFilterSubidoPor && selectFilterSubidoPor !== "") {
      matchesGlobalFilter = matchesGlobalFilter && file.created_by == selectFilterSubidoPor;
    }

    return matchesGlobalSearch && matchesGlobalFilter;

  };
  
  const filteredFiles = files.filter(isGlobalFilterMatch).length > 0 ? files.filter(isGlobalFilterMatch) : [];


  return (
    <div className="p-6">
      
      <div className="w-full flex flex-wrap justify-between mb-6">
        <Breadcrumbs
          folderStack={breadcrumb}
          currentFolder={currentFolder}
          onBreadcrumbClick={handleBreadcrumbClick}
        />

        <div className="w-full xl:w-6/12 flex justify-end items-center">

          {/* Sección superior con búsqueda y botón de filtro */}
          <div className="w-full 2xl:w-10/12 flex justify-end items-center gap-3">
            <span
              className="inline-flex gap-3 cursor-pointer"
              onClick={() => {
                setIsGlobalFilterModalOpen(true);
              }}
            >
              Filtrar
              <span className="text-custom-orange">
                <FilterIcon />
              </span>
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre del archivo o carpeta..."
              value={searchGlobalTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="w-10/12 px-4 py-2 border rounded-3xl bg-[#F6F6F6] dark:bg-[#2C3034] text-[#575757] dark:text-[#F6F6F6] placeholder-[#575757]/80 dark:placeholder-[#F6F6F6]/80"
            />
          </div>

          <div className="w-7/12 xl:w-9/12 2xl:w-6/12 flex justify-end gap-4">
            <button
              onClick={() => setIsFileUploadOpen(true)}
              className="bg-orange-500 text-white px-3 py-2 rounded-3xl hover:bg-orange-600"
            >
              + Subir documentos
            </button>
            <button
              onClick={() => setIsCreateFolderOpen(true)}
              className="bg-orange-500 text-white px-3 py-2 rounded-3xl hover:bg-orange-600"
            >
              +  📁
            </button>
          </div>
        </div>

      </div>

      {/* Modal de filtro */}
      {isGlobalFilterModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#FFF] dark:bg-[#212529] rounded-3xl w-3/12 min-w-min px-8 pt-8 pb-8">
            <h2 className="text-xl font-bold text-[#002048] dark:text-[#F2F2F2] flex justify-between items-center mb-5">
              Filtros
              <span
                className="text-sm cursor-pointer dark:hover:text-red-500 hover:text-red-500 text-[#002048] dark:text-[#F2F2F2]"
                onClick={() => {
                  setSelectFilterTipoFichero("");
                  setSelectFilterExtArchivo("");
                  setSelectFilterSubidoPor("");
                  setTempFilterTipoArchivo("");
                  setTempFilterExtArchivo("");
                  setTempFilterSubidoPor("");
                  setIsGlobalFilterModalOpen(false);
                }}
              >
                Borrar filtros
              </span>
            </h2>

            <select
              value={tempFilterTipoArchivo}
              onChange={(e) => setTempFilterTipoArchivo(e.target.value)}
              className="w-full border rounded-2xl mb-4 text-black dark:text-[#E2E2E2] bg-[#F6F6F6] dark:bg-[#2C3034]"
            >
              <option value="" disabled>Tipo Fichero</option>
              <option value=""></option>
              <option value="1">Carpeta</option>
              <option value="2">Archivo</option>
            </select>

            <select
              value={tempFilterExtArchivo}
              onChange={(e) => setTempFilterExtArchivo(e.target.value)}
              className="w-full border rounded-2xl mb-4 text-black dark:text-[#E2E2E2] bg-[#F6F6F6] dark:bg-[#2C3034]"
            >
              <option value="" disabled>Extensión Archivo</option>
              <option value=""></option>
              <option value="1">pdf</option>
              <option value="2">zip</option>
              <option value="3">doc</option>
              <option value="4">docx</option>
              <option value="5">xls</option>
              <option value="6">xlsx</option>
              <option value="7">jpg</option>
              <option value="8">png</option>
              <option value="9">webp</option>
              <option value="10">csv</option>
            </select>

            <select
              value={tempFilterSubidoPor}
              onChange={(e) => setTempFilterSubidoPor(e.target.value)}
              className="w-full border rounded-2xl mb-4 text-black dark:text-[#E2E2E2] bg-[#F6F6F6] dark:bg-[#2C3034]"
            >
              <option value="" disabled>Subido Por</option>
              <option value=""></option>
              {/* Crear un conjunto único de los valores de created_by */}
              {[...new Set(files.map(file => file.created_by))]  // Usamos 'files' en lugar de 'filteredFiles' para mostrar todas las opciones disponibles.
                .map((createdBy, index) => (
                  <option key={index} value={createdBy}>
                    {createdBy}
                  </option>
                ))}
            </select>

            <div className="w-full inline-flex justify-end gap-4 mt-8">
              <button onClick={() => setIsGlobalFilterModalOpen(false)} className="bg-transparent text-black dark:text-[#F2F2F2] hover:bg-[#E2E2E2] dark:hover:bg-[#444] rounded-3xl px-7 py-2">
                Cancelar
              </button>
              <button
                onClick={() => {
                  setSelectFilterTipoFichero(tempFilterTipoArchivo);
                  setSelectFilterExtArchivo(tempFilterExtArchivo);
                  setSelectFilterSubidoPor(tempFilterSubidoPor);
                  setIsGlobalFilterModalOpen(false);
                }}
                className="text-white dark:text-black bg-[#FB7D16] hover:bg-[#002048] dark:hover:bg-[#F2F2F2] rounded-3xl px-7 py-2"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal show={isFileUploadOpen} onClose={closeModalFileUpload}>
        <FileUploadForm onClose={closeModalFileUpload} currentFolder={currentFolder} currentFiles={files} empleados={empleados} setIsFileUploadOpen={setIsFileUploadOpen} />
      </Modal>

      <Modal show={isCreateFolderOPen} onClose={closeModalCreateFolder}>
        <CreateFolderForm onClose={closeModalCreateFolder} currentFolder={currentFolder} currentFiles={files} setIsCreateFolderOpen={setIsCreateFolderOpen} />
      </Modal>


      <div className="flex justify-between mb-4">
        <GoBackButton
          folderStack={folderStack}
          setFolderStack={setFolderStack}
          currentFolder={currentFolder}
          handleBreadcrumbClick={handleBreadcrumbClick}
          homeHash={homeHash}
        />

        <ViewToggleButtons view={view} setView={setView} currentFolder={currentFolder} homeHash={homeHash} />
      </div>

      <FolderIcon
        folderStructure={filteredFiles}
        currentFolder={currentFolder}
        openFolder={openFolder}
        view={view}
        user={user}
        activeContextMenu={activeContextMenu}
        setActiveContextMenu={setActiveContextMenu}
        handleRightClickFolder={handleRightClickFolder}
        handleClickAccionesArchivos={handleClickAccionesArchivos}
        closeContextMenu={closeContextMenu}
        handleRightClickGlobal={handleRightClickGlobal}
        setIsCreateFolderOpen={setIsCreateFolderOpen}
        setIsFileUploadOpen={setIsFileUploadOpen}
      />

      {/* <FilesRecents
                recentFiles={recentFiles}
                currentFolder={currentFolder}
                view={view}
                addFileToRecentFiles={addFileToRecentFiles}
      /> */}
    </div>
  );
};

Index.layout = (page) => <AuthenticatedLayout children={page} title={'Archivos'} />
