import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react';

function Desplegable({name, id, options, multiple = false}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const desplegableRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (desplegableRef.current && !desplegableRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOption = (option) => {
    if (multiple) {
      setSelectedOptions(prev => {
        if (prev.find(item => item.value === option.value)) {
          return prev.filter(item => item.value !== option.value);
        } else {
          return [...prev, option];
        }
      });
    } else {
      setSelectedOptions([option]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-48" ref={desplegableRef}>
      {/* Botón del desplegable */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-transparent border-0 rounded-full
          hover:bg-custom-gray-light dark:hover:bg-custom-gray-darker
          focus:ring-0 focus:bg-custom-gray-light dark:focus:bg-custom-gray-darker
          text-custom-blackLight dark:text-custom-white
          flex items-center justify-between"
      >
        <span>{selectedOptions.length > 0 ? `${name} (${selectedOptions.length})` : name}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Panel desplegable */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 p-2 bg-custom-white dark:bg-custom-blackSemi rounded-xl shadow-lg">
          <div className="py-1 max-h-48 overflow-auto no-scrollbar space-y-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors rounded-lg
                  ${selectedOptions.find(item => item.value === option.value)
                    ? 'bg-custom-gray dark:bg-custom-black/40 text-custom-blackLight dark:text-custom-white'
                    : 'text-custom-gray-dark dark:text-custom-gray-light hover:bg-custom-gray dark:hover:bg-custom-black/20'
                  }`}
                title={option.title}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Opciones seleccionadas */}
      {selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                bg-custom-gray dark:bg-custom-blackLight
                text-custom-blackLight dark:text-custom-white"
            >
              {option.label}
              <button
                type="button"
                onClick={() => toggleOption(option)}
                className="hover:text-custom-orange transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default Desplegable