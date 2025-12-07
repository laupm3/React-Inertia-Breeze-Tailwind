function FormPersonalData() {
  return (
    <div className="p-1 lg:p-4">
      <div className="flex flex-wrap justify-left">
        {/* Nombre */}
        <div className="flex flex-col gap-1 w-full lg:w-1/3 px-2 mb-6">
          <label htmlFor="nombre" className="font-medium text-sm text-nowrap">Nombre</label>
          <input
            type="text"
            id="nombre"
            placeholder="Nombre"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Apellido 1 */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="primerApellido" className="font-medium text-sm text-nowrap">Primer Apellido</label>
          <input
            type="text"
            id="primerApellido"
            placeholder="Primer Apellido"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Apellido 2 */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="segundoApellido" className="font-medium text-sm text-nowrap">Segundo Apellido</label>
          <input
            type="text"
            id="segundoApellido"
            placeholder="Segundo Apellido"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Fecha de Nacimiento */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="BirthDate" className="font-medium text-sm text-nowrap">Fecha de Nacimiento</label>
          <input
            type="date"
            id="BirthDate"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Idioma */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="language" className="font-medium text-sm text-nowrap">Preferencia de Idioma</label>
          <select
            id="language"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
            <option value="cat">Catalán</option>
            <option value="eus">Euskera</option>
            <option value="glg">Gallego</option>
          </select>
        </div>

        {/* Género */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="gender" className="font-medium text-sm text-nowrap">Género</label>
          <select
            id="gender"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          >
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
            <option value="undefined">Indefinido</option>
          </select>
        </div>

        {/* NIF */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="NIF" className="font-medium text-sm text-nowrap">NIF</label>
          <input
            type="text"
            id="NIF"
            placeholder="NIF"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* ID de Empresa */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="IDEmpresa" className="font-medium text-sm text-nowrap">ID de Empresa</label>
          <input
            type="text"
            id="IDEmpresa"
            placeholder="ID de Empresa"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Tipo de Documento */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="documentType" className="font-medium text-sm text-nowrap">Tipo de Documento</label>
          <select
            id="DocumentType"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          >
            <option value="DNI">DNI</option>
            <option value="CIF">CIF</option>
            <option value="PASSPORT">PASSPORT</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default FormPersonalData