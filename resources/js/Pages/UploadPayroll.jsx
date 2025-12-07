import { useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import FileDropZone from '@/Components/OwnUi/FileDropZone'
import Icon from "@/imports/LucideIcon";
// import { SheetTableUsers } from '@/Components/Users/SheetTableUsers';

export default function UploadPayroll() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNominas, setSelectedNominas] = useState([]);
  const entriesPerPage = 8;

  /* simulacion de nominas subidas */
  const nominas = [
    {
      id: 1,
      dni: '11111111k',
      archivo: '11111111k.pdf',
      avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
      nombre: 'Juan Perez',
      fecha: '2023-05-01',
    },
    {
      id: 2,
      dni: '22222222k',
      archivo: '22222222k.pdf',
      avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
      nombre: 'Maria Lopez',
      fecha: '2023-05-02',
    },
    {
      id: 3,
      dni: '33333333k',
      archivo: '33333333k.pdf',
      avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
      nombre: 'Pedro Gomez',
      fecha: '2023-05-03',
    },
  ]

  // Filtrar las nóminas por cualquier criterio
  const filteredNominas = nominas.filter(nomina =>
    Object.values(nomina).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredNominas.length / entriesPerPage);

  // Obtener las nóminas para la página actual
  const currentNominas = filteredNominas.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Funciones de paginación
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Función para seleccionar/deseleccionar todas las nóminas
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentNominas.map(nomina => nomina.id);
      setSelectedNominas(allIds);
    } else {
      setSelectedNominas([]);
    }
  };

  // Función para manejar la selección individual
  const toggleSelectNomina = (id) => {
    setSelectedNominas(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(nominaId => nominaId !== id)
        : [...prevSelected, id]
    );
  };

  return (
    <>
      <Head title="Upload Payroll" />

      {/* seccion superior para subir las nominas */}        
      <div className="flex flex-col gap-2 p-8 ">
        <h2 className="text-2xl font-bold text-custom-blue dark:text-custom-white">Nominas</h2>
        <p className="text-xs text-custom-blue dark:text-custom-white mb-8">Sube nóminas masivamente. Recuerda que el  nombre del archivo tiene que tener el DNI del  empleado.</p>
        
        <FileDropZone />
      </div>

      {/* seccion inferior con una tabla para ver las nominas */}
      <div className="flex flex-col gap-2 p-8">
        <div className='flex flex-col md:flex-row items-left justify-between'>
          <h2 className="text-xl md:text-2xl font-bold text-custom-blue dark:text-custom-white">Archivos recientes</h2>
          
          {/* buscador */}
          <div className="flex flex-col gap-1 md:flex-row items-left md:items-center">
            <p className='text-xs mr-2 text-custom-gray-dark'>( {filteredNominas.length} nominas )</p>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 rounded-full w-xs border dark:border-0 border-custom-gray-dark bg-custom-white dark:bg-custom-gray-darker placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-8" >
          <div className="overflow-x-auto md:rounded-t-2xl">
            <table className="min-w-full text-left text-sm font-light">
              <thead className="font-bold bg-custom-gray-semiLight dark:bg-custom-gray-darker">
                <tr>
                  <th className="whitespace-nowrap px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedNominas.length === currentNominas.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th scope="col" className="whitespace-nowrap px-6 py-4">
                    <div className='flex flex-row items-center justify-center'>
                        archivo
                    </div>
                  </th>
                  <th scope="col" className="whitespace-nowrap px-6 py-4">
                    <div className='flex flex-row items-center justify-center'>
                        Fecha
                        <Icon name='ArrowDownUp' className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th scope="col" className="whitespace-nowrap px-6 py-4">
                    <div className='flex flex-row items-center justify-center'>
                        Empleado
                    </div>
                  </th>
                  <th scope="col" className="whitespace-nowrap px-6 py-4">
                    <div className='flex flex-row items-center justify-center'>
                        Info
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentNominas.map((nomina) => (
                  <tr key={nomina.id} className="border-b border-custom-gray-dark dark:border-neutral-500">
                    <td className="whitespace-nowrap px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedNominas.includes(nomina.id)}
                        onChange={() => toggleSelectNomina(nomina.id)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                        <div className='flex flex-row items-center justify-center'>
                            <Icon name='File' className="w-4 h-4 mr-2" />
                            <p className="hidden md:block">{nomina.archivo}</p>
                        </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                        <div className='flex flex-row items-center justify-center'>
                            {nomina.fecha}
                        </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                        <div className='flex flex-row items-center justify-center'>
                            <img src={nomina.avatar} alt={nomina.nombre} className="w-10 h-10 mr-2 rounded-full" />
                            {nomina.nombre}
                        </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                        <div className='flex flex-row items-center justify-center'>
                            {/* <SheetTableUsers user={nominas} /> */}
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-end items-center mt-4 gap-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`flex flex-row items-center p-2 rounded-lg transition-colors ${
                currentPage === 1 ? 'text-custom-gray-dark cursor-not-allowed' : 'text-custom-orange hover:text-custom-orange/50'
              }`}
            >
              <Icon name="ChevronLeft" />
              Anterior
            </button>
            <span className="text-sm text-custom-black dark:text-custom-white">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`flex flex-row items-center p-2 rounded-lg transition-colors ${
                currentPage === totalPages ? 'text-custom-gray-dark cursor-not-allowed' : 'text-custom-orange hover:text-custom-orange/50'
              }`}
            >
              Siguiente
              <Icon name="ChevronRight" />
            </button>
          </div>
        </div>
      </div>

    </>
  )
}

UploadPayroll.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;