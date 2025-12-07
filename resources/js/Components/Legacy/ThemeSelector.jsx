import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, MonitorCog } from "lucide-react";
import Dropdown from "@/Components/Legacy/Dropdown";
import { useTranslation } from 'react-i18next';
import Icon from '@/imports/LucideIcon';

/**
 * Show the theme selector, to change the theme of the application.
 * 
 * @returns {JSX.Element}
 */
export default function ThemeSelector() {

  const { t } = useTranslation(['glossary']);

  const [theme, setTheme] = useState('system');
  const dropdownRef = useRef(null);

  // Cargar el tema guardado en localStorage o el tema del sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'default';
      setTheme('system'); // Cambiar al tema del sistema
      applyTheme(systemTheme);
    }
  }, []);

  /**
   * Aplicar el tema a la aplicación.
   * 
   * @param {String} theme 
   */
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'default') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'default';
      applyTheme(systemTheme); // Aplicar según el sistema
    }
  };


  // Función para manejar el cambio de tema
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Función para obtener el ícono basado en el tema actual
  const getIcon = () => {
    switch (theme) {
      case 'dark':
        return <Icon name="Moon" className="text-custom-orange w-4 h-4" />;
      case 'default':
        return <Icon name="Sun" className="text-custom-orange w-4 h-4" />;
      case 'system':
      default:
        return <Icon name="MonitorCog" className="text-custom-orange w-4 h-4" />;
    }
  };

  return (
    <div ref={dropdownRef}>
      <Dropdown align="right" width="48">
        <Dropdown.Trigger>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-full text-custom-gray-semiDark  bg-custom-gray-default hover:bg-custom-gray-light dark:bg-custom-blackSemi dark:text-custom-gray-dark dark:hover:bg-custom-gray-darker dark:hover:text-custom-white transition ease-in-out duration-150"
          >
            {getIcon()} {/* Muestra el icono actual basado en el tema */}
          </button>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <Dropdown.Link
            href="#"
            onClick={() => handleThemeChange('system')}
          >
            <div className='flex flex-row gap-2'>
              <Icon name="MonitorCog" className="text-custom-orange"/><span>{t('theme.system')}</span>
            </div>
          </Dropdown.Link>
          <Dropdown.Link
            href="#"
            onClick={() => handleThemeChange('default')}
          >
            <div className='flex flex-row gap-2'>
            <Icon name="Sun" className="text-custom-orange"/><span>{t('theme.light')}</span>
            </div>
          </Dropdown.Link>
          <Dropdown.Link
            href="#"
            onClick={() => handleThemeChange('dark')}
          >
            <div className='flex flex-row gap-2'>
            <Icon name="Moon" className="text-custom-orange"/><span>{t('theme.dark')}</span>
            </div>
          </Dropdown.Link>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
}
