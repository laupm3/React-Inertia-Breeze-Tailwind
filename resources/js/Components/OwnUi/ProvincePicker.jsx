import React from 'react'

function ProvincePicker() {
  return (
    <div className='flex flex-col gap-1'>
        <label htmlFor="provincia" className="font-medium text-sm">Provincia</label>
          <input
            type="text"
            id="provincia"
            placeholder="Provincia"
            className="rounded-full bg-custom-white dark:bg-custom-gray-darker p-2"
          />
    </div>
  )
}

export default ProvincePicker