import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './Partials/Index.css';
import ExtensionIcon from "@/Pages/User/Files/Partials/ExtensionIcon";
import Icon from "@/imports/LucideIcon";

const UpArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const DownArrow = ({ onClick }) => (
  <svg
    onClick={onClick}
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-download cursor-pointer"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const UnsupportedExtension = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-x text-[#E60000] dark:text-[#FF9EA1]">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m14.5 12.5-5 5" />
    <path d="m9.5 12.5 5 5" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal cursor-pointer">
    <line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" />
    <line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" />
    <line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" />
    <line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" />
  </svg>
);

export default function Index() {
  // Estados para listas, loading, previews, búsqueda, filtro y paginación.
  const [archivosRechazados, setArchivosRechazados] = useState([]);
  const [archivosAceptados, setArchivosAceptados] = useState([]);
  const [loadingIcon, setLoadingIcon] = useState(false);
  const [archivosPreview, setArchivosPreview] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("Estado");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilterOption, setTempFilterOption] = useState("Estado");

  // Estado para paginación.
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reinicia la página al cambiar búsqueda o filtro.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterOption]);

  // Función de validación: solo PDF y formato de nombre específico.
  const fileValidator = (file) => {
    if (file.type !== "application/pdf") {
      return {
        code: "file-invalid-type",
        message: "Extensión no soportada. El archivo debe ser de tipo PDF",
      };
    }
    if (!file.name) {
      return {
        code: "file-missing-name",
        message: "El archivo no tiene un nombre definido.",
      };
    }
  
    // Lista de meses válidos en español
    const mesesValidos = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
      "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"
    ];
  
    // Convertir el array en una expresión regular dinámica
    const mesesRegex = mesesValidos.join("|");
  
    const fileNameWithoutExt = file.name.replace(/\.pdf$/i, '');
    const regex = new RegExp(`^[0-9]{8}[A-Za-z]_(${mesesRegex})_2[0-9]{3}(_[A-Za-z]+)?$`, "i");
  
    if (!regex.test(fileNameWithoutExt)) {
      return {
        code: "file-invalid-name",
        message: "Error de formato en el nombre del archivo.",
      };
    }
  
    return null;
  };
  

  const convertBytesAMegabytes = (bytes) => {
    const megabytes = bytes / (1024 * 1024);
    return Number(megabytes.toFixed(1));
  };

  // Función auxiliar para crear URL de preview.
  const asignarPreview = (file) => URL.createObjectURL(file);

  // onDrop: procesa archivos rechazados (client-side) y aceptados.
  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    // Procesar archivos rechazados (client-side)
    if (fileRejections.length > 0) {
      const nuevosRechazados = fileRejections.map(rechazo => ({
        name: rechazo.file.name,
        size: `(${convertBytesAMegabytes(rechazo.file.size)} MB)`,
        error: rechazo.errors[0].message,
        unsupportedExt: rechazo.errors[0].code === "file-invalid-type",
        preview: asignarPreview(rechazo.file)
      }));
      setArchivosRechazados(prev => [...prev, ...nuevosRechazados]);
    }

    // Procesar archivos que pasaron la validación del frontend
    if (acceptedFiles.length > 0) {
      const filesWithPreview = acceptedFiles.map(file =>
        Object.assign(file, { preview: asignarPreview(file) })
      );
      setArchivosPreview(filesWithPreview);

      setLoadingIcon(true);
      const formData = new FormData();
      filesWithPreview.forEach(file => formData.append("files[]", file));

      try {
        const response = await fetch(route('admin.nominas.upload.multiple'), {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest"
          },
        });
        const data = await response.json();

        // Mapa de previews usando el nombre en minúsculas
        const previewMap = new Map();
        filesWithPreview.forEach(file =>
          previewMap.set(file.name.toLowerCase(), file.preview)
        );

        // Procesar errores devueltos por el backend
        if (data.errors && data.errors.length > 0) {
          const errorsWithPreview = data.errors.map(error => ({
            ...error,
            preview: previewMap.get(error.name.toLowerCase()) || null
          }));
          setArchivosRechazados(prev => [...prev, ...errorsWithPreview]);
        }

        // Procesar archivos aceptados
        if (data.accepted && data.accepted.length > 0) {
          const acceptedWithPreview = data.accepted.map(file => ({
            name: file.name,
            size: file.size,
            msg: "Correcto",
            preview: previewMap.get(file.name.toLowerCase()) || null,
          }));
          setArchivosAceptados(prev => [...prev, ...acceptedWithPreview]);
        }
      } catch (error) {
        console.error("Error al subir archivos:", error.message);
      } finally {
        setLoadingIcon(false);
      }
    }
  }, []);

  // Limpieza: revocar las URLs de preview para evitar fugas de memoria.
  useEffect(() => {
    return () => {
      archivosPreview.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [archivosPreview]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    validator: fileValidator,
    maxFiles: 300,
    maxSize: 209715200, // 200 MB
    multiple: true,
    onDrop,
  });

  // Función para eliminar un archivo de la lista (buscar por nombre)
  const eliminarArchivo = (file) => {
    if (file.error) {
      setArchivosRechazados(prev => prev.filter(item => item.name !== file.name));
    } else {
      setArchivosAceptados(prev => prev.filter(item => item.name !== file.name));
    }
  };

  // Función que determina si un archivo cumple con los criterios de búsqueda y filtro.
  const isMatch = (file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    if (filterOption !== "" && filterOption !== "Estado") {
      if (file.msg) {
        matchesFilter = file.msg.toLowerCase().includes(filterOption.toLowerCase());
      } else if (file.error) {
        matchesFilter = file.error.toLowerCase().includes(filterOption.toLowerCase());
      }
    }
    if(filterOption == "Archivo ya existente") {
      matchesFilter = file.error && file.error.toLowerCase().includes("ya existe");
    }
    return matchesSearch && matchesFilter;
  };

  // Se filtran ambas listas según la búsqueda y filtro.
  const filteredAceptados = archivosAceptados.filter(isMatch);
  const filteredRechazados = archivosRechazados.filter(isMatch);

  // Se combinan los resultados para paginarlos (manteniendo el estilo según si es error o correcto)
  const combinedResults = [...filteredRechazados, ...filteredAceptados];
  const totalPages = Math.ceil(combinedResults.length / itemsPerPage);
  const paginatedResults = combinedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Head title="Nóminas" />
      <h1 className="mx-4 sm:mx-6 lg:mx-10 my-2 text-2xl font-bold">Subida de Nóminas</h1>
      <div className="flex justify-end mx-4 sm:mx-6 lg:mx-10">
        <Link href={route('admin.nominas.history')}
          className='inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 dark:hover:bg-gray-400 font-semibold rounded-full py-2 px-4 bg-[#F6F6F6] dark:bg-[#2C3034] hover:bg-custom-gray-dark text-custom-blackLight hover:text-custom-white dark:text-custom-white duration-300 w-fit'>
          Histórico de Nóminas
          <Icon name="ArrowUpRight" className="w-4 ml-2" />
        </Link>
      </div>

      <div className="text-sm bg-[#FDF5D3] dark:bg-[#1D1F00] text-[#DC7609] dark:text-[#F3CF58] mx-4 sm:mx-6 lg:mx-10 my-4 p-4 rounded-xl">
        <p className="inline-flex items-center gap-2 font-bold">
          <WarningIcon /> Recuerda
        </p>
        <p className="px-8">
          Para subir archivos de manera correcta, deben tener el siguiente formato: <span className="font-bold">NIF del Empleado_Mes_Año_Descripción (la descripción es opcional)</span> y solo se acepta extensión <span className="font-bold">PDF</span>
        </p>
      </div>

      <div
        {...getRootProps()}
        className="border-dashed-custom flex flex-col items-center justify-center p-6 mx-4 sm:mx-6 lg:mx-10 mb-6 text-black dark:text-black cursor-pointer rounded-xl"
      >
        <input {...getInputProps()} />
        <span className="inline-flex gap-2 dark:bg-[#2C3034] text-[#575757] dark:text-white font-bold p-3 rounded-full">
          <UpArrow /> Subir archivo
        </span>
        <span className="font-medium text-[#8E8E8E] dark:text-[#F6F6F6] mt-4">
          Arrastra y suelta tu archivo aquí o haz clic para seleccionar.
        </span>
        <p className="text-[#8E8E8E] dark:text-[#F6F6F6] font-bold">(Máx. 200 MB o 300 archivos)</p>
      </div>

      <div className="w-full flex justify-between">
        {loadingIcon ? (
          <div className="mx-4 sm:mx-6 lg:mx-10 mb-0 inline-flex gap-2 justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader">
              <path d="M12 2v4" />
              <path d="m16.2 7.8 2.9-2.9" />
              <path d="M18 12h4" />
              <path d="m16.2 16.2 2.9 2.9" />
              <path d="M12 18v4" />
              <path d="m4.9 19.1 2.9-2.9" />
              <path d="M2 12h4" />
              <path d="m4.9 4.9 2.9 2.9" />
            </svg>
            <span>Subiendo...</span>
          </div>
        ) : (
          <div className="w-1/2"></div>
        )}

        {/* Sección superior con búsqueda y botón de filtro */}
        <div className="mx-4 sm:mx-6 lg:mx-10 mb-0 w-full sm:w-1/2 flex flex-row justify-end items-center gap-2">
          <span
            className="inline-flex gap-3 cursor-pointer"
            onClick={() => {
              setIsFilterModalOpen(true);
            }}
          >
            Filtrar
            <span className="text-[#FB7D16]">
              <FilterIcon />
            </span>
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre de archivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-3/4 sm:w-2/5 px-4 py-2 border rounded-3xl bg-[#F6F6F6] dark:bg-[#2C3034] text-[#575757] dark:text-[#F6F6F6] placeholder-[#575757]/80 dark:placeholder-[#F6F6F6]/80"
          />
        </div>
      </div>
      
      {/* Modal de filtro */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#FFF] dark:bg-[#212529] rounded-3xl w-11/12 sm:w-8/12 md:w-6/12 lg:w-4/12 xl:w-3/12 mx-4 px-6 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8 max-w-md">
            <h2 className="text-xl font-bold text-[#002048] dark:text-[#F2F2F2] flex justify-between items-center mb-5">
              Filtros 
              <span
                className="text-sm cursor-pointer dark:hover:text-red-500 hover:text-red-500 text-[#002048] dark:text-[#F2F2F2]"
                onClick={() => {
                  setTempFilterOption("Estado");
                  setFilterOption("");
                  setIsFilterModalOpen(false);
                }}
              >
                Borrar filtros
              </span>
            </h2>
            <select
              value={tempFilterOption}
              onChange={(e) => setTempFilterOption(e.target.value)}
              className="w-full border rounded-2xl text-black dark:text-[#E2E2E2] bg-[#F6F6F6] dark:bg-[#2C3034]"
            >
              <option value="Estado" disabled>Estado</option>
              <option value="Correcto">Correcto</option>
              <option value="Error de formato">Error de formato</option>
              <option value="Empleado no encontrado">Empleado no encontrado</option>
              <option value="Archivo ya existente">Archivo ya existente</option>
            </select>
            <div className="w-full inline-flex justify-end gap-4 mt-8">
              <button onClick={() => setIsFilterModalOpen(false)} className="bg-transparent text-black dark:text-[#F2F2F2] hover:bg-[#E2E2E2] dark:hover:bg-[#444] rounded-3xl px-7 py-2">
                Cancelar
              </button>
              <button
                onClick={() => {
                  setFilterOption(tempFilterOption);
                  setIsFilterModalOpen(false);
                }}
                className="text-white dark:text-black bg-[#FB7D16] hover:bg-[#002048] dark:hover:bg-[#F2F2F2] rounded-3xl px-7 py-2"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista paginada de resultados combinados */}
      {paginatedResults.length > 0 ? (
        <div className="mx-4 sm:mx-6 lg:mx-10 text-[#575757] dark:text-[#F6F6F6] h-[87dvh]">
          {paginatedResults.map((elem, index) => (
            elem.error ? (
              <div key={index} className="rounded-3xl bg-[#E60000]/20 dark:bg-[#C62828]/30 my-2 py-4 px-4 sm:px-8 w-full flex flex-col sm:flex-row gap-2 sm:gap-2 items-start sm:items-center">
                {elem.unsupportedExt ? (
                  <UnsupportedExtension />
                ) : (
                  <ExtensionIcon extension={elem.name.split('.').pop()} isDarkMode={false} size={40} />
                )}
                <span className="w-full sm:w-3/6 inline-flex flex-col">
                  <span>{elem.name}</span>
                  <span className="font-bold">{elem.size}</span>
                </span>
                {elem.error && (elem.error.includes("El archivo") || elem.error.includes("Empleado no encontrado")) ? (
                  <span className="w-full sm:w-2/6 inline-flex gap-2 text-[#DC7609] dark:text-[#F3CF58]">
                    <WarningIcon /> {elem.error}
                  </span>
                ) : (
                  <span className="w-full sm:w-2/6 inline-flex gap-2 text-[#E60000] dark:text-[#FF9EA1]">
                    <ErrorIcon /> {elem.error}
                  </span>
                )}
                <span className="w-full sm:w-1/6 inline-flex gap-6 justify-end sm:justify-end items-center mt-2 sm:mt-0">
                  {elem.preview && (
                    <span onClick={() => window.open(elem.preview, '_blank')} className="cursor-pointer bg-[#F6F6F6] dark:bg-[#2C3034] hover:bg-[#C2C2C2] dark:hover:bg-[#111] rounded-full p-2">
                      <DownArrow />
                    </span>
                  )}
                  <span onClick={() => eliminarArchivo(elem)} className="cursor-pointer text-[#CE2C31] dark:text-[#FF9EA1] hover:bg-[#E60000]/20 dark:hover:bg-[#E60000] rounded-full p-1">
                    <ErrorIcon />
                  </span>
                </span>
              </div>
            ) : (
              <div key={index} className="rounded-2xl bg-[#F6F6F6] dark:bg-[#2C3034] my-2 py-4 px-4 sm:px-8 w-full flex flex-col sm:flex-row gap-2 sm:gap-2 items-start sm:items-center">
                <ExtensionIcon extension={elem.name.split('.').pop()} isDarkMode={false} size={40} />
                <span className="w-full sm:w-3/6 inline-flex flex-col">
                  <span>{elem.name}</span>
                  <span className="font-bold">{elem.size}</span>
                </span>
                <span className="w-full sm:w-2/6 inline-flex gap-2 text-[#008A2E] dark:text-[#59F3A6]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {elem.msg}
                </span>
                <span className="w-full sm:w-1/6 inline-flex gap-6 justify-end sm:justify-end items-center mt-2 sm:mt-0">
                  {elem.preview && (
                    <span onClick={() => window.open(elem.preview, '_blank')} className="cursor-pointer bg-[#F6F6F6] dark:bg-[#2C3034] hover:bg-[#2C3034] dark:hover:bg-[#222] rounded-full p-2">
                      <DownArrow />
                    </span>
                  )}
                  <span onClick={() => eliminarArchivo(elem)} className="cursor-pointer text-[#CE2C31] dark:text-[#FF9EA1] dark:hover:bg-[#E60000] rounded-full p-1">
                    <ErrorIcon />
                  </span>
                </span>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="mx-4 sm:mx-6 lg:mx-10 text-center text-gray-500">
          No hay archivos para mostrar.
        </div>
      )}

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex justify-end my-5 mx-4 sm:mx-6 lg:mx-10 pagination">
          <button
            disabled={currentPage == 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 mx-1 bg-transparent rounded text-[#575757] dark:text-[#F6F6F6] disabled:text-[#575757]/50 dark:disabled:text-[#F6F6F6]/50"
          >
            &lt; Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 mx-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-[#2C3034]"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage == totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 mx-1 text-[#575757] dark:text-[#F6F6F6] disabled:text-[#575757]/50 dark:disabled:text-[#F6F6F6]/50"
          >
            Siguiente &gt;
          </button>
        </div>
      )}
    </>
  );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
