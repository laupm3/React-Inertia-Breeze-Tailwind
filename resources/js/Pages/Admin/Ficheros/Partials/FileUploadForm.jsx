import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
//import { use } from "i18next";
//import { set } from "date-fns";
//import Icon from "@/imports/LucideIcon";

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal cursor-pointer">
    <line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" />
    <line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" />
    <line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" />
    <line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" />
  </svg>
);

const DownArrow = (props) => (
  <svg width="30" height="30" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.68396 3.05371C7.93172 3.05371 8.13257 3.29249 8.13257 3.58704V12.9661L10.9556 9.60992C11.1308 9.40164 11.4149 9.40164 11.5901 9.60992C11.7652 9.8182 11.7652 10.1559 11.5901 10.3642L8.00117 14.6309C7.91705 14.7308 7.80294 14.787 7.68396 14.787C7.56498 14.787 7.45087 14.7308 7.36675 14.6309L3.77788 10.3642C3.60268 10.1559 3.60268 9.8182 3.77788 9.60992C3.95307 9.40164 4.23712 9.40164 4.41231 9.60992L7.23535 12.9661V3.58704C7.23535 3.29249 7.4362 3.05371 7.68396 3.05371Z"
      fill="#CBCBCB"
      stroke="#CBCBCB"
    />
  </svg>
);

