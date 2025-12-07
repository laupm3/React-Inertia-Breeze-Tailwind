import { Head } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import LanguageSelector from '@/Components/Legacy/LanguageSelector';
import ThemeSelector from '@/Components/Legacy/ThemeSelector';

export default function TermsOfService({ terms }) {
    return (
        <>
            <Head title="Términos de Servicio" />

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
                                        href="#titular"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('titular').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Identificación del titular</span>
                                    </a></li>
                                    <li><a
                                        href="#condiciones"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('condiciones').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Condiciones de uso de la aplicación</span>
                                    </a></li>
                                    <li><a
                                        href="#propiedad"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('propiedad').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Propiedad intelectual e industrial</span>
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
                                        href="#enlaces"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('enlaces').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Enlaces externos</span>
                                    </a></li>
                                    <li><a
                                        href="#modificaciones"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('modificaciones').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Modificaciones</span>
                                    </a></li>
                                    <li><a
                                        href="#legislacion"
                                        onClick={e => {
                                            e.preventDefault();
                                            document.getElementById('legislacion').scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <span className="text-custom-blue dark:text-custom-white hover:text-custom-orange dark:hover:text-custom-orange">Legislación aplicable y jurisdicción</span>
                                    </a></li>
                                    
                                </ol>
                            </nav>
                            {/* Contenido principal */}
                            <div className="w-3/4 p-8 text-justify">
                                <h1 className="text-2xl font-bold mb-4 text-custom-orange">Términos de Servicio</h1>
                                <p className="mb-4 text-base font-semibold">
                                    La presente política regula el acceso, navegación y uso de la aplicación de recursos humanos desarrollada por <b>Empresa</b>, así como las condiciones bajo las cuales los usuarios interactúan con la misma. Al hacer uso de esta aplicación, el usuario acepta plenamente los términos aquí expuestos, por lo que se recomienda su lectura detenida antes de proceder con cualquier registro o uso continuado.
                                </p>
                                <p className="mb-8 text-base font-semibold">
                                    Esta aplicación ha sido diseñada para ofrecer servicios de gestión del empleo y la formación, canalizando procesos como la inscripción a cursos, el acceso a contenidos educativos, la tramitación de solicitudes a la agencia de colocación, el contacto con tutores o gestores, y el seguimiento de las acciones formativas y de intermediación laboral, tanto en programas internos como en aquellos subvencionados por organismos públicos.
                                </p>

                                {/* 1. Identificación del titular */}

                                <section id="titular" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">1. Identificación del titular</h2>
                                    <p clascsName="mb-2 space-y-3">
                                        De conformidad con lo establecido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, se informa que la presente aplicación es titularidad de: 
                                    </p>
                                    <div className="my-3">
                                        <li><b>Denominación social</b>: Empresa</li>
                                        <li><b>Domicilio social</b>: Dirección – Madrid</li>
                                        <li><b>CIF</b>: A25796547</li>
                                        <li><b>Correo electrónico</b>: <a href="mailto:coreos@coreos.com" className="dark:text-custom-white hover:text-custom-orange hover:underline">coreos.com</a></li>
                                    </div>
                                </section>

                                {/* 2. Condiciones de uso de la aplicación */}

                                <section id="condiciones" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">2. Condiciones de uso de la aplicación</h2>
                                    <p>
                                        El uso de esta aplicación por parte de los usuarios está condicionado a la aceptación sin reservas de las presentes condiciones de servicio. El usuario se compromete a utilizar la aplicación únicamente para los fines para los que ha sido diseñada, absteniéndose de realizar cualquier uso fraudulento, ilícito o contrario al orden público.
                                    </p>
                                    <p>
                                        Entre otros compromisos, el usuario acepta no introducir información falsa, ofensiva o inexacta; no emplear la aplicación para enviar comunicaciones no solicitadas o con fines comerciales no autorizados; y no realizar acciones que comprometan la seguridad, estabilidad o integridad de la plataforma o de los datos de terceros.
                                    </p>
                                    <p>
                                        El usuario será responsable exclusivo del uso que haga de la aplicación, de la exactitud de los datos que proporcione y de los contenidos que comparta a través de los formularios o funcionalidades ofrecidas.
                                    </p>
                                </section>

                                {/* 3. Propiedad intelectual e industrial */}

                                <section id="propiedad" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">3. Propiedad intelectual e industrial</h2>
                                    <p>
                                        Todos los elementos incluidos en esta aplicación, tales como textos, imágenes, logos, marcas, nombres comerciales, archivos, diseños, código fuente y estructura de navegación, son titularidad de ACADEMIA S.A. o de sus legítimos propietarios, y se encuentran protegidos por las leyes nacionales e internacionales sobre <b>propiedad intelectual e industrial</b>.
                                    </p>
                                    <p>
                                        No se permite la reproducción, transformación, distribución, comunicación pública o cualquier otro tipo de utilización, total o parcial, de los contenidos de esta aplicación sin el consentimiento previo, expreso y por escrito del titular. El acceso a la aplicación no implica en ningún caso una cesión o renuncia de dichos derechos.
                                    </p>
                                </section>

                                {/* 4. Responsabilidad y exención de garantías */}

                                <section id="responsabilidad" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">4. Responsabilidad y exención de garantías</h2>
                                    <p>
                                        ACADEMIA S.A. no garantiza la inexistencia de interrupciones o errores en el acceso a la aplicación, ni se hace responsable de los daños y perjuicios que puedan derivarse del uso de la información contenida en la misma, especialmente cuando dicho uso haya sido inadecuado, ilícito o no autorizado.
                                    </p>
                                    <p>
                                        Asimismo, no se responsabiliza de los contenidos alojados en enlaces a sitios web de terceros que puedan incorporarse en la aplicación, dado que no ejerce ningún control sobre ellos ni sobre sus políticas de privacidad. El acceso a estos enlaces se realiza bajo exclusiva responsabilidad del usuario, quien deberá tener en cuenta que sus términos y condiciones pueden diferir de los aquí recogidos.
                                    </p>
                                </section>

                                {/* 5. Enlaces externos */}

                                <section id="enlaces" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">5. Enlaces externos</h2>
                                    <p>
                                        En caso de que la aplicación incluya enlaces o hipervínculos a otros sitios web, estos se facilitarán únicamente como un servicio informativo y de referencia. La inclusión de estos enlaces no implica en ningún caso una recomendación, invitación o sugerencia por parte de  Empresa. Dado que estas páginas no son controladas por la entidad, no se asume responsabilidad alguna sobre sus contenidos, funcionamiento o políticas.
                                    </p>
                                </section>

                                {/* 6. Modificaciones */}

                                <section id="modificaciones" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">6. Modificaciones</h2>
                                    <p>
                                        ACADEMIA S.A. se reserva el derecho a realizar, sin necesidad de aviso previo, modificaciones o actualizaciones en los presentes términos, en la aplicación, o en cualquiera de los servicios, contenidos y funcionalidades ofrecidos a través de la misma. Los cambios que se introduzcan pasarán a ser vinculantes desde su publicación, por lo que se recomienda consultar periódicamente esta sección.
                                    </p>
                                </section>

                                {/* 7. Legislación aplicable y jurisdicción */}

                                <section id="legislacion" className="mb-10 space-y-3">
                                    <h2 className="text-lg font-bold mb-2 text-custom-orange">7. Legislación aplicable y jurisdicción</h2>
                                    <p>
                                       Las presentes condiciones se regirán e interpretarán conforme a la legislación vigente en España. Para la resolución de cualquier controversia que pudiera derivarse de su interpretación o aplicación, el usuario acepta expresamente someterse, con renuncia a cualquier otro fuero que pudiera corresponderle, a los <b>Juzgados y Tribunales de la ciudad de Madrid</b>, salvo que la normativa en vigor determine de forma imperativa otra jurisdicción.
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