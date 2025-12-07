import { Head } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import LanguageSelector from '@/Components/Legacy/LanguageSelector';
import ThemeSelector from '@/Components/Legacy/ThemeSelector';

export default function PrivacyPolicy({ policy }) {
    return (
        <>
            <Head title="Política de Privacidad" />

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
                            <nav className="w-1/4 min-w-[180px] bg-white dark:bg-custom-blackSemi p-6 sticky top-2 self-start h-fit sm:rounded-lg">
                                <ol className="ml-4 space-y-4 text-sm font-semibold list-decimal dark:[&>li]:text-custom-orange text-custom-blue">
                                    <li><a
                                        href="#responsable"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('responsable').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Responsable del tratamiento</span>
                                    </a></li>
                                    <li><a
                                        href="#tratamiento"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('tratamiento').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Finalidades del tratamiento</span>
                                    </a></li>
                                    <li><a
                                        href="#legal"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('legal').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Base legal del tratamiento</span>
                                    </a></li>
                                    <li><a
                                        href="#conservacion"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('conservacion').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Plazos de conservación</span>
                                    </a></li>
                                    <li><a
                                        href="#datos"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('datos').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Comunicación de datos</span>
                                    </a></li>
                                    <li><a
                                        href="#derechos"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('derechos').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Derechos del interesado</span>
                                    </a></li>
                                    <li><a
                                        href="#menores"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('menores').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Política de menores</span>
                                    </a></li>
                                    <li><a
                                        href="#rrss"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('rrss').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Tratamiento en redes sociales</span>
                                    </a></li>
                                </ol>
                            </nav>
                            {/* Contenido principal */}
                            <div className="w-3/4 p-8 text-justify">
                                <h1 className="text-2xl font-bold mb-4 text-custom-orange">Política de Privacidad</h1>
                                <p className="mb-8 text-base font-semibold">
                                    En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos (RGPD), así como de la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos y Garantía de los Derechos Digitales (LOPDGDD), se informa a los usuarios de esta aplicación de recursos humanos sobre el tratamiento de sus datos personales y sus derechos al respecto.
                                </p>

                                {/* 1. Responsable del tratamiento */}

                                <section id="responsable" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">1. Responsable del tratamiento</h2>
                                    <p>
                                        <li><b>Nombre</b>: ACADEMIA  S.A. (Empresa)</li>
                                        <li><b>CIF</b>: A12345678</li>
                                        <li><b>Domicilio</b>: Dirección – Madrid</li>
                                        <li><b>Email de contacto</b>: <a href="mailto:rgpd@coreos.com" className="dark:text-custom-white hover:text-custom-orange hover:underline">rgpd@coreos.com</a></li>
                                    </p>
                                </section>

                                {/* 2. Finalidades del tratamiento */}

                                <section id="tratamiento" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">2. Finalidades del tratamiento</h2>
                                    <p>
                                        Los datos personales que el usuario proporciona a través de esta aplicación serán utilizados con el fin de gestionar los servicios ofrecidos, entre los que se incluyen la formación profesional, el soporte y atención personalizada, el envío de información sobre cursos, el acceso a la agencia de colocación, y la mejora continua de la experiencia dentro de la plataforma. Cuando la formación esté subvencionada por la Comunidad de Madrid o el Servicio Público de Empleo Estatal (SEPE), los datos serán tratados también por cuenta de dichos organismos para la correcta prestación del servicio.
                                    </p>
                                    <p>
                                        Asimismo, se utilizarán los datos para dar respuesta a solicitudes, comentarios o sugerencias que el usuario envíe mediante la aplicación, así como para contactar con él a través de diferentes canales como teléfono, correo electrónico o mensajería instantánea (incluyendo WhatsApp) siempre que sea necesario para la gestión del servicio.
                                    </p>
                                    <p>
                                        Los datos también podrán emplearse para gestionar su inscripción como demandante de empleo o como empresa en la agencia de colocación, facilitando la intermediación laboral. En este sentido, se podrán utilizar para cruzar su perfil con oportunidades laborales disponibles o necesidades específicas de contratación por parte de empresas.
                                    </p>
                                    <p>
                                        En lo relativo al uso de la plataforma, se podrá recoger información estadística anónima del uso de la app, tales como páginas o pantallas visitadas, frecuencia de acceso y patrones de navegación. Esta información se tratará únicamente con fines analíticos y no permite identificar al usuario en ningún momento.
                                    </p>
                                </section>

                                {/* 3. Base legal del tratamiento */}

                                <section id="legal" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">3. Base legal del tratamiento</h2>
                                    <p>
                                        El tratamiento de los datos personales se sustenta en distintas bases legales. En primer lugar, el <b>consentimiento expreso del usuario</b> cuando este facilita sus datos a través de formularios o comunicaciones, el cual puede ser retirado en cualquier momento. En segundo lugar, el tratamiento puede basarse en la <b>ejecución de una relación contractual</b>, como ocurre cuando se contratan o gestionan servicios de formación o empleo. Finalmente, el tratamiento de datos estadísticos y analíticos no identificativos se realiza en virtud del <b>interés legítimo del responsable</b>, siempre respetando los derechos y libertades del interesado.
                                    </p>
                                </section>

                                {/* 4. Plazos de conservación */}

                                <section id="conservacion" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">4. Plazos de conservación</h2>
                                    <p>
                                        Los datos personales se conservarán durante los plazos necesarios según la finalidad de cada tratamiento. Si el usuario ha solicitado información o comunicaciones comerciales, los datos se mantendrán hasta que retire su consentimiento o solicite su supresión. En el caso de procesos de selección gestionados a través de la agencia de colocación, los datos serán conservados por un periodo de <b>dos años</b> con el fin de facilitar su participación en futuras oportunidades laborales. Los datos recogidos en solicitudes de contacto, consultas o sugerencias se mantendrán mientras sean necesarios para su atención y mientras puedan derivarse responsabilidades legales.
                                    </p>
                                    <p>
                                        En lo que respecta a los servicios de formación, los datos se conservarán durante todo el periodo necesario para la prestación del servicio, así como el tiempo legalmente establecido para atender a posibles responsabilidades administrativas. Los datos de navegación y tráfico web con fines estadísticos serán conservados durante un máximo de <b>tres años</b>.
                                    </p>
                                </section>

                                {/* 5. Comunicación de datos */}

                                <section id="datos" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">5. Comunicación de datos</h2>
                                    <p>
                                        Los datos personales podrán ser comunicados a terceros en los siguientes supuestos: cuando el curso solicitado sea impartido por una de nuestras empresas colaboradoras, o bien cuando el perfil profesional del usuario encaje con las necesidades de alguna de estas empresas. Asimismo, si el usuario se inscribe en formación subvencionada, sus datos podrán ser comunicados a organismos públicos como la Comunidad de Madrid o el Servicio Público de Empleo Estatal (SEPE).
                                    </p>
                                    <p>
                                        Las entidades colaboradoras con las que podemos compartir datos para finalidades formativas o de empleo son:
                                    </p>
                                    <div className="my-3">
                                        <li><b>Empresa </b>– Dirección – Madrid</li>
                                        <li><b>Empresa 2.</b> – Dirección – Madrid</li>
                                        <li><b>Empresa 3.</b> – Dirección – Madrid</li>
                                        <li><b>Empresa 4.</b> – Dirección – Madrid</li>
                                        <li><b>Empresa 5.</b> – Dirección – Madrid</li>
                                        <li><b>Empresa 6.</b> – Dirección – Madrid</li>
                                        <li><b>Empresa 7.</b> – Dirección – Madrid</li>
                                    </div>
                                    <p>
                                        En el caso de participación en la agencia de colocación, los datos también podrán ser comunicados a terceras empresas que estén buscando candidatos y donde el perfil del usuario se adecúe a las vacantes disponibles.
                                    </p>
                                </section>

                                {/* 6. Derechos del interesado */}

                                <section id="derechos" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">6. Derechos del interesado</h2>
                                    <p>
                                        El usuario tiene derecho a acceder a sus datos personales, solicitar su rectificación si son inexactos o incompletos, solicitar su supresión cuando ya no sean necesarios o retirar su consentimiento. También podrá ejercer los derechos de portabilidad, limitación del tratamiento y oposición al mismo.
                                    </p>
                                    <p>
                                        Para el ejercicio de estos derechos, puede dirigirse mediante escrito firmado acompañado de copia de su documento oficial de identidad a:
                                    </p>
                                    <div className="my-3">
                                        <li><b>Dirección postal</b>: ACADEMIA (Empresa) S.A., Dirección – Madrid</li>
                                        <li><b>Correo electrónico</b>: <a href="mailto:rgpd@coreos.com" className="dark:text-custom-white hover:text-custom-orange hover:underline">rgpd@coreos.com</a></li>
                                    </div>
                                    <p>
                                        Además, si considera que el tratamiento de sus datos no se ajusta a la normativa vigente, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD): <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-custom-orange font-bold">www.aepd.es</a>
                                    </p>
                                </section>

                                {/* 7. Política de menores */}

                                <section id="menores" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">7. Política de menores</h2>
                                    <p>
                                        El uso de esta aplicación está reservado a personas <b>mayores de 18 años</b>. Queda prohibido el uso por parte de menores de esa edad, y se recuerda a los tutores legales que serán responsables si sus hijos menores proporcionan datos personales sin su consentimiento. Existen herramientas de control parental que pueden utilizarse para limitar el acceso a ciertos contenidos o servicios digitales.
                                    </p>
                                </section>

                                {/* 8. Tratamiento en redes sociales */}

                                <section id="rrss" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">8. Tratamiento en redes sociales</h2>
                                    <p>
                                        Al seguir o interactuar con perfiles de Empresa en redes sociales, el usuario consiente expresamente el tratamiento de sus datos conforme a las políticas de privacidad de cada red. Esto incluye el acceso a su perfil público y la posibilidad de que se muestren publicaciones relacionadas con cursos en su muro. Los datos proporcionados en este contexto se tratarán mientras el usuario no retire su consentimiento, el cual puede revocar en cualquier momento.
                                    </p>
                                    <p>
                                        Es importante tener en cuenta que los comentarios o contenidos que los usuarios publiquen en redes sociales pueden convertirse en información pública, y Empresa no se responsabiliza por el uso que otros hagan de dicha información. No obstante, cualquier persona cuyos datos personales estén incluidos en publicaciones podrá solicitar su eliminación a través de los medios de contacto indicados.
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