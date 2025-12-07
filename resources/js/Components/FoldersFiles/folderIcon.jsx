import { useEffect, useState } from "react";
import ContextMenu from "@/Components/FoldersFiles/contextMenu";
import ConfirmsPasswordFolders from "@/Components/FoldersFiles/ConfirmsPasswordFolders";
import ExtensionIcon from "@/Pages/User/Files/Partials/ExtensionIcon";
import { router, usePage } from "@inertiajs/react";
import EditFolderForm from "@/Pages/Admin/Ficheros/Partials/EditFolderForm";
import EditFileForm from "@/Pages/Admin/Ficheros/Partials/EditFileForm";
import RenameFolder from "@/Pages/Admin/Ficheros/Partials/RenameFolder";
import Modal from "@/Components/Modal";
import DecisionModal from "../App/Modals/DecisionModal";
import Icon from "@/imports/LucideIcon";
import { toast } from "sonner";

const FolderIcon = ({ folderStructure, currentFolder, openFolder, view, user, activeContextMenu, handleRightClickFolder, handleClickAccionesArchivos, closeContextMenu, handleRightClickGlobal, setIsCreateFolderOpen, setIsFileUploadOpen }) => {
  const [showModal, setShowModal] = useState(false);
  const [isModalEditFolderOpen, setIsModalEditFolderOpen] = useState(false);
  const [isModalEditFileOpen, setIsModalEditFileOpen] = useState(false);
  const [isModalRenameFolderOpen, setIsModalRenameFolderOpen] = useState(false);
  const [folderContextMenu, setFolderContextMenu] = useState(null);
  const [fileContextMenu, setFileContextMenu] = useState(null);
  const [folderSelected, setFolderSelected] = useState(null);
  const [isDeleteModal, setIsDeleteModal] = useState({ visible: false, folder: null });

  //AÑADIR IMAGEN DE USUARIO
  const ruta_img_perfil = usePage().props.auth.user.profile_photo_url;

  // Lógica para abrir una carpeta/archivo o descargar un archivo
  const handleOpenFolder = (folder) => {
    setFolderSelected(folder);

    if (folder.tipo_fichero_id == 1) {
      folder.nivel_seguridad_id == 3 ? setShowModal(true) : openFolder(folder);
    }

    if (folder.tipo_fichero_id == 2) {
      folder.nivel_seguridad_id == 3 ? setShowModal(true) : handleDownloadFile(folder);
    }

  };

  const handleDownloadFile = (folder) => {
    const urlApi = route('admin.files.download-url', { hash: folder.hash });
    fetch(urlApi)
      .then((response) => response.json())
      .then((data) => {
        const signedUrl = data.url;
        // Crear un enlace de descarga temporal
        const link = document.createElement("a");
        link.href = signedUrl;
        link.download = folder.nombre; // Usa el nombre real
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error al generar la URL firmada:", error);
      });

    //window.open(folder.download_url, '_blank');
  }


  const handlePasswordConfirmed = () => {
    if (folderSelected.tipo_fichero_id == 1) {
      openFolder(folderSelected);
    } else {
      handleDownloadFile(folderSelected);
    }
  };

  const formatearFecha = (isoDate) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short', // Muestra el mes en formato corto
      year: 'numeric',
    }).format(date).replace('.', ''); // Quita el punto del mes corto en español
  };


  const handleDeleteFolder = async (folder) => {
    //if (!confirm("⚠ ¿Estás seguro de querer eliminar esta carpeta?")) return;

    try {
      const response = await axios.delete(`/admin/files/delete/${folder.id}`);
      //console.log("Carpeta eliminada:", response.data);
      router.visit(`/user/folders/${currentFolder.hash}`, { preserveState: true });
      toast.success("El fichero ha sido eliminado correctamente!");

    } catch (error) {
      //console.error("Error al eliminar el fichero: ", error.response || error);
      toast.error("Error: No se ha podido eliminar el fichero!");
    }
  };


  const openModalEditFolder = () => setIsModalEditFolderOpen(true);
  const closeModalEditFolder = () => setIsModalEditFolderOpen(false);

  const openModalEditFile = () => setIsModalEditFileOpen(true);
  const closeModalEditFile = () => setIsModalEditFileOpen(false);

  const openModalRenameFolder = () => setIsModalRenameFolderOpen(true);
  const closeModalRenameFolder = () => setIsModalRenameFolderOpen(false);

  const handleEditFolder = (folder) => {
    setFolderContextMenu(folder);
    openModalEditFolder();
  }

  const handleEditFile = (folder) => {
    setFileContextMenu(folder);
    openModalEditFile();
  }

  const handleRenameFolder = (folder) => {
    setFolderContextMenu(folder);
    openModalRenameFolder();
  }


  return (
    <div onContextMenu={(e) => handleRightClickGlobal(e)} onClick={() => closeContextMenu()} className="min-h-[72dvh]">

      {activeContextMenu.visible && activeContextMenu.type === "global" && (
        <ContextMenu
          x={activeContextMenu.x > (window.innerWidth - 200) ? activeContextMenu.x - 190 : activeContextMenu.x}
          y={activeContextMenu.y}
          //onClose={() => setGlobalContextMenu({ visible: false })}
          options={[
            { label: "Nueva Carpeta", iconLabel: "FolderPlus", action: () => setIsCreateFolderOpen(true) },
            { label: "Nuevo Archivo", iconLabel: "FilePlus", action: () => setIsFileUploadOpen(true) },
          ]}
        />
      )}

      {folderStructure.length >= 1 ? (
        view === "grid" ? (
          <>
            <p className="font-bold text-lg ml-3 mb-4">Carpetas</p>
            {folderStructure.filter(folder => folder.tipo_fichero_id == 1).length < 1 && (
              <span className="ml-3">No hay carpetas</span>
            )}

            <div className="relative flex flex-wrap mb-10 pl-2">

              {folderStructure.filter(folder => folder.tipo_fichero_id == 1)
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
                .map((folder, index) => (

                  <div
                    key={index}
                    className="cursor-pointer py-6 pl-7 pr-8 border-2 dark:border-custom-gray-dark rounded-3xl m-4 flex items-center justify-stretch w-[70%] sm:w-[44%] md:w-[45%] lg:w-[29%] xl:w-[22%] 2xl:w-[17%] 3xl:w-[5%] hover:border-custom-orange dark:hover:border-custom-orange transition-colors duration-300"
                    onClick={() => window.innerWidth < 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con un toque normal en móvil
                    onDoubleClick={() => window.innerWidth >= 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con doble clic en desktop
                    onContextMenu={(e) => handleRightClickFolder(e, folder)} // Detectar clic derecho y llamar a la función
                  >
                    <svg
                      width="70"
                      viewBox="0 0 203 130"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="group mr-6"
                    >
                      <g clipPath="url(#clip0_2471_47803)">
                        <path
                          d="M182.7 17.3333H91.35L71.05 0H20.3C9.135 0 0 7.8 0 17.3333V52H203V34.6667C203 25.1333 193.865 17.3333 182.7 17.3333Z"
                          className="fill-custom-gray-dark dark:fill-custom-gray-darker group-hover:fill-custom-blue dark:group-hover:fill-custom-white transition-colors duration-300"
                        />
                        <path
                          d="M182.7 17H20.3C9.135 17 0 24.2643 0 33.1429V113.857C0 122.736 9.135 130 20.3 130H182.7C193.865 130 203 122.736 203 113.857V33.1429C203 24.2643 193.865 17 182.7 17Z"
                          className="fill-custom-gray-semiLight dark:fill-custom-blackSemi transition-colors duration-300"
                        />
                      </g>
                    </svg>

                    <div className="flex flex-col">
                      <span className="text-base font-bold">
                        {folder.nombre}
                      </span>
                      <span className="font-normal text-sm">
                        {folder.qty_ficheros} elementos
                      </span>
                    </div>
                  </div>

                ))}
            </div>

            {folderStructure.filter(folder => folder.tipo_fichero_id == 2).length > 0 && (
              <p className="font-bold text-lg ml-3 mb-4">Archivos</p>
            )}

            <div className="w-full flex justify-normal flex-wrap gap-8 p-4">

              {folderStructure.filter(folder => folder.tipo_fichero_id == 2).map((folder, index) => (
                <div
                  key={index}
                  //className="cursor-pointer py-5 pl-6 pr-8 border-2 dark:border-custom-gray-dark rounded-3xl m-4 flex items-center justify-stretch w-fit hover:border-spacing-8"
                  className="flex justify-around items-center w-[90%] sm:w-[80%] md:w-[47%] lg:w-[30%] xl:w-[30%] 2xl:w-[23%] hover:border-spacing-8 mx-auto md:mx-0"
                  //onClick={() => window.innerWidth < 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con un toque normal en móvil
                  //onDoubleClick={() => window.innerWidth >= 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con doble clic en desktop
                  onContextMenu={(e) => handleClickAccionesArchivos(e, folder)} // Detectar clic derecho y llamar a la función
                >

                  <div className="w-full flex flex-col bg-gray-300 p-5 rounded-2xl text-black">

                    <div className="w-full h-max flex gap-2 text-sm ml-1">
                      <div><ExtensionIcon extension={folder.path.split('.').pop()} isDarkMode={false} size={25} /></div>
                      <div className="flex gap-1 h-fit w-full overflow-hidden">
                        <span>{folder.path.split('/').pop()}</span>
                      </div>
                      <div className="cursor-pointer" onClick={(e) => handleClickAccionesArchivos(e, folder)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical">
                          <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                        </svg>
                      </div>
                    </div>

                    <div
                      className="w-full h-[100px] my-4 bg-white p-14 rounded-2xl flex justify-center items-center cursor-pointer"
                      onClick={() => window.innerWidth < 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con un toque normal en móvil
                      onDoubleClick={() => window.innerWidth >= 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con doble clic en desktop
                    >
                      <ExtensionIcon extension={folder.path.split('.').pop()} isDarkMode={false} size={70} />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="inline-flex items-center gap-2">
                        <img src={ruta_img_perfil} className="size-[30px] rounded-full" />
                        <span className="font-bold">{user.name}</span>
                      </div>
                      <span>{formatearFecha(folder.updated_at)}</span>
                    </div>

                  </div>

                </div>
              ))
              }

            </div>
          </>
        ) : (
          <>

            <div className="w-[98%] mx-auto shadow-md rounded-t-lg bg-custom-gray-default dark:bg-custom-blackSemi">
              <table className="w-full text-left mb-12 rounded-t-lg">
                <thead>
                  <tr className="text-gray-700 bg-gray-300 rounded-t-lg">
                    <th className="py-3 px-4 w-1/3">Nombre</th>
                    <th className="py-3 px-4 w-1/3">Subido por</th>
                    <th className="py-3 px-4 w-1/3">Último archivo subido</th>
                  </tr>
                </thead>
                <tbody>

                  {folderStructure.filter(folder => folder.tipo_fichero_id == 1)
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
                    .map((folder, index) => (
                      <tr
                        key={index}
                        className="border-t hover:bg-custom-gray-light dark:hover:bg-custom-gray-darker"
                      //onClick={() => window.innerWidth < 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con un toque normal en móvil
                      //onDoubleClick={() => window.innerWidth >= 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con doble clic en desktop
                      >
                        <td className="py-3 px-4 w-full inline-flex gap-4 cursor-pointer hover:text-custom-orange"
                          onClick={() => window.innerWidth < 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con un toque normal en móvil
                          onDoubleClick={() => window.innerWidth >= 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con doble clic en desktop
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder">
                            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                          </svg>
                          {folder.nombre}
                        </td>

                        <td className="py-3 px-4 w-1/3">{folder.qty_ficheros} elementos</td>

                        <td className="py-3 ps-4 pe-8 w-full inline-flex justify-between">{formatearFecha(folder.updated_at)}
                          <span className="hover:text-custom-orange rounded-full cursor-pointer" onClick={(e) => handleRightClickFolder(e, folder)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical">
                              <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                            </svg>
                          </span>
                        </td>
                      </tr>
                    ))}

                  {folderStructure.filter(folder => folder.tipo_fichero_id == 2).map((folder, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-custom-gray-light dark:hover:bg-custom-gray-darker"
                      //onClick={() => window.innerWidth < 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con un toque normal en móvil
                      //onDoubleClick={() => window.innerWidth >= 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con doble clic en desktop
                      onContextMenu={(e) => handleClickAccionesArchivos(e, folder)}
                    >
                      <td className="py-3 px-4 w-full inline-flex gap-4 max-h-12 cursor-pointer hover:text-custom-orange"
                        onClick={() => window.innerWidth < 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con un toque normal en móvil
                        onDoubleClick={() => window.innerWidth >= 760 ? handleOpenFolder(folder) : undefined} // Abrir carpeta con doble clic en desktop
                      >
                        {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                      </svg> */}
                        <div className="w-5"><ExtensionIcon extension={folder.path.split('.').pop()} isDarkMode={false} size="25" /></div>
                        <span> {folder.path.split('/').pop()} </span>
                      </td>

                      <td className="py-3 px-4 w-1/3">{user.name}</td>

                      <td className="py-3 ps-4 pe-8 w-full inline-flex justify-between">{formatearFecha(folder.created_at)}
                        <span className="hover:text-custom-orange rounded-full cursor-pointer" onClick={(e) => handleClickAccionesArchivos(e, folder)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical">
                            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                          </svg>
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </>
        )
      ) : (
        <p className="text-gray-500 text-center">
          No se encontraron archivos o carpetas.
        </p>
      )}

      {showModal && (
        <ConfirmsPasswordFolders
          show={showModal}
          onClose={() => setShowModal(false)}
          onConfirmed={handlePasswordConfirmed}
        />
      )}

      {/* Menú contextual Carpetas */}
      {activeContextMenu.visible && activeContextMenu.type === "folder" && (
        <ContextMenu
          x={activeContextMenu.x}
          y={activeContextMenu.y}
          onClose={closeContextMenu}
          options={[
            { label: "Abrir", iconLabel: "FolderOpen", action: () => handleOpenFolder(activeContextMenu.folder) },
            { label: "Editar nombre", iconLabel: "SquarePen", action: () => handleRenameFolder(activeContextMenu.folder) },
            { label: "Cambiar permisos", iconLabel: "Lock", action: () => handleEditFolder(activeContextMenu.folder) },
            { label: "Eliminar", iconLabel: "Trash2", action: () => setIsDeleteModal({ visible: true, folder: activeContextMenu.folder }) },
          ]}
        />
      )}

      {/* Menú contextual Archivos */}
      {activeContextMenu.visible && activeContextMenu.type === "file" && (
        <>
          <ContextMenu
            x={activeContextMenu.x > (window.innerWidth - 200) ? activeContextMenu.x - 204 : activeContextMenu.x + 4}
            y={activeContextMenu.y}
            onClose={closeContextMenu}
            options={[
              { label: "Descargar", iconLabel: "Download", action: () => handleOpenFolder(activeContextMenu.folder) },
              { label: "Cambiar permisos", iconLabel: "Lock", action: () => handleEditFile(activeContextMenu.folder) },
              { label: "Eliminar", iconLabel: "Trash2", action: () => setIsDeleteModal({ visible: true, folder: activeContextMenu.folder }) },
            ]}
          />
        </>
      )}

      <Modal show={isModalEditFolderOpen} onClose={closeModalEditFolder}>
        <EditFolderForm onClose={closeModalEditFolder} currentFolder={currentFolder} folderContextMenu={folderContextMenu} isModalEditFolderOpen={isModalEditFolderOpen} setIsModalEditFolderOpen={setIsModalEditFolderOpen} />
      </Modal>

      <Modal show={isModalEditFileOpen} onClose={closeModalEditFile}>
        <EditFileForm onClose={closeModalEditFile} currentFolder={currentFolder} fileContextMenu={fileContextMenu} isModalEditFileOpen={isModalEditFileOpen} setIsModalEditFileOpen={setIsModalEditFileOpen} />
      </Modal>

      <Modal show={isModalRenameFolderOpen} onClose={closeModalRenameFolder}>
        <RenameFolder onClose={closeModalRenameFolder} currentFolder={currentFolder} folderContextMenu={folderContextMenu} isModalEditFolderOpen={isModalRenameFolderOpen} setIsModalRenameFolderOpen={setIsModalRenameFolderOpen} />
      </Modal>

      {isDeleteModal.visible && (
        <DecisionModal
          title='¿Estás seguro de que quieres eliminar este fichero?'
          content='Esta acción no se puede deshacer. Todos los datos relacionados con este fichero se eliminarán.'
          open={isDeleteModal.visible}
          onOpenChange={() => setIsDeleteModal(!isDeleteModal.visible)}
          action={() => handleDeleteFolder(isDeleteModal.folder)}
          variant="destructive"
          icon={<Icon name="OctagonAlert" className="w-6 h-6 text-red-500" />}
        />
      )}

    </div>
  );
};

export default FolderIcon;
