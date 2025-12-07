import { Button } from '@/Components/App/Buttons/Button'
import { DialogFooter as DialogFooterBase } from '@/Components/ui/dialog'
import { useDialogData } from '../Context/DialogDataContext'
import Spinner from '@/Components/App/Animations/Spinners/Spinner';

/**
 * Componente que muestra el pie del diálogo con las acciones disponibles.
 * 
 * Renderiza los botones de "Cancelar" y "Guardar"/"Actualizar", mostrando
 * un indicador de carga cuando se está procesando la solicitud.
 *
 * @component
 * @returns {JSX.Element} Pie del diálogo con botones de acción
 */
export default function DialogFooter({ onSubmit, onOpenChange }) {
  const {
    model,
    isSaving
  } = useDialogData();

  const buttonText = model ? "Actualizar" : "Guardar"
  const savingText = model ? "Actualizando..." : "Guardando..."

  return (
    <DialogFooterBase>
      <div className='flex flex-row w-full items-center justify-between'>
        <div className="flex items-center ml-auto justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isSaving}
          >
            {buttonText}
          </Button>
        </div>
      </div>

      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <Spinner size="sm" className="text-custom-orange" />
          <span className="text-md">{savingText}...</span>
        </div>
      )}
    </DialogFooterBase>
  )
}