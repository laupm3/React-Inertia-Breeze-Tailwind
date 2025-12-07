import { useState } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/Components/ui/select";

function ContratoSelector({ contratos, handleChange, id }) {
  const [selectedContrato, setSelectedContrato] = useState('');

  return (
    <span className=" font-bold">Contrato <span className="text-custom-orange">*</span>
      <div className="w-full">
        <Select
          value={selectedContrato}
          disabled={false}
          onValueChange={(e) => {
            setSelectedContrato(e)
            handleChange(id, { contrato_id: e })
          }}
        >
          <SelectTrigger className='rounded-full dark:text-custom-gray-semiLight bg-custom-gray-default dark:bg-custom-blackSemi'>
            <SelectValue placeholder='Contrato' />
          </SelectTrigger>
          <SelectContent className="bg-custom-gray-default dark:bg-custom-blackSemi">
            {contratos.map((contrato) => (
              <SelectItem
                key={contrato.id}
                value={contrato.id}
              >
                <div>
                  <p className='text-sm font-medium'>
                    {contrato.asignacion.nombre}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {contrato.n_expediente}
                  </p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </span>
  )
}

export default ContratoSelector
