import APIProvider from "@/Components/App/Google/APIProvider";
import Autocomplete from "@/Components/App/Google/Autocomplete";
import { Input } from "@/Components/ui/input";
import Map from "@/Components/App/Google/Map";

/**
 * Generic component for searching addresses using Google Maps API, just create a handler for the selected coordinates without a Google Map
 * 
 * @param {CallableFunction} onSelect Handler for the selected coordinates
 * @param {boolean} showMap Whether to show the map or not
 * @returns 
 */
export default function GoogleAddress({
  onSelect,
  data,
  showMap = true,
  handleChange,
  selectedAddress,
  ...props
}) {

  const manageSelection = (placeDetails) => {
    if (!onSelect) {
      return;
    }
    onSelect(placeDetails);
  }

  return (
    <APIProvider>
      <Autocomplete
        selectedAddress={selectedAddress}
        onPlaceSelect={manageSelection}
        {...props}
      />
      <div className={showMap ? '' : 'hidden'}>
        <Map />
      </div>

      <div className="flex gap-4">
        {/* Campos de dirección detallada */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Portal</span>
          <Input
            placeholder="Portal"
            className="w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={data?.numero || ''}
            onChange={(e) => handleChange('numero', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Piso</span>
          <Input
            placeholder="Piso"
            className="w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={data?.piso || ''}
            onChange={(e) => handleChange('piso', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Puerta</span>
          <Input
            placeholder="Puerta"
            className="w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={data?.puerta || ''}
            onChange={(e) => handleChange('puerta', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Bloque</span>
          <Input
            placeholder="Bloque"
            className="w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={data?.bloque || ''}
            onChange={(e) => handleChange('bloque', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Escalera</span>
          <Input
            placeholder="Escalera"
            className="w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={data?.escalera || ''}
            onChange={(e) => handleChange('escalera', e.target.value)}
          />
        </div>
      </div>
    </APIProvider>
  )
}
