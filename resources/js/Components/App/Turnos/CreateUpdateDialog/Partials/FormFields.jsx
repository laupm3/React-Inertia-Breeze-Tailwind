import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";
import GoogleAddress from "@/Components/App/Direccion/GoogleAddress";
import { useDialogData } from '../Context/DialogDataContext';
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/Components/App/Hooks/useDebounce";
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
import EmpleadoAdvanceDropdown from "@/Components/App/Empleado/AdvanceDropdown/AdvanceDropdown";
import { useTranslation } from "react-i18next";
import AdvanceDropdown from "@/Components/App/Empresa/AdvanceDropdown/AdvanceDropdown";
import Icon from '@/imports/LucideIcon';

import { TimePicker } from "@/Components/App/DateTimePicker/TimePicker";

/**
 * Componente que renderiza los campos del formulario para crear/editar un registro.
 * 
 * Gestiona la entrada de datos del usuario, la validación de campos
 * y la presentación de errores de validación específicos para cada campo.
 *
 * @returns {JSX.Element} Campos del formulario con sus etiquetas y mensajes de error
 */
export default function FormFields({ }) {
  const {
    form,
    updateForm,
  } = useDialogData();
  const { data, errors } = form;

  // Estado local para los inputs
  const [localData, setLocalData] = useState(data);

  // Crear función debounced para actualizar el formulario real
  const debouncedUpdateForm = useDebounce(updateForm, 500);

  const [isBreak, setIsBreak] = useState(Boolean(localData.descanso_inicio && localData.descanso_fin));

  // Sincronizar el estado local cuando cambia data
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Función para manejar cambios en inputs con actualización inmediata de UI
  const handleChange = useCallback((key, value) => {
    // Actualizar inmediatamente el estado local para mejor UX
    if (typeof key === 'object') {
      setLocalData(prev => ({
        ...prev,
        ...key
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        [key]: value
      }));
    }

    // Eliminar el error correspondiente si existe
    if (errors[key]) {
      delete errors[key];
    }

    // Actualizar el formulario real con debounce
    debouncedUpdateForm(key, value);
  }, [debouncedUpdateForm]);

  const handleChangeImmediate = (key, value) => {
    setLocalData(prev => ({
      ...prev,
      [key]: value
    }));
    updateForm(key, value);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Nombre y Color */}
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Nombre del Turno <span className="text-custom-orange">*</span>
          </span>
          <Input
            placeholder="Turno de mañana 40 horas..."
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.nombre || ''}
            onChange={(e) => handleChange('nombre', e.target.value)}
          />
          {errors.nombre && <span className="text-xs text-red-500">{errors.nombre}</span>}
        </div>
        <div className="col-span-1 flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Color
          </span>
          <div className="relative">
            <input
              type="color"
              className="h-10 w-16"
              value={localData.color || '#FB7D16'}
              onChange={(e) => handleChange('color', e.target.value)}
              id="color"
            />
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
          Descripción
        </span>
        <Input
          placeholder="Loren Ipsum..."
          className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
          value={localData.descripcion || ''}
          onChange={(e) => handleChange('descripcion', e.target.value)}
        />
        {errors.descripcion && <span className="text-xs text-red-500">{errors.descripcion}</span>}
      </div>

      {/* Centro asociado */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
          Centro asociado <span className="text-custom-orange">*</span>
        </span>
        <FetchSelect
          fetchRoute='api.v1.admin.centros.index'
          responseParameter='centros'
          value={localData.centro_id}
          onValueChange={(value) => handleChange('centro_id', value)}
          disabled={false}
        />
        {errors.centro_id && <span className="text-xs text-red-500">{errors.centro_id}</span>}
      </div>
      <h3 className="font-bold">Horario</h3>

      {/* Horario */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Hora de inicio <span className="text-custom-orange">*</span>
          </span>
          <TimePicker
            className="rounded-full"
            value={localData.hora_inicio || ''}
            onChange={(timeString) => {
              handleChange('hora_inicio', timeString);
            }}
            placeholder="Selecciona hora de inicio"
            outputFormat="string"
          />
          {errors.hora_inicio && <span className="text-xs text-red-500">{errors.hora_inicio}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Hora de fin <span className="text-custom-orange">*</span>
          </span>
          <TimePicker
            className="rounded-full"
            value={localData.hora_fin || ''}
            onChange={(timeString) => {
              handleChange('hora_fin', timeString);
            }}
            placeholder="Selecciona hora de fin"
            outputFormat="string"
          />
          {errors.hora_fin && <span className="text-xs text-red-500">{errors.hora_fin}</span>}
        </div>
      </div>

      {/* Toggle para descanso */}
      <button
        className="flex flex-row items-center gap-3 text-sm font-semibold text-custom-blue dark:text-custom-white"
        onClick={(e) => {
          e.preventDefault();
          setIsBreak(!isBreak);
          handleChangeImmediate('descanso_inicio', '');
          handleChangeImmediate('descanso_fin', '');
        }}
        type="button"
      >
        {isBreak ? (
          <Icon name="X" size="16" />
        ) : (
          <Icon name="Plus" size="16" />
        )}
        {isBreak ? 'Quitar descanso' : 'Añadir descanso'}
      </button>

      {/* Descanso condicional */}
      {isBreak && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Inicio del descanso
            </span>
            <TimePicker
              className="rounded-full"
              value={localData.descanso_inicio || ''}
              onChange={(timeString) => {
                handleChange('descanso_inicio', timeString);
              }}
              placeholder="Selecciona inicio descanso"
              outputFormat="string"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Fin del descanso
            </span>
            <TimePicker
              className="rounded-full"
              value={localData.descanso_fin || ''}
              onChange={(timeString) => {
                handleChange('descanso_fin', timeString);
              }}
              placeholder="Selecciona fin descanso"
              outputFormat="string"
            />
          </div>
        </div>
      )}
    </div>
  )
}