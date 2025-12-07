import { useRef, useState, useCallback, createContext } from 'react'
import Icon from '@/imports/LucideIcon'

export const RangeContext = createContext()

export const RangeZone = ({ children, setSheetTable, setDialog, setDeleteHorarios }) => {
  const zoneRef = useRef(null)
  const [items, setItems] = useState([])
  const [selectedValues, setSelectedValues] = useState(new Set())
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })

  const [isSelecting, setIsSelecting] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [ctrlPressed, setCtrlPressed] = useState(false)

  const registerItem = useCallback((item) => {
    setItems(prev => {
      if (!prev.some(i => i.value === item.value)) {
        const rect = item.ref.current?.getBoundingClientRect()
        return [...prev, { ...item, rect }]
      }
      return prev
    })
  }, [])

  const unregisterItem = useCallback((value) => {
    setItems(prev => prev.filter(i => i.value !== value))
  }, [])

  const isItemSelected = (value) => selectedValues.has(value)

  const toggleSingleItem = (value) => {
    setSelectedValues(prev => {
      const newSet = new Set(prev)
      if (newSet.has(value)) newSet.delete(value)
      else newSet.add(value)
      return newSet
    })
  }

  const handleMouseDown = (e) => {
    if (isOpenModal) return // Evita selección si el modal está abierto
    if (e.button !== 0) return // Solo clic izquierdo

    const rect = zoneRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setStartPos({ x, y })
    setCurrentPos({ x, y })
    setIsSelecting(true)
    setCtrlPressed(e.ctrlKey)
  }

  const handleMouseMove = (e) => {
    if (!isSelecting) return
    const rect = zoneRef.current.getBoundingClientRect()
    setCurrentPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseUp = () => {
    if (!isSelecting) return
    setIsSelecting(false)

    const selectionRect = getSelectionRect()
    const selected = items.filter(({ ref, value }) => {
      if (!ref.current) return false
      const itemRect = ref.current.getBoundingClientRect()
      const zoneRect = zoneRef.current.getBoundingClientRect()

      const rel = {
        left: itemRect.left - zoneRect.left,
        top: itemRect.top - zoneRect.top,
        right: itemRect.right - zoneRect.left,
        bottom: itemRect.bottom - zoneRect.top
      }

      const overlaps = (
        selectionRect.left < rel.right &&
        selectionRect.right > rel.left &&
        selectionRect.top < rel.bottom &&
        selectionRect.bottom > rel.top
      )

      return overlaps
    })

    setSelectedValues(prev => {
      const newSet = new Set(ctrlPressed ? [...prev] : [])
      for (const { value } of selected) {
        if (ctrlPressed && newSet.has(value)) newSet.delete(value)
        else newSet.add(value)
      }
      return newSet
    })
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    if (selectedValues.size > 0) {
      setIsOpenModal(true)
      setModalPosition({ x: e.clientX, y: e.clientY })
    }
  }

  const getSelectionRect = () => {
    const x1 = Math.min(startPos.x, currentPos.x)
    const x2 = Math.max(startPos.x, currentPos.x)
    const y1 = Math.min(startPos.y, currentPos.y)
    const y2 = Math.max(startPos.y, currentPos.y)
    return { left: x1, right: x2, top: y1, bottom: y2 }
  }

  const getRectStyle = () => {
    const rect = getSelectionRect()
    return {
      position: 'absolute',
      left: rect.left,
      top: rect.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
      backgroundColor: 'rgba(255, 165, 0, 0.2)',
      border: '1px dashed #f0a92e',
      pointerEvents: 'none',
      zIndex: 100
    }
  }

  return (
    <RangeContext.Provider value={{ registerItem, unregisterItem, isItemSelected, toggleSingleItem }}>
      <div
        ref={zoneRef}
        className="relative w-full h-full select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        {isSelecting && <div style={getRectStyle()} />}
        {children}

        {isOpenModal && (
          <section
            className="fixed inset-0 z-20"
            onClick={() => setIsOpenModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute flex flex-col w-40 p-1 gap-1 border border-custom-gray-semiLight dark:border-custom-blackSemi bg-custom-gray-default dark:bg-custom-blackSemi rounded-md shadow-md"
              style={{
                left: modalPosition.x,
                top: modalPosition.y
              }}
            >
              {/* Informacion - sheettable */}
              {(selectedValues.size === 1 && [...selectedValues].at(0).horarioId) &&
                <button
                  className="flex items-center gap-2 hover:bg-custom-gray-semiLight dark:hover:bg-custom-gray-darker px-2 py-1 rounded-sm"
                  onClick={() => {
                    setSheetTable([...selectedValues][0].horarioId)
                    setIsOpenModal(false)
                  }}
                >
                  <Icon name="Info" className="w-4 mr-2" />
                  <span>Información</span>
                </button>
              }

              {/* Editar, crear - createupdatedialog */}
              <button
                className="flex items-center gap-2 hover:bg-custom-gray-semiLight dark:hover:bg-custom-gray-darker px-2 py-1 rounded-sm"
                onClick={() => {
                  setDialog([...selectedValues])
                  setIsOpenModal(false)
                }}
              >
                <Icon name="SquarePen" className="w-4 mr-2" />
                <span>
                  Editar
                </span>
              </button>

              {/* Eliminar - deletedialog */}
              {selectedValues.size > 0 && [...selectedValues].some(selectedValue => selectedValue?.horarioId) &&
                <button
                  className="flex items-center gap-2 text-red-500 hover:bg-red-500/40 px-2 py-1 rounded-sm"
                  onClick={() => {
                    setDeleteHorarios([...selectedValues].filter(selectedValue => selectedValue?.horarioId).map(selectedValue => selectedValue.horarioId))
                    setIsOpenModal(false)
                  }}
                >
                  <Icon name="X" className="w-4 mr-2" />
                  <span>Eliminar</span>
                </button>
              }
            </div>
          </section>
        )}
      </div>
    </RangeContext.Provider>
  )
}
