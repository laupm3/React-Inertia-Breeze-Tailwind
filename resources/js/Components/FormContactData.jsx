import CityPicker from '@/Components/OwnUi/CityPicker';
import ProvincePicker from '@/Components/OwnUi/ProvincePicker';

export default function FormContactData() {
  return (
    <div className='p-1 lg:p-4'>
      <h2 className='text-custom-blue dark:text-custom-white font-bold text-lg mb-6'>Informacion de contacto</h2>

      <div className="flex flex-wrap justify-left">
        {/* Ciudad */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <CityPicker />
        </div>

        {/* Provincia */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <ProvincePicker />
        </div>

        {/* Direccion */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="direccion" className="font-medium text-sm text-nowrap">Direccion</label>
          <input
            type="text"
            id="direccion"
            placeholder="C/ San Francisco, 123"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* telefono */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="Telefono" className="font-medium text-sm text-nowrap">Telefono</label>
          <input
            type="text"
            id="Telefono"
            placeholder="123456789"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* telefono secundario */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="TelefonoSecundario" className="font-medium text-sm text-nowrap">Telefono Secundario</label>
          <input
            type="text"
            id="TelefonoSecundario"
            placeholder="123456789"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="Email" className="font-medium text-sm text-nowrap">Email</label>
          <input
            type="mail"
            id="Email"
            placeholder="xxxx@xxx.xxx"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Email secundario */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="emailSecundario" className="font-medium text-sm text-nowrap">Email Secundario</label>
          <input
            type="mail"
            id="email"
            placeholder="xxxx@xxx.xxx"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>

        {/* Contacto de emergencia */}
        <div className="flex flex-col gap-1 w-1/2 lg:w-1/3 px-2 mb-6">
          <label htmlFor="EmergenciContact" className="font-medium text-sm text-nowrap">Contacto de Emergencia</label>
          <input
            type="text"
            id="EmergenciContact"
            placeholder="123456789"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
        </div>
      </div>
    </div>
  )
}