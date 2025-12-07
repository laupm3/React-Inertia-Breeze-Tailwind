import React from 'react';

/**
 * Toggle switch personalizado para valores booleanos
 * @param {Object} props
 * @param {boolean} props.checked - Estado actual del toggle
 * @param {Function} props.onChange - Callback cuando cambia el estado
 * @param {string} props.label - Etiqueta del toggle
 * @param {string} props.trueLabel - Texto cuando está activado
 * @param {string} props.falseLabel - Texto cuando está desactivado
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {string} props.className - Clases adicionales
 * @returns {JSX.Element}
 */
const ToggleSwitch = ({ 
  checked = false, 
  onChange, 
  label,
  trueLabel = "Sí",
  falseLabel = "No",
  disabled = false,
  className = '' 
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && (
        <span className="text-sm font-medium text-custom-gray-semiDark dark:text-custom-white">
          {label}
        </span>
      )}
      
      <div className="flex items-center gap-2">
        {/* Etiqueta No/Falso */}
        <span 
          className={`text-sm transition-colors duration-200 ${
            !checked 
              ? 'text-custom-gray-semiDark dark:text-custom-white font-medium' 
              : 'text-custom-gray-default dark:text-gray-500'
          }`}
        >
          {falseLabel}
        </span>

        {/* Switch Container */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-custom-orange focus:ring-offset-2
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${checked 
              ? 'bg-custom-orange' 
              : 'bg-custom-gray-default dark:bg-custom-gray-darker'
            }
          `}
          aria-pressed={checked}
          aria-label={`${label}: ${checked ? trueLabel : falseLabel}`}
        >
          {/* Switch Thumb */}
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm
              ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>

        {/* Etiqueta Sí/Verdadero */}
        <span 
          className={`text-sm transition-colors duration-200 ${
            checked 
              ? 'text-custom-gray-semiDark dark:text-custom-white font-medium' 
              : 'text-custom-gray-default dark:text-gray-500'
          }`}
        >
          {trueLabel}
        </span>
      </div>
    </div>
  );
};

export default ToggleSwitch;
