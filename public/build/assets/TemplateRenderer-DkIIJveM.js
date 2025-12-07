import{r as f,j as o}from"./app-fwyInB3c.js";function M({htmlContent:c}){const[d,u]=f.useState(!1),i=f.useMemo(()=>{if(!c)return{success:!1,error:"No hay contenido HTML para procesar",content:null};try{console.log("🚀 Template Renderer - Renderizado directo optimizado...");let n=c;n.includes("\\")&&(n=n.replace(/\\n/g,`
`).replace(/\\t/g,"	").replace(/\\"/g,'"').replace(/\\\\/g,"\\"));const a=new DOMParser().parseFromString(n,"text/html"),b=a.querySelectorAll("style");let l="";b.forEach(e=>{l+=e.textContent||e.innerHTML});const r=[];a.querySelectorAll("strong, b").forEach((e,s)=>{const t=`brevo-bold-${s}`;e.classList.add(t),r.push(t)}),a.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((e,s)=>{const t=`brevo-heading-${s}`;e.classList.add(t),r.push(t)}),a.querySelectorAll('[style*="font-weight"]').forEach((e,s)=>{const t=e.getAttribute("style")||"";if(t.includes("font-weight: bold")||t.includes("font-weight:bold")||t.includes("font-weight: 700")||t.includes("font-weight:700")||t.includes("font-weight: 600")||t.includes("font-weight:600")){const h=`brevo-weight-bold-${s}`;e.classList.add(h),r.push(h)}});const m=l.match(/[^{}]+\{[^{}]*font-weight\s*:\s*(bold|700|600)[^{}]*\}/gi);m&&m.forEach((e,s)=>{const t=`brevo-css-bold-${s}`;r.push(t)});const p=a.head?Array.from(a.head.children):[],w=p.filter(e=>e.tagName==="META"),x=p.filter(e=>e.tagName==="LINK"),v=a.body?a.body.innerHTML:a.documentElement.innerHTML;let g="";r.forEach(e=>{g+=`.${e} { font-weight: bold !important; }
`});const y=`
                <div class="yoopta-container">
                    <!-- Importar fuentes comunes de email -->
                    <link href="https://fonts.googleapis.com/css2?family=Arial:wght@400;700&family=Helvetica:wght@400;700&family=Times+New+Roman:wght@400;700&family=Georgia:wght@400;700&family=Verdana:wght@400;700&family=Tahoma:wght@400;700&family=Trebuchet+MS:wght@400;700&family=Comic+Sans+MS:wght@400;700&family=Impact:wght@400;700&family=Lucida+Console:wght@400;700&family=Courier+New:wght@400;700" rel="stylesheet">
                    
                    <!-- Inyectar estilos originales primero (máxima prioridad) -->
                    <style>
                        /* Importar fuentes adicionales para asegurar disponibilidad */
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Montserrat:wght@400;500;600;700&family=Lato:wght@400;700&family=Source+Sans+Pro:wght@400;600;700&family=Nunito:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap');
                        
                        /* Estilos originales de la plantilla - MÁXIMA PRIORIDAD */
                        ${l}
                    </style>
                    
                    <!-- Estilos específicos para elementos bold detectados -->
                    <style>
                        ${g}
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
                        ${v}
                    </div>
                </div>
            `;return{success:!0,error:null,content:y,debugInfo:{method:"yoopta-direct-render-with-bold-detection",stylesExtracted:l.length,originalLength:n.length,finalLength:y.length,usesIframe:!1,preservesCSS:!0,metaTagsCount:w.length,linkTagsCount:x.length,boldElementsDetected:r.length,boldElements:r}}}catch(n){return console.error("❌ Error en Template Renderer:",n),{success:!1,error:n.message,content:null,debugInfo:{error:n.message,errorType:n.constructor.name}}}},[c]);return i.success?o.jsxs("div",{className:"w-full bg-white",children:[o.jsx("div",{className:"yoopta-direct-render",dangerouslySetInnerHTML:{__html:i.content},style:{minHeight:"400px",width:"100%",overflow:"visible",background:"white",isolation:"isolate"}}),o.jsx("div",{className:"mt-6 pt-4 border-t border-gray-100"})]}):o.jsx("div",{className:"p-6 text-center",children:o.jsxs("div",{className:"bg-red-50 border border-red-200 rounded-lg p-6",children:[o.jsx("h3",{className:"text-red-800 font-medium mb-2",children:"❌ Error en Yoopta Renderer"}),o.jsx("p",{className:"text-red-600 text-sm mb-4",children:i.error}),o.jsxs("button",{onClick:()=>u(!d),className:"px-4 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors",children:[d?"Ocultar":"Mostrar"," Debug"]}),d&&i.debugInfo&&o.jsx("div",{className:"mt-4 text-left",children:o.jsxs("div",{className:"bg-white border border-red-200 rounded p-4",children:[o.jsx("h4",{className:"text-sm font-medium text-red-700 mb-3",children:"Información de Debug:"}),o.jsx("pre",{className:"text-xs bg-gray-50 p-3 rounded overflow-auto text-gray-700 max-h-32",children:JSON.stringify(i.debugInfo,null,2)})]})})]})})}export{M as default};