export default function FileUploadForm({ onClose, currentFolder, currentFiles, empleados, setIsFileUploadOpen }) {

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  //const [uploadResult, setUploadResult] = useState(null);
  const [hashActualFolder, setHashActualFolder] = useState(currentFolder.hash);
  const [pathFolderSelected, setPathFolderSelected] = useState(currentFolder.path);
  const [idFolderSelected, setIdFolderSelected] = useState(currentFolder.id);
  const [selectEnviarEmpresa, setSelectEnviarEmpresa] = useState("");
  const [selectEnviarDepartamento, setSelectEnviarDepartamento] = useState("");
  const [selectEnviarCentro, setSelectEnviarCentro] = useState("");
  const [selectSeguridadArchivo, setSelectSeguridadArchivo] = useState("L1");

  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState(empleados);
  const inputNombreCarpetaRef = useRef(null);
  const [isChecked, setIsChecked] = useState(false);


  useEffect(() => {
    inputNombreCarpetaRef.current.focus();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => {
      const availableSlots = 50 - prevFiles.length;
      const filesToAdd = acceptedFiles.slice(0, availableSlots);
      return [...prevFiles, ...filesToAdd];
    });
  }, []);


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
    maxFiles: 100, // 100 archivos máx.
    maxSize: 200 * 1024 * 1024, // 200 MB en total (bytes)
    multiple: true,
  });

  const handleFileUpload = async () => {

    if (files.length === 0) {
      toast.error("Error: No hay archivos para subir. Seleccione uno o más archivos.");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    // Se agregan los archivos. Cada archivo se enviará con el campo "files[]"
    files.forEach((file) => {
      formData.append("files[]", file);
    });
    // Enviar también el hash del directorio destino
    //formData.append("folder_parent_hash", hashFolderSelected);
    formData.append("folder_parent_id", idFolderSelected);
    formData.append("nivel_seguridad", selectSeguridadArchivo);
    formData.append("enviar_empresa", selectEnviarEmpresa);
    formData.append("enviar_departamento", selectEnviarDepartamento);
    formData.append("enviar_centro", selectEnviarCentro);
    formData.append('path_folder_selected', pathFolderSelected);
    formData.append('id_empleado', currentFolder.id_empleado);
    formData.append('enviar_todos', isChecked);
    formData.append('path_selected', pathFolderSelected);

    try {
      const response = await axios.post("/admin/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      //setUploadResult(response.data);
      router.visit(`/user/folders/${hashActualFolder}`, { preserveState: true });
      //console.log("Respuesta del backend: ", response.data);
      toast.success("Archivos subidos correctamente!");

    } catch (error) {
      //console.error("Error al subir archivos: ", error.response || error);
      toast.error(error.response.data.errors[0].error || "Error: No se han podido subir los archivos");
      /* setUploadResult(
        error.response ? error.response.data : { message: "Error de red" }
      ); */

    } finally {
      setUploading(false);
      setIsFileUploadOpen(false);
    }
  };

  const currentFolderPath = currentFolder.path.split('/');
  currentFolderPath.pop();

  const detectFolderHash = (idCarpeta) => {
    if (idCarpeta == currentFolder.id) {
      setIdFolderSelected(currentFolder.id);
      setPathFolderSelected(currentFolder.path);
      return;
    }

    const path = currentFiles.find(file => file.id == idCarpeta).path;
    setIdFolderSelected(idCarpeta);
    setPathFolderSelected(path);
  }

  const handleChangeEmpresa = (e) => {
    setSelectEnviarEmpresa(e.target.value);
    setIsFilterOpen(true);
  };

  const handleChangeDepartamento = (e) => {
    setSelectEnviarDepartamento(e.target.value);
    setIsFilterOpen(true);
  };

  const handleChangeCentro = (e) => {
    setSelectEnviarCentro(e.target.value);
    setIsFilterOpen(true);
  };

  const handleChangeSeguridadArchivo = (e) => {
    setSelectSeguridadArchivo(e.target.value);
  };

  // Extraer los id y nombres únicos de las empresas
  const empresasUnicas = [...new Set(empleados.flatMap((element) => element.empresas.map((empresa) => `${empresa.id}-${empresa.siglas}`)))]// Combina el id y nombre de la empresa en una cadena
    .map((empresa) => {
      const [id, siglas] = empresa.split('-'); // Separa el id y nombre
      return { id, siglas }; // Devuelve el objeto con id y nombre
    });

  // Extraer los nombres únicos de los departamentos
  const departamentosUnicos = [...new Set(empleados.flatMap((element) => element.departamentos.map((departamento) => `${departamento.id}-${departamento.nombre}`)))]
    .map((departamento) => {
      const [id, nombre] = departamento.split('-');
      return { id, nombre };
    });

  // Extraer los nombres únicos de los centros
  const centrosUnicos = [...new Set(empleados.flatMap((element) => element.centros.map((centro) => `${centro.id}-${centro.nombre}`)))]
    .map((centro) => {
      const [id, nombre] = centro.split('-');
      return { id, nombre };
    });


  const isFilterMatch = (empleado) => {
    const matchesGlobalSearch = empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      || empleado.primerApellido.toLowerCase().includes(searchTerm.toLowerCase())
      || empleado.departamentos[0].nombre.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;

    if (isFilterOpen) {
      // Filtrar por empresa solo si hay un valor seleccionado
      //if (selectEnviarEmpresa && selectEnviarEmpresa !== "") {
      if (selectEnviarEmpresa && selectEnviarEmpresa !== "") {
        //matchesFilter = matchesFilter && empleado.empresas[0].id == selectEnviarEmpresa;
        matchesFilter = matchesFilter && empleado.empresas.some((empresa) => empresa.id == selectEnviarEmpresa);
      }

      // Filtrar por departamento solo si hay un valor seleccionado
      if (selectEnviarDepartamento && selectEnviarDepartamento !== "") {
        matchesFilter = matchesFilter && empleado.departamentos.some((departamento) => departamento.id == selectEnviarDepartamento);
      }

      // Filtrar por centro solo si hay un valor seleccionado
      if (selectEnviarCentro && selectEnviarCentro !== "") {
        matchesFilter = matchesFilter && empleado.centros.some((centro) => centro.id == selectEnviarCentro);
      }

      // Si alguno de los filtros no coincide, no serán parte de los resultados
      return matchesGlobalSearch && matchesFilter;
    }

    return matchesGlobalSearch; // Si no se aplica el filtro, solo se realiza la búsqueda

  };

  const listaEmpleados = empleadosFiltrados.filter(isFilterMatch);

  const eliminarArchivoSeleccionado = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Función que se ejecuta cuando el checkbox "Enviar a todos" cambia
  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };


  return (
    <div className="w-full bg-gray-50">
      <Card className="w-full max-h-[95dvh] shadow-lg rounded-lg overflow-hidden px-2 pt-3 pb-1">
        {/* Título */}
        <div className="pl-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-3">
            Subir documentos
          </h2>
          <p className="mb-3">Carga archivos masivamente o individualmente</p>
          <div className="flex items-center gap-4">
            <label htmlFor="selectFolder">Elige la carpeta </label>
            <select name="selectFolder" id="selectFolder" className="block rounded-3xl border-gray-300 text-sm shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900" onChange={(e) => detectFolderHash(e.target.value)} ref={inputNombreCarpetaRef}>
              <option value={currentFolder.id}>Carpeta Actual (📁{currentFolderPath[currentFolderPath.length - 1] == "Empleados" ? " Principal" : currentFolder.nombre})</option>
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
                  <option key={index} value={file.id}>📂 {file.nombre}</option>
                ))}
            </select>
          </div>

        </div>

        {/* Contenido */}
        <CardContent className="flex-grow space-y-6 -ml-2">

          {/* Sección de archivos */}
          <div className="space-y-2">
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

            {/* Lista de archivos seleccionados */}
            <div className="flex flex-wrap gap-3 py-1 pr-2 max-h-[146px] overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="px-2 py-1 border border-custom-orange rounded inline-flex gap-2 items-center text-sm">
                  {file.name}
                  <span className="text-red-500 hover:text-red-300 cursor-pointer text-lg" onClick={() => eliminarArchivoSeleccionado(index)}>✘</span>
                </div>
              ))}
            </div>

            {/* Otros campos del formulario */}
            <div className="space-y-2">

              <div className="flex items-center gap-5">
                <Label htmlFor="security-type" className="text-sm font-medium text-gray-800 dark:text-gray-300">
                  Tipo de seguridad del archivo
                </Label>
                <select
                  id="security-type"
                  className="block mt-1 rounded-md border-gray-300 text-sm shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900"
                  value={selectSeguridadArchivo}
                  onChange={handleChangeSeguridadArchivo}
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
                <label htmlFor="">Enviar a toda la empresa
                  <input type="checkbox" name="sendAll" id="sendAll" className="ml-3 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500" checked={isChecked} onChange={handleCheckboxChange} />
                </label>
              </div>

              <div className="w-full flex items-center gap-4">
                Enviar a
                <select className="w-full mt-1 rounded-md border-gray-300 text-xs shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900" value={selectEnviarEmpresa} onChange={handleChangeEmpresa}>
                  <option className="font-bold text-sm mb-2" value="" disabled>Empresas</option>
                  <option className="font-bold mb-2" value=""> </option>
                  {empresasUnicas.map((empresa, index) => (
                    <option key={index} value={empresa.id}>{empresa.siglas}</option>
                  ))}
                </select>

                <select className="w-full block mt-1 rounded-md border-gray-300 text-xs shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900" value={selectEnviarDepartamento} onChange={handleChangeDepartamento}>
                  <option className="font-bold text-sm mb-2" value="" disabled>Departamentos</option>
                  <option className="font-bold mb-2" value=""> </option>
                  {departamentosUnicos.map((departamento, index) => (
                    <option key={index} value={departamento.id}>{departamento.nombre}</option>
                  ))}
                </select>

                <select className="w-full block mt-1 rounded-md border-gray-300 text-xs shadow-sm focus:ring-orange-500 focus:border-orange-500 dark:text-gray-900" value={selectEnviarCentro} onChange={handleChangeCentro}>
                  <option className="font-bold text-sm mb-2" value="" disabled>Centros</option>
                  <option className="font-bold mb-2" value=""> </option>
                  {centrosUnicos.map((centro, index) => (
                    <option key={index} value={centro.id}>{centro.nombre}</option>
                  ))}
                </select>
              </div>

            </div>

            {/*Campo de búsqueda e icono Filtro */}
            <div className="flex items-center gap-4 pt-3">
              <input
                type="text"
                placeholder="Buscar por nombre del empleado o departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-11/12 px-4 py-2 border rounded-3xl bg-[#F6F6F6] dark:bg-[#2C3034] text-sm text-[#575757] dark:text-[#F6F6F6] placeholder-[#575757]/80 dark:placeholder-[#F6F6F6]/80"
              />
              <span
                className="inline-flex gap-3 cursor-pointer"
                onClick={() => {
                  //setIsFilterOpen(true);
                }}
              >
                <FilterIcon />
              </span>
            </div>

            {/* Lista de empleados */}
            <div className="w-full max-h-[156px] overflow-y-auto pt-2">
              {listaEmpleados.map((empleado, index) => (
                <div key={index} className="w-[24%] inline-flex items-center text-xs mr-1 mb-3">
                  <div className="">
                    <img src={empleado.user.profile_photo_url} alt="" width="25" height="25" className="rounded-full mr-2" />
                  </div>

                  <div className="inline-flex flex-col">
                    <span>{empleado.nombre} {empleado.primerApellido}</span>
                    <span>{empleado.departamentos[0].nombre} {empleado.departamentos[1]?.nombre}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4">
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
                onClick={handleFileUpload}
                disabled={uploading}
              >
                {uploading ? "Subiendo..." : "Enviar archivos"}
              </Button>
            </div>

            {/* Mostrar respuesta */}
            {/* {uploadResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <pre className="text-xs text-gray-700">
                  {JSON.stringify(uploadResult, null, 2)}
                </pre>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
