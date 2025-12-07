import { useMemo, useState } from 'react';

export default function TemplateRenderer({ htmlContent }) {
    const [debugMode, setDebugMode] = useState(false);

    const processedContent = useMemo(() => {
        if (!htmlContent) {
            return {
                success: false,
                error: 'No hay contenido HTML para procesar',
                content: null
            };
        }

        try {
            console.log('🚀 Template Renderer - Renderizado directo optimizado...');

            // Limpiar HTML
            let cleanHtml = htmlContent;
            if (cleanHtml.includes('\\')) {
                cleanHtml = cleanHtml
                    .replace(/\\n/g, '\n')
                    .replace(/\\t/g, '\t')
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\');
            }

            // Parse del HTML completo
            const parser = new DOMParser();
            const doc = parser.parseFromString(cleanHtml, 'text/html');

            // Extraer TODOS los estilos CSS
            const styleElements = doc.querySelectorAll('style');
            let allStyles = '';
            styleElements.forEach(style => {
                allStyles += style.textContent || style.innerHTML;
            });

            // Detectar elementos que deberían ser bold
            const boldElements = [];

            // Buscar elementos <strong> y <b>
            const strongElements = doc.querySelectorAll('strong, b');
            strongElements.forEach((el, index) => {
                const uniqueClass = `brevo-bold-${index}`;
                el.classList.add(uniqueClass);
                boldElements.push(uniqueClass);
            });

            // Buscar elementos de títulos <h1> a <h6>
            const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headingElements.forEach((el, index) => {
                const uniqueClass = `brevo-heading-${index}`;
                el.classList.add(uniqueClass);
                boldElements.push(uniqueClass);
            });

            // Buscar elementos con font-weight en inline styles
            const elementsWithWeight = doc.querySelectorAll('[style*="font-weight"]');
            elementsWithWeight.forEach((el, index) => {
                const style = el.getAttribute('style') || '';
                if (style.includes('font-weight: bold') ||
                    style.includes('font-weight:bold') ||
                    style.includes('font-weight: 700') ||
                    style.includes('font-weight:700') ||
                    style.includes('font-weight: 600') ||
                    style.includes('font-weight:600')) {
                    const uniqueClass = `brevo-weight-bold-${index}`;
                    el.classList.add(uniqueClass);
                    boldElements.push(uniqueClass);
                }
            });

            // Buscar en CSS clases que tengan font-weight: bold
            const cssRules = allStyles.match(/[^{}]+\{[^{}]*font-weight\s*:\s*(bold|700|600)[^{}]*\}/gi);
            if (cssRules) {
                cssRules.forEach((rule, index) => {
                    const className = `brevo-css-bold-${index}`;
                    boldElements.push(className);
                });
            }

            // Extraer meta tags y otros elementos del head
            const headElements = doc.head ? Array.from(doc.head.children) : [];
            const metaTags = headElements.filter(el => el.tagName === 'META');
            const linkTags = headElements.filter(el => el.tagName === 'LINK');

            // Procesar el body completo conservando estructura
            const bodyContent = doc.body ? doc.body.innerHTML : doc.documentElement.innerHTML;

            // Crear CSS específico para elementos bold detectados
            let boldCSS = '';
            boldElements.forEach(className => {
                boldCSS += `.${className} { font-weight: bold !important; }\n`;
            });

            // Crear el HTML final con todos los estilos y estructura preservados
            const renderedHtml = `
                <div class="yoopta-container">
                    <!-- Importar fuentes comunes de email -->
                    <link href="https://fonts.googleapis.com/css2?family=Arial:wght@400;700&family=Helvetica:wght@400;700&family=Times+New+Roman:wght@400;700&family=Georgia:wght@400;700&family=Verdana:wght@400;700&family=Tahoma:wght@400;700&family=Trebuchet+MS:wght@400;700&family=Comic+Sans+MS:wght@400;700&family=Impact:wght@400;700&family=Lucida+Console:wght@400;700&family=Courier+New:wght@400;700" rel="stylesheet">
                    
                    <!-- Inyectar estilos originales primero (máxima prioridad) -->
                    <style>
                        /* Importar fuentes adicionales para asegurar disponibilidad */
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Montserrat:wght@400;500;600;700&family=Lato:wght@400;700&family=Source+Sans+Pro:wght@400;600;700&family=Nunito:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap');
                        
                        /* Estilos originales de la plantilla - MÁXIMA PRIORIDAD */
                        ${allStyles}
                    </style>
                    
                    <!-- Estilos específicos para elementos bold detectados -->
                    <style>
                        ${boldCSS}
                    </style>
                    
                    <!-- Estilos de corrección específicos -->
                    <style>
                        /* Contenedor principal - estilos mínimos */
                        .yoopta-container {
                            width: 100%;
                            margin: 0 auto;
                            background: white;
                            position: relative;
                            font-synthesis: none;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        
                        /* Contenedor de contenido */
                        .yoopta-content-wrapper {
                            width: 100%;
                        }
                        
                        /* Forzar negrita en elementos específicos detectados */
                        .yoopta-container strong,
                        .yoopta-container b,
                        .yoopta-container h1,
                        .yoopta-container h2,
                        .yoopta-container h3,
                        .yoopta-container h4,
                        .yoopta-container h5,
                        .yoopta-container h6,
                        .yoopta-container [style*="font-weight: bold"],
                        .yoopta-container [style*="font-weight:bold"],
                        .yoopta-container [style*="font-weight: 700"],
                        .yoopta-container [style*="font-weight:700"],
                        .yoopta-container [style*="font-weight: 600"],
                        .yoopta-container [style*="font-weight:600"] {
                            font-weight: bold !important;
                        }
                        
                        /* Asegurar que elementos normales no tengan negrita */
                        .yoopta-container [style*="font-weight: normal"],
                        .yoopta-container [style*="font-weight:normal"],
                        .yoopta-container [style*="font-weight: 400"],
                        .yoopta-container [style*="font-weight:400"] {
                            font-weight: normal !important;
                        }
                        
                        /* Corrección específica para botones - centrado vertical */
                        .yoopta-container table[role="presentation"] td[style*="background"],
                        .yoopta-container td[style*="background-color"],
                        .yoopta-container a[style*="background"],
                        .yoopta-container div[style*="background"][style*="text-align"],
                        .yoopta-container [style*="border-radius"][style*="background"],
                        .yoopta-container [href][style*="background-color"],
                        .yoopta-container [style*="padding"][style*="background-color"][style*="text-align"] {
                            vertical-align: middle !important;
                            line-height: 1.2 !important;
                            display: table-cell !important;
                        }
                        
                        /* Asegurar que el texto dentro de botones esté centrado */
                        .yoopta-container a[style*="background-color"],
                        .yoopta-container div[style*="background-color"][style*="text-align"],
                        .yoopta-container span[style*="background-color"] {
                            display: inline-block !important;
                            vertical-align: middle !important;
                            line-height: normal !important;
                        }
                        
                        /* Preservar fuentes específicas */
                        .yoopta-container [style*="font-family"] {
                            font-family: inherit !important;
                        }

                        /* Preservar fuente Inter específicamente */
                        .yoopta-container [style*="font-family: inter"],
                        .yoopta-container [style*="font-family:inter"] {
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                        }

                        /* Asegurar que sans-serif se aplique correctamente */
                        .yoopta-container [style*="sans-serif"],
                        .yoopta-container [style*="Arial"],
                        .yoopta-container [style*="Helvetica"] {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif !important;
                        }
                                                
                        /* Preservar imágenes exactamente como vienen */
                        .yoopta-container img {
                            max-width: none !important;
                            height: auto;
                        }
                        
                        /* Tablas - preservar estructura */
                        .yoopta-container table {
                            border-collapse: separate;
                            border-spacing: 0;
                        }
                        
                        /* Responsive básico solo para el contenedor */
                        @media (max-width: 600px) {
                            .yoopta-container {
                                width: 100%;
                            }
                            
                            .yoopta-container img {
                                max-width: 100% !important;
                                width: auto !important;
                            }
                        }
                        
                        /* Reset mínimo para evitar conflictos */
                        .yoopta-container * {
                            box-sizing: border-box;
                        }
                        
                        /* Mejorar renderizado de fuentes */
                        .yoopta-container {
                            text-rendering: optimizeLegibility;
                            -webkit-font-feature-settings: "kern" 1;
                            font-feature-settings: "kern" 1;
                        }
                    </style>
                    
                    <!-- Contenido original preservado al 100% -->
                    <div class="yoopta-content-wrapper">
                        ${bodyContent}
                    </div>
                </div>
            `;

            return {
                success: true,
                error: null,
                content: renderedHtml,
                debugInfo: {
                    method: 'yoopta-direct-render-with-bold-detection',
                    stylesExtracted: allStyles.length,
                    originalLength: cleanHtml.length,
                    finalLength: renderedHtml.length,
                    usesIframe: false,
                    preservesCSS: true,
                    metaTagsCount: metaTags.length,
                    linkTagsCount: linkTags.length,
                    boldElementsDetected: boldElements.length,
                    boldElements: boldElements
                }
            };

        } catch (error) {
            console.error('❌ Error en Template Renderer:', error);

            return {
                success: false,
                error: error.message,
                content: null,
                debugInfo: {
                    error: error.message,
                    errorType: error.constructor.name
                }
            };
        }
    }, [htmlContent]);

    if (!processedContent.success) {
        return (
            <div className="p-6 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-red-800 font-medium mb-2">❌ Error en Yoopta Renderer</h3>
                    <p className="text-red-600 text-sm mb-4">{processedContent.error}</p>

                    <button
                        onClick={() => setDebugMode(!debugMode)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                        {debugMode ? 'Ocultar' : 'Mostrar'} Debug
                    </button>

                    {debugMode && processedContent.debugInfo && (
                        <div className="mt-4 text-left">
                            <div className="bg-white border border-red-200 rounded p-4">
                                <h4 className="text-sm font-medium text-red-700 mb-3">Información de Debug:</h4>
                                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto text-gray-700 max-h-32">
                                    {JSON.stringify(processedContent.debugInfo, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white">
            {/* Contenido renderizado DIRECTAMENTE (sin iframe) - Estilos 100% preservados */}
            <div
                className="yoopta-direct-render"
                dangerouslySetInnerHTML={{ __html: processedContent.content }}
                style={{
                    minHeight: '400px',
                    width: '100%',
                    overflow: 'visible',
                    background: 'white',
                    isolation: 'isolate'
                }}
            />

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100">
            </div>
        </div>
    );
}