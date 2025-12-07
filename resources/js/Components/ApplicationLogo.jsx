//import LogoEmpresaLight from '@/../images/logotipos/lightmode.png';
//import LogoEmpresaDark from '@/../images/logotipos/darkmode.png';
//import shortLogo from '@/../images/logotipos/shortLogo.png';

/**
 * Componente que muestra el logo de la aplicación - Modo claro y oscuro
 * 
 * @returns {JSX.Element}
 */
export default function ApplicationLogo({ short = false }) {
    return (
        <>
            {short ? (
                <img src={shortLogo} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
                <>
                   {/*  <img src={LogoEmpresaLight} className="dark:hidden h-8 w-auto object-contain" alt="Logo Light" />
                    <img src={LogoEmpresaDark} className="hidden dark:block h-8 w-auto object-contain" alt="Logo Dark" /> */}
                </>
            )}
        </>
    )
}

