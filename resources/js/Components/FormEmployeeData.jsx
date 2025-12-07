export default function FormEmployeeData() {
  return (
    <div className='p-1 lg:p-4'>
      <h2 className='text-custom-blue dark:text-custom-white font-bold text-lg mb-6'>Informacion del Empleado</h2>

      <div className="flex flex-wrap justify-left">
        {/* Ocupacion */}
        <div className="flex flex-col gap-1 w-full lg:w-1/3 px-2 mb-6">
          <label htmlFor="ocupacion" className="font-medium text-sm text-nowrap">Ocupacion</label>
          <input
            type="text"
            id="ocupacion"
            placeholder="Responsable de Desarrollo"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Departamento */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="departamento" className="font-medium text-sm text-nowrap">Departamento</label>
          <input
            type="text"
            id="departamento"
            placeholder="Desarrollo"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Grupo */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="Grupo" className="font-medium text-sm text-nowrap">Grupo</label>
          <input
            type="text"
            id="grupo"
            placeholder="Frontend"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="estado" className="font-medium text-sm text-nowrap">Estado</label>
          <select
            id="estado"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        {/* NISS */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="niss" className="font-medium text-sm text-nowrap">NISS</label>
          <input
            type="text"
            id="niss"
            placeholder="xxxxxxxxxxxxxxxx"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>
      </div>
    </div>
  )
}