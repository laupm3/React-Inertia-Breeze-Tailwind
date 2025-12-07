import { useState, useEffect } from 'react'
import { Button } from "@/Components/App/Buttons/Button";
import Icon from '@/imports/LucideIcon';
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
import { Textarea } from "@/Components/ui/textarea";
import TurnoAdvanceDropdown from '@/Components/App/Turnos/AdvanceDropdown/AdvanceDropdown';
import ContratoSelector from './ContratoSelector';
import TextInput from "@/Components/OwnUi/TextInput";
import TimePicker from '@/Components/App/DateTimePicker/TimePicker';

function IndividualForm({
  id,
  localData,
  errors,
  handleChange,
  handleDelete = null,
  date,
  contratos,
}) {

  const [isDescanso, setIsDescanso] = useState(localData?.descanso_fin ? true : false);
  const [turnoInfo, setTurnoInfo] = useState({});

  useEffect(() => {
    if (contratos?.length === 1) {
      handleChange(id, { contrato_id: contratos[0].id })
    }
  }, [id]);

  // Función helper para convertir Date a string HH:mm
  const dateToTimeString = (time) => {
    if (time instanceof Date) {
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return time;
  };

  const handleTimeChange = (field, time) => {
    if (!date || !time) return handleChange(id, { [field]: null });
    
    const timeString = dateToTimeString(time);
    const fullDateTime = `${date} ${timeString}:00`;
    handleChange(id, { [field]: fullDateTime });
  };

  // Validaciones auxiliares
  const isStartBeforeEnd = (start, end) => {
    if (!start || !end) return false;
    const s = new Date(`${date} ${start}:00`);
    const e = new Date(`${date} ${end}:00`);
    return s < e;
  };

  const isTimeInRange = (time, start, end) => {
    if (!time || !start || !end) return false;
    const t = new Date(`${date} ${time}:00`);
    const s = new Date(`${date} ${start}:00`);
    const e = new Date(`${date} ${end}:00`);
    return s < t && t < e;
  };

  const handleTurnoChange = (value) => {
    const prevValue = turnoInfo;
    setTurnoInfo(value);

    if (value?.descansoInicio && value?.descansoFin) {
      setIsDescanso(true);
    }

    if (value !== prevValue) {
      // Si el turno cambia, actualizamos los campos de horario
      handleChange(id, {
        horario_inicio: `${date} ${value?.horaInicio}` || '',
        horario_fin: `${date} ${value?.horaFin}` || '',
        descanso_inicio: `${date} ${value?.descansoInicio}` || '',
        descanso_fin: `${date} ${value?.descansoFin}` || ''
      });
    }
  };

  return (
    <div className="relative grid grid-cols-4 gap-4">
      {/* Contrato / Anexo */}
      {(contratos && contratos.length > 1) &&
        <div className="flex flex-col justify-center col-span-2 gap-2">
          <ContratoSelector
            contratos={contratos}
            handleChange={handleChange}
            id={id}
          />
        </div>
      }

      {/* Turno */}
      <div className={`flex flex-col gap-0 ${(contratos && contratos.length > 1) ? 'col-span-2' : 'col-span-4'}`}>
        <span className="font-bold text-custom-blue dark:text-custom-gray-default">Turno <span className="text-custom-orange">*</span></span>
        <TurnoAdvanceDropdown
          defaultValue={localData?.turno_id || null}
          onChangeValue={(value) => handleChange(id, { turno_id: parseInt(value, 10) })}
          enableCreateUpdateView={true}
          handleResponse={(data) => handleTurnoChange(data)}
        />
        {errors.modalidad_id && <span className="text-red-500 text-sm">{errors.modalidad_id}</span>}
      </div>

      {/* Modalidad */}
      <div className="flex flex-col col-span-2 gap-2">
        <span className="font-bold text-custom-blue dark:text-custom-gray-default">Modalidad <span className="text-custom-orange">*</span></span>
        <FetchSelect
          fetchRoute='api.v1.admin.modalidades.index'
          responseParameter='modalidades'
          value={localData?.modalidad_id || null}
          onValueChange={(value) => handleChange(id, { modalidad_id: parseInt(value, 10) })}
          disabled={false}
        />
        {errors.modalidad_id && <span className="text-red-500 text-sm">{errors.modalidad_id}</span>}
      </div>

      {/* Hora de inicio */}
      <div className="flex flex-col col-span-1 gap-2">
        <span className="font-bold text-custom-blue dark:text-custom-gray-default">Hora de inicio <span className="text-custom-orange">*</span></span>
        <TimePicker
          value={localData?.horario_inicio?.split(' ')[1]?.slice(0, 5) || ''}
          onChange={(time) => handleTimeChange('horario_inicio', time)}
          placeholder="HH:mm"
          className="w-full"
          outputFormat="string"
        />
        {errors.horario_inicio && <span className="text-red-500 text-sm">{errors.horario_inicio}</span>}
      </div>

      {/* Hora de fin */}
      <div className="flex flex-col col-span-1 gap-2">
        <span className="font-bold text-custom-blue dark:text-custom-gray-default">Hora de fin <span className="text-custom-orange">*</span></span>
        <TimePicker
          value={localData?.horario_fin?.split(' ')[1]?.slice(0, 5) || ''}
          onChange={(time) => {
            const timeString = dateToTimeString(time);
            if (isStartBeforeEnd(localData?.horario_inicio?.split(' ')[1], timeString)) {
              handleTimeChange('horario_fin', time);
            }
          }}
          placeholder="HH:mm"
          className="w-full"
          outputFormat="string"
        />
        {errors.horario_fin && <span className="text-red-500 text-sm">{errors.horario_fin}</span>}
      </div>

      {/* Descanso */}
      {isDescanso ? (
        <div className="flex flex-row col-span-4 gap-4 px-2 py-4 rounded-xl">
          {/* Inicio descanso */}
          <div className="flex flex-col w-full gap-2">
            <span className="font-bold text-custom-blue dark:text-custom-gray-default">Inicio de descanso</span>
            <TimePicker
              value={localData?.descanso_inicio?.split(' ')[1]?.slice(0, 5) || ''}
              onChange={(time) => {
                const timeString = dateToTimeString(time);
                const inicio = localData?.horario_inicio?.split(' ')[1];
                const fin = localData?.horario_fin?.split(' ')[1];

                if (isTimeInRange(timeString, inicio, fin)) {
                  handleTimeChange('descanso_inicio', time);
                }
              }}
              placeholder="HH:mm"
              className="w-full"
              outputFormat="string"
            />
            {errors.descanso_inicio && <span className="text-red-500 text-sm">{errors.descanso_inicio}</span>}
          </div>

          {/* Fin descanso */}
          <div className="flex flex-col w-full gap-2">
            <span className="font-bold text-custom-blue dark:text-custom-gray-default">Fin de descanso</span>
            <TimePicker
              value={localData?.descanso_fin?.split(' ')[1]?.slice(0, 5) || ''}
              onChange={(time) => {
                const timeString = dateToTimeString(time);
                const inicio = localData?.horario_inicio?.split(' ')[1];
                const fin = localData?.horario_fin?.split(' ')[1];
                const descansoInicio = localData?.descanso_inicio?.split(' ')[1];

                if (isTimeInRange(timeString, descansoInicio, fin)) {
                  handleTimeChange('descanso_fin', time);
                }
              }}
              placeholder="HH:mm"
              className="w-full"
              outputFormat="string"
            />
            {errors.descanso_fin && <span className="text-red-500 text-sm">{errors.descanso_fin}</span>}
          </div>

          {/* Botón quitar descanso */}
          <Button
            className='aspect-square justify-center self-end'
            variant='destructive'
            size='icon'
            onClick={() => {
              setIsDescanso(false);
              handleChange(id, {
                descanso_inicio: '',
                descanso_fin: ''
              });
            }}
          >
            <Icon name='X' className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <Button
          className="col-span-4 justify-center"
          variant='ghost'
          onClick={() => setIsDescanso(true)}
        >
          <Icon name='Plus' className="mr-1 w-4 h-4" />
          Añadir descanso
        </Button>
      )}

      {/* Observaciones */}
      <div className="flex flex-col col-span-4 gap-2">
        <span className="font-bold text-custom-blue dark:text-custom-gray-default">Observaciones</span>
        <Textarea
          name="observaciones"
          value={localData?.observaciones}
          onChange={(e) => handleChange(id, { observaciones: e.target.value })}
          placeholder='Observaciones...'
          className="bg-custom-gray-default dark:bg-custom-blackSemi border-none rounded-xl p-2 resize-none h-28"
        />
        {errors.observaciones && <span className="text-red-500 text-sm">{errors.observaciones}</span>}
      </div>

      {/* Botón eliminar */}
      {handleDelete &&
        <div className="absolute -top-5 -right-5">
          <Button
            variant="destructive"
            onClick={() => handleDelete(localData?.id)}
            size={'icon'}
          >
            <Icon name='X' className="w-5 h-5" />
          </Button>
        </div>
      }
    </div>
  );
}

export default IndividualForm;
