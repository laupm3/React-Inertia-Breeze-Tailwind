import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Breadcrumbs from "@/Components/FoldersFiles/breadcrumbs";
import FileUploadForm from "@/Components/FoldersFiles/newFile";
import FilesRecents from "@/Components/FoldersFiles/filesRecents";
import FolderIcon from "@/Components/FoldersFiles/folderIcon";
import GoBackButton from "@/Components/FoldersFiles/goBackButton";
import Modal from "@/Components/Modal";
import ViewToggleButtons from "@/Components/FoldersFiles/viewToggleButtons";

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
export default function Index({ files, currentFolder, breadcrumb }) {
    console.log('files from Index >> ', files)

    const page = usePage();
    const { user } = page.props.auth;

    const [recentFiles, setRecentFiles] = useState([]);
    const [folderStack, setFolderStack] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState("grid");
    const [homeHash, setHomeHash] = useState(currentFolder.hash || null);

    useEffect(() => {
        setFolderStack((prevStack) => [...prevStack, currentFolder]);
    }, [currentFolder]);

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
                        recentFile.nombre !== file.nombre ||
                        recentFile.parent_id !== filerecentFile.parent_id
                ),
            ].slice(0, 10); // Limitar a 10 archivos recientes
            saveRecentFilesToLocalStorage(updatedFiles);
            return updatedFiles;
        });
    };

    // Cargar archivos recientes al montar el componente
    /*  useEffect(() => {
         const loadedFiles = loadRecentFilesFromLocalStorage();
         setRecentFiles(loadedFiles);
     }, []); */

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6 ">
                <Breadcrumbs
                    folderStack={breadcrumb}
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
                    <FileUploadForm onClose={closeModal} currentFolder={currentFolder}/>
                </Modal>
            </div>


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
                folderStructure={files}
                currentFolder={currentFolder}
                openFolder={openFolder}
                view={view}
                user={user}
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