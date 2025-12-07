import Dropdown from '@/Components/Legacy/Dropdown';
import { useTranslation } from 'react-i18next';
import languages from '@/Shared/Languages';

/**
 * Show the language selector.
 * 
 * @returns {JSX.Element}
 */
export default function LanguageSelector() {

    const { t, i18n } = useTranslation(['glossary']);

    const handleLocaleChange = (language) => i18n.changeLanguage(language.locale);

    const currentLanguage = languages.find(language => i18n.language === language.locale) || languages[1];

    return (
        < Dropdown
            align="right"
            width="48"
        >
            <Dropdown.Trigger>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-full text-custom-gray-semiDark  bg-custom-gray-default hover:bg-custom-gray-light dark:bg-custom-blackSemi dark:text-custom-gray-dark dark:hover:bg-custom-gray-darker dark:hover:text-custom-white transition ease-in-out duration-150"
                >
                    <span>{t('language')}: {currentLanguage.cultural_configuration}</span>

                    <svg className="-me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content>
                {languages.map((language) => (
                    <Dropdown.Link
                        key={language.id}
                        onClick={() => handleLocaleChange(language)}
                    >
                        {language.name} ({language.region})
                    </Dropdown.Link>
                ))}
            </Dropdown.Content>
        </Dropdown >
    )
}