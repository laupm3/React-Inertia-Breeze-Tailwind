import { useContext, useEffect, useRef } from 'react'
import { RangeContext } from './RangeZone'

export const RangeItem = ({ children, value }) => {
  const ref = useRef(null)
  const { registerItem, unregisterItem, isItemSelected, toggleSingleItem } = useContext(RangeContext)

  useEffect(() => {
    registerItem({ ref, value })
    return () => unregisterItem(value)
  }, [value])

  const handleClick = (e) => {
    if (e.ctrlKey) {
      e.stopPropagation()
      toggleSingleItem(value)
    }
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className='select-none relative appHorario'
    >
      {children}
      {isItemSelected(value) && <div className='absolute top-0 left-0 w-full h-full border border-custom-orange/70 bg-custom-orange/20 rounded-xl'></div>}
    </div>
  )
}
