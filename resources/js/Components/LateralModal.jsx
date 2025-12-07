import React, { useState, useEffect } from 'react';
import Icon from '@/imports/LucideIcon';

function LateralModal({ opened, onClose, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Nuevo estado para controlar la visibilidad del contenido

  useEffect(() => {
    if (opened) {
      setIsOpen(true);
      setTimeout(() => {
        setIsVisible(true);
      }, 100); // Retraso para manejar la animación
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setIsOpen(false);
      }, 300); // Tiempo que coincide con la duración de la transición
    }
  }, [opened]);

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-20 bg-black/20 dark:bg-black/35 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className={`fixed right-0 top-0 h-screen w-full gap-4 sm:w-3/4 md:w-1/2 p-5 bg-custom-gray-default dark:bg-custom-gray-sidebar rounded-l-3xl flex flex-col transform transition-transform duration-300 ease-in-out ${
              isVisible ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {onClose && (
              <button className="mb-4 top-5 left-5" onClick={onClose}>
                <Icon name="X" size="20" />
              </button>
            )}
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export default LateralModal;
