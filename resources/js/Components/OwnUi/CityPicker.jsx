import React from 'react'

function CityPicker() {
  return (
    <div className='flex flex-col gap-1'>
        <label htmlFor="ciudad" className="font-medium text-sm">Ciudad</label>
        <input
            type="text"
            id="ciudad"
            placeholder="Ciudad"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
        />
    </div>
  )
}

export default CityPicker