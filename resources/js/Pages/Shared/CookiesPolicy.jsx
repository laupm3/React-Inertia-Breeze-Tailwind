import { Head } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import LanguageSelector from '@/Components/Legacy/LanguageSelector';
import ThemeSelector from '@/Components/Legacy/ThemeSelector';

export default function CookiesPolicy() {
    return (
        <>
            <Head title="Política de Cookies" />

            <div className="font-sans text-custom-blackSemi dark:text-custom-white antialiased">
                <div className="pt-4 bg-custom-gray-default dark:bg-custom-blackLight min-h-screen">
                    <div className="flex flex-col items-center pt-6 sm:pt-0">
                        <div>
                            <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                            <div className="absolute flex right-5 top-3 gap-3">
                                <LanguageSelector />
                                <ThemeSelector />
                            </div>
                        </div>
                        <div className="w-full sm:max-w-7xl my-6 p-0 flex bg-custom-white dark:bg-custom-blackSemi shadow-md overflow-visible sm:rounded-lg">
                            {/* Menú lateral sticky dentro del bloque */}
                            <nav className="w-1/4 min-w-[180px] bg-white dark:bg-custom-blackSemi p-6 sticky top-1 self-start h-fit sm:rounded-lg">
                                <ol className="ml-4 space-y-4 text-sm font-semibold list-decimal dark:[&>li]:text-custom-orange text-custom-blue">
                                    <li><a
                                        href="#cookies"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('cookies').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">¿Qué son las cookies?</span>
                                    </a></li>
                                    <li><a
                                        href="#cookies-utilizadas"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('cookies-utilizadas').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">¿Qué cookies utilizamos y para qué?</span>
                                    </a></li>
                                    <li><a
                                        href="#cookies-aplicacion"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('cookies-aplicacion').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Cookies utilizadas por esta aplicación</span>
                                    </a></li>
                                    <li><a
                                        href="#responsabilidad"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('responsabilidad').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Responsabilidad y exención de garantías</span>
                                    </a></li>
                                    <li><a
                                        href="#conservacion"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('conservacion').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Conservación de datos</span>
                                    </a></li>
                                    <li><a
                                        href="#eliminacion"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('eliminacion').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Gestión y eliminación de cookies</span>
                                    </a></li>
                                    <li><a
                                        href="#adicional"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('adicional').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Información adicional y contacto</span>
                                    </a></li>

                                </ol>
                            </nav>
                            {/* Contenido principal */}
                            <div className="w-3/4 p-8 text-justify">
                                <h1 className="text-2xl font-bold mb-4 text-custom-orange">Política de Cookies</h1>
                                <p className="mb-4 text-base font-semibold">
                                    Esta Política de Cookies tiene como finalidad informar al usuario de la aplicación de recursos humanos de <b>ACADEMIA (Empresa) S.A.</b> sobre el uso de cookies y tecnologías similares, de conformidad con lo establecido en la Ley 34/2002, de 11 de julio, de Servicios de la <b>Sociedad de la Información y del Comercio Electrónico (LSSI-CE)</b>, el <b>Reglamento General de Protección de Datos (RGPD) (UE) 2016/679</b>, y la <b>Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos y Garantía de los Derechos Digitales (LOPDGDD)</b>.
                                </p>

                                {/* 1. ¿Qué son las cookies? */}

                                <section id="cookies" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">1. ¿Qué son las cookies?</h2>
                                    <p clascsName="mb-2 space-y-3">
                                        Las cookies son archivos que los sitios web y aplicaciones instalan en el dispositivo del usuario —ya sea ordenador, smartphone o tableta— para almacenar o recuperar información sobre su actividad de navegación. Estas tecnologías permiten al servidor recordar ciertos datos que facilitan la interacción entre el usuario y el servicio, como preferencias de idioma, datos de inicio de sesión, o hábitos de navegación, entre otros.
                                    </p>
                                    <p clascsName="mb-2 space-y-3">
                                        También existen tecnologías similares, como los píxeles de seguimiento, los objetos locales compartidos o las cookies de tipo flash, que cumplen funciones equivalentes a las cookies tradicionales y que, en esta política, también se consideran bajo el término general de "cookies".
                                    </p>
                                </section>

                                {/* 2. ¿Qué cookies utilizamos y para qué? */}

                                <section id="cookies-utilizadas" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">2. ¿Qué cookies utilizamos y para qué?</h2>
                                    <p>
                                        La aplicación utiliza diferentes tipos de cookies con finalidades distintas. A continuación, se describen según su naturaleza y propósito:
                                    </p>
                                    <div>
                                        <ul className="list-disc ml-4 space-y-3">
                                            <li>
                                                <b>Cookies técnicas y funcionales</b>:son necesarias para el correcto funcionamiento de la aplicación. Permiten la navegación y el uso de las distintas funcionalidades, como el acceso a zonas seguras o la autenticación del usuario. Estas cookies no requieren consentimiento expreso, ya que su uso es indispensable para prestar el servicio solicitado.
                                            </li>
                                            <li>
                                                <b>Cookies analíticas</b>: recogen información sobre el comportamiento de los usuarios al navegar por la aplicación, con el fin de realizar análisis estadísticos y mejorar la experiencia del usuario. Aunque no identifican directamente al usuario, sí permiten conocer el número de visitas, las secciones más vistas o el tiempo de permanencia.
                                            </li>
                                            <li>
                                                <b>Cookies publicitarias y de personalización</b>: se utilizan para gestionar, de la forma más eficiente posible, los espacios publicitarios que pudieran incluirse en la aplicación. En algunos casos, permiten mostrar publicidad adaptada al perfil del usuario, basándose en sus hábitos de navegación.
                                            </li>
                                            <li>
                                                <b>Cookies sociales</b>:estas cookies son establecidas por plataformas de redes sociales y permiten compartir contenidos desde la aplicación hacia dichas plataformas. También pueden ser utilizadas por estas redes para rastrear la actividad del usuario en otros sitios.
                                            </li>
                                            <li>
                                                <b>Cookies de seguridad</b>: almacenan información cifrada con el objetivo de evitar vulnerabilidades de seguridad y garantizar la protección de los datos del usuario durante la navegación.
                                            </li>
                                            <li>
                                                <b>Cookies de terceros</b>: algunas cookies presentes en esta aplicación son gestionadas por terceros ajenos a Empresa, como Google, Facebook o Zoho. Dichos terceros pueden modificar en cualquier momento sus condiciones de uso, finalidades o duración.
                                            </li>
                                        </ul>
                                    </div>
                                </section>

                                {/* 3. Cookies utilizadas por esta aplicación */}

                                <section id="cookies-aplicacion" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold text-custom-orange">3. Cookies utilizadas por esta aplicación</h2>
                                    <p>
                                        A continuación se detallan algunas de las cookies activas en la plataforma, clasificadas por su finalidad y propiedad:
                                    </p>
                                    <div className="py-2">
                                        <h3 className="text-md font-bold mb-3 text-custom-blue dark:text-custom-orange">Cookies técnicas y funcionales</h3>
                                        <div className="overflow-x-auto rounded-md">
                                            <table className="w-full text-sm text-left border-custom-gray-default dark:border-custom-gray-darker">
                                                <thead className="text-xs text-custom-blackSemi dark:text-custom-white uppercase bg-custom-gray-default dark:bg-custom-gray-darker">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Propiedad</th>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Cookie</th>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Finalidad</th>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Plazo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-custom-gray-semiDark">
                                                    <tr className="bg-custom-gray-default/10 dark:bg-custom-gray-semiDark/10">
                                                        <td className="px-6 py-4 font-medium text-custom-blackSemi dark:text-custom-white">doubleclick.net</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">RUL</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Necesaria para el funcionamiento de servicios del sitio web</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">1 año</td>
                                                    </tr>
                                                    <tr className="bg-custom-gray-default/10 dark:bg-custom-gray-semiDark/10">
                                                        <td className="px-6 py-4 font-medium text-custom-blackSemi dark:text-custom-white">google.com</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">__Secure-3PSIDCC</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Seguridad y autenticación</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">1 año</td>
                                                    </tr>
                                                    <tr className="bg-custom-gray-default/10 dark:bg-custom-gray-semiDark/10">
                                                        <td className="px-6 py-4 font-medium text-custom-blackSemi dark:text-custom-white">empresa.com</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">gat_gtag_UA_130017961_1</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Control de carga del script de Google Analytics</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Sesión</td>
                                                    </tr>
                                                    <tr className="bg-custom-gray-default/10 dark:bg-custom-gray-semiDark/10">
                                                        <td className="px-6 py-4 font-medium text-custom-blackSemi dark:text-custom-white">salesiq.zoho.eu</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">LS_CSRF_TOKEN</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Protección frente a ataques de tipo CSRF</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Sesión</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="py-2">
                                        <h3 className="text-md font-bold mb-3 text-custom-blue dark:text-custom-orange">Cookies analíticas</h3>
                                        <div className="overflow-x-auto rounded-md">
                                            <table className="w-full text-sm text-left border-custom-gray-default dark:border-custom-gray-darker">
                                                <thead className="text-xs text-custom-blackSemi dark:text-custom-white uppercase bg-custom-gray-default dark:bg-custom-gray-darker">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Propiedad</th>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Cookie</th>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Finalidad</th>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Plazo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-custom-gray-semiDark">
                                                    <tr className="bg-custom-gray-default/10 dark:bg-custom-gray-semiDark/10">
                                                        <td className="px-6 py-4 font-medium text-custom-blackSemi dark:text-custom-white">google.com</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">__Secure-3PAPISID <br /> __Secure-3PSID</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Análisis de comportamiento de usuario y publicidad personalizada</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">2 años</td>
                                                    </tr>
                                                    <tr className="bg-custom-gray-default/10 dark:bg-custom-gray-semiDark/10">
                                                        <td className="px-6 py-4 font-medium text-custom-blackSemi dark:text-custom-white">empresa.com</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">__ga <br /> _gid</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Identificación de sesiones y usuarios</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">2 años o 20 horas</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="py-2">
                                        <h3 className="text-md font-bold mb-3 text-custom-blue dark:text-custom-orange">Cookies publicitarias</h3>
                                        <div className="overflow-x-auto rounded-md">
                                            <table className="w-full text-sm text-left border-custom-gray-default dark:border-custom-gray-darker">
                                                <thead className="text-xs text-custom-blackSemi dark:text-custom-white uppercase bg-custom-gray-default dark:bg-custom-gray-darker">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Propiedad</th>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Cookie</th>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Finalidad</th>
                                                        <th scope="col" className="px-6 py-4 font-semibold">Plazo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-custom-gray-semiDark">
                                                    <tr className="bg-custom-gray-default/10 dark:bg-custom-gray-semiDark/10">
                                                        <td className="px-6 py-4 font-medium text-custom-blackSemi dark:text-custom-white">doubleclick.net</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">IDE</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Optimización de campañas publicitarias</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">1 año</td>
                                                    </tr>
                                                    <tr className="bg-custom-gray-default/10 dark:bg-custom-gray-semiDark/10">
                                                        <td className="px-6 py-4 font-medium text-custom-blackSemi dark:text-custom-white">google.com</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">AID <br /> SID <br /> APISID <br /> HSID <br /> SSID</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Personalización de anuncios de Google según preferencias del usuario</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">1-2 años</td>
                                                    </tr>
                                                    <tr className="bg-custom-gray-default/10 dark:bg-custom-gray-semiDark/10">
                                                        <td className="px-6 py-4 font-medium text-custom-blackSemi dark:text-custom-white">empresa.com</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">_fbp</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">Segmentación publicitaria a través de Facebook</td>
                                                        <td className="px-6 py-4 text-custom-blackSemi/70 dark:text-custom-white">3 meses</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>

                                {/* 4. Responsabilidad y exención de garantías */}

                                <section id="responsabilidad" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">4. Responsabilidad y exención de garantías</h2>
                                    <p>
                                        La base legal que nos permite utilizar cookies no necesarias (analíticas, publicitarias, sociales, etc.) es el <b>consentimiento expreso del usuario</b>. Este consentimiento se solicita mediante el banner o panel de configuración que aparece al iniciar la navegación. El usuario puede modificar su elección en cualquier momento desde los ajustes de la aplicación o del navegador.
                                    </p>
                                    <p>
                                        Las cookies estrictamente necesarias se utilizan sobre la base del interés legítimo del responsable en garantizar la funcionalidad de la aplicación.
                                    </p>
                                </section>

                                {/* 5. Conservación de datos */}

                                <section id="conservacion" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">5. Conservación de datos</h2>
                                    <p>
                                        Los datos personales recopilados mediante cookies se conservarán durante los plazos especificados en cada una de las cookies utilizadas. Una vez transcurrido dicho periodo, los datos serán eliminados o anonimizados, salvo que exista una obligación legal que exija su conservación durante más tiempo.
                                    </p>
                                </section>

                                {/* 6. Gestión y eliminación de cookies */}

                                <section id="eliminacion" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">6. Gestión y eliminación de cookies</h2>
                                    <p>
                                        El usuario puede configurar su navegador o dispositivo para aceptar o rechazar por completo todas las cookies, o para recibir una notificación antes de que se almacene alguna. También puede eliminar las cookies ya almacenadas en su equipo. A continuación se indican algunos enlaces de ayuda según el navegador utilizado:
                                    </p>
                                    <ul className="list-disc list-inside">
                                        <li>
                                            <a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-custom-orange font-bold">Google Chrome</a>
                                        </li>
                                        <li>
                                            <a href="https://www.mozilla.org/es-ES/privacy/websites/#cookies" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-custom-orange font-bold">Mozilla Firefox</a>
                                        </li>
                                        <li>
                                            <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-custom-orange font-bold">Safari</a>
                                        </li>
                                        <li>
                                            <a href="https://help.opera.com/en/latest/security-and-privacy/#clearBrowsingData" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-custom-orange font-bold">Opera</a>
                                        </li>
                                    </ul>
                                    <p>También puede instalar extensiones para navegadores que bloquean automáticamente el uso de cookies no deseadas o complementos para evitar ser rastreado por servicios como Google Analytics.</p>
                                </section>

                                {/* 7. Información adicional y contacto */}

                                <section id="adicional" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">7. Información adicional y contacto</h2>
                                    <p>
                                        Para ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad u oposición al tratamiento de sus datos personales derivados del uso de cookies, el usuario puede dirigirse a:
                                    </p>
                                    <ul className="list-disc list-inside">
                                        <li><b>Responsable del tratamiento:</b> ACADEMIA </li>
                                        <li><b>Domicilio:</b> Dirección – Madrid</li>
                                        <li><b>Correo electrónico:</b> <a href="mailto:rgpd@coreos.com" className="dark:text-custom-white hover:text-custom-orange hover:underline">rgpd@coreos.com</a></li>
                                    </ul>
                                    <p>
                                        En caso de considerar que el tratamiento de datos no se ajusta a la normativa vigente, puede presentar una reclamación ante la Agencia Española de Protección de Datos: <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-custom-orange font-bold">www.aepd.es</a>
                                    </p>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}