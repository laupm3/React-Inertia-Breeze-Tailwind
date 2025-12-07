import TimelineContratos from "@/Components/App/Contratos/TimelineContratos";
import { useDataHandler } from "../Context/DataHandlerContext";
import { useState } from "react";
import ContratoEmpleado from "../Partials/ContratoEmpleado";

function DialogBody() {
  const { data = {} } = useDataHandler();
  const { contratos = [] } = data;

  const [contrato, setContrato] = useState(contratos[0] ?? null);

  // Update: Selecciona un contrato al hacer clic en la línea de tiempo
  const handleTimelineClick = (selectedContrato) => setContrato(selectedContrato);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Timeline de contratos */}
      <div className="w-64 max-h-[370px] overflow-y-auto dark:dark-scrollbar">
        <TimelineContratos
          data={contratos}
          onItemClick={handleTimelineClick}
        />
      </div>

      {contrato ? (
        <ContratoEmpleado contrato={contrato} />
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 bg-custom-gray-default rounded-xl">
          <p className="text-custom-blackSemi dark:text-custom-white">
            No hay contratos disponibles para mostrar.
          </p>
        </div>
      )}
    </div>
  )
}

export default DialogBody;