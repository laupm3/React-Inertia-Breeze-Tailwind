import { useState, useEffect } from 'react';

import userShortcuts from '@/Components/Sidebar/elements/ContentOneItems'

import BlockCard from '@/Components/OwnUi/BlockCard';
import Icon from '@/imports/LucideIcon';
import { toast } from 'sonner';
import Dropdown from "@/Components/Legacy/Dropdown";

import ThemeLight from '../ThemeImage/ThemeLight.png';
import ThemeDark from '../ThemeImage/ThemeDark.png';
import ThemeSystem from '../ThemeImage/ThemeSystem.png';
import { Button } from '@/Components/App/Buttons/Button';
import Checkbox from '@/Components/Checkbox';

export default function Appearance() {
    const [theme, setTheme] = useState('system');
    const [language, setLanguage] = useState('es');
    const [shortcuts, setShortcuts] = useState({});

    // Available languages
    const languages = [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
    ];

    // Theme images mapping
    const themeImages = {
        light: ThemeLight,
        dark: ThemeDark,
        system: ThemeSystem
    };

    // Theme options
    const themeOptions = [
        { value: 'light', label: 'Claro', description: 'Siempre usar modo claro' },
        { value: 'dark', label: 'Oscuro', description: 'Siempre usar modo oscuro' },
        { value: 'system', label: 'Sistema', description: 'Seguir preferencias del sistema' }
    ];

    // Get system preferences on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'system';
        const savedLanguage = localStorage.getItem('language') || 'es';
        const savedShortcuts = JSON.parse(localStorage.getItem('shortcuts'));

        setTheme(savedTheme);
        setLanguage(savedLanguage);

        // Filtramos claves válidas
        const validKeys = userShortcuts.map((item) => item.key);
        const fullShortcuts = {};

        userShortcuts.forEach((item) => {
            fullShortcuts[item.key] = {
                url: item.url,
                title: item.title,
                icon: item.icon,
                enabled: savedShortcuts?.[item.key]?.enabled || false,
            };
        });

        setShortcuts(fullShortcuts);
    }, []);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        toast.success('Tema actualizado');
    };


    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
        toast.success('Idioma actualizado');
    };

    const handleShortcutChange = (shortcutKey) => {
        const enabledCount = Object.values(shortcuts).filter(sc => sc.enabled).length;
        const newShortcuts = { ...shortcuts };

        // Si vamos a activar uno nuevo y ya hay 4 activos
        if (!newShortcuts[shortcutKey].enabled && enabledCount >= 4) {
            toast.error('Solo puedes seleccionar hasta 4 accesos directos');
            return;
        }

        newShortcuts[shortcutKey].enabled = !newShortcuts[shortcutKey].enabled;
        setShortcuts(newShortcuts);
    };

    return (
        <div className="md:max-h-[800px]  md:pr-2 md:[scrollbar-width:thin] md:[scrollbar-color:rgba(156,163,175,0.3)_transparent] md:[&::-webkit-scrollbar]:w-[6px] md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar-thumb]:bg-[rgba(156,163,175,0.3)] md:[&::-webkit-scrollbar-thumb]:rounded-[20px]">
            {/* Personalizar Section */}
            <BlockCard title="Personalizar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-visible">
                    {/* // ! No soy capaz de poner el DialogContent por fuera del BlockCard, solo funcionaria con <selector> que el content se ve por fuera */}
                    {/* Idioma: col-span-1 siempre, pero en desktop ocupa 1/3 */}
                    <div className="col-span-1">
                        <label className="block text-md font-bold text-gray-700 dark:text-gray-300 mb-3">
                            Idioma
                        </label>
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 border border-transparent text-md rounded-full text-custom-gray-semiDark bg-custom-gray-default hover:bg-custom-gray-light dark:bg-custom-blackSemi dark:text-custom-gray-dark dark:hover:bg-custom-gray-darker dark:hover:text-custom-white"
                                >
                                    <span>
                                        {languages.find((lang) => lang.code === language)?.flag} {languages.find((lang) => lang.code === language)?.name}
                                    </span>
                                    <Icon name="ChevronDown" className="w-4 h-4 text-custom-gray-semiDark dark:text-custom-gray-dark" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="left" width="48" className="z-20">
                                {languages.map((lang) => (
                                    <Dropdown.Link
                                        as="button"
                                        key={lang.code}
                                        type="button"
                                        onClick={() => handleLanguageChange(lang.code)}
                                        href="#"
                                    >
                                        <div className='flex items-center gap-2'>
                                            <span className="mr-2">{lang.flag}</span>
                                            <span>{lang.name}</span>
                                            {language === lang.code && (
                                                <Icon name="Check" className="w-4 h-4 ml-auto text-custom-orange" />
                                            )}
                                        </div>
                                    </Dropdown.Link>
                                ))}
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                    {/* Tema: col-span-1 en móvil, col-span-2 en desktop */}
                    <div className="col-span-1 lg:col-span-2">
                        <label className="block text-md font-bold text-gray-700 dark:text-gray-300 mb-3">
                            Tema
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {themeOptions.map((option) => (
                                <div key={option.value} className="text-center">
                                    <label className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="theme"
                                            value={option.value}
                                            checked={theme === option.value}
                                            onChange={(e) => handleThemeChange(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className={`
                                            relative mb-2 rounded-xl overflow-hidden border-2 transition-all
                                            ${theme === option.value
                                                ? 'border-orange-500'
                                                : 'hover:border-custom-gray-dark border-transparent'}
                                        `}>
                                            <img
                                                src={themeImages[option.value]}
                                                alt={`Tema ${option.label}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {option.label}
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </BlockCard>

            {/* Accesos directos Section */}
            <BlockCard title="Accesos directos">
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Selecciona las cuatro páginas que desea establecer como accesos directos en la página principal.
                    </p>
                </div>
                <div className="grid grid-cols-1">
                    {userShortcuts.map((shortcut) => (
                        <label
                            key={shortcut.key}
                            className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-custom-blackSemi transition-colors"
                        >
                            <Checkbox
                                checked={shortcuts[shortcut.key]?.enabled}
                                onCheckedChange={() => handleShortcutChange(shortcut.key)}
                            />
                            <Icon name={shortcut.icon} size='16' className="text-custom-orange" />
                            <span className="text-gray-900 dark:text-white font-medium">
                                {shortcut.title}
                            </span>
                        </label>
                    ))}
                </div>
                {/* Guardar cambios */}
                <div className=" flex space-x-4 justify-end">
                    <Button
                        variant={"primary"}
                        onClick={() => {
                            localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
                            toast.success('Accesos directos actualizados');
                        }}
                        className='px-6'
                    >
                        Guardar cambios
                    </Button>
                </div>
            </BlockCard>


        </div>
    );
}