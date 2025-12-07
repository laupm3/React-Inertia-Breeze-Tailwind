import BlockCard from '@/Components/OwnUi/BlockCard'
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { useDialogData } from '../Context/DialogDataContext';

function DatosDelEquipo({ errors, localData, handleChange }) {
  const {
    model,
    permissions,
  } = useDialogData();

  return (
    <BlockCard title='Datos del equipo' className='w-full'>
      {/* Campo: Nombre del equipo */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
          Nombre del equipo <span className="text-custom-orange"> *</span>
        </span>
        <Input
          type="text"
          className="rounded-full border border-gray-300 p-2 dark:bg-custom-blackSemi dark:text-custom-gray-semiLight bg-custom-gray-default w-full"
          onChange={(e) => {
            handleChange('name', e.target.value);
          }}
          value={localData?.name || ''}
          disabled={!model ? false : !permissions?.canUpdateTeam ? true : false}
          placeholder="Nombre del equipo"
        />
        {errors?.name && <span className="text-xs text-red-500">{errors.name}</span>}
      </div>

      {/* Campo: Descripción */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
          Descripción <span className="text-custom-orange"> *</span>
        </span>
        <Textarea
          name="description"
          value={localData?.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder='Descripción del equipo'
          className="bg-custom-gray-default dark:bg-custom-blackSemi border-none rounded-xl p-2 resize-none h-28 w-full"
          disabled={!model ? false : !permissions?.canUpdateTeam ? true : false}
        />
        {errors?.description && <span className="text-xs text-red-500">{errors.description}</span>}
      </div>
    </BlockCard>
  )
}

export default DatosDelEquipo