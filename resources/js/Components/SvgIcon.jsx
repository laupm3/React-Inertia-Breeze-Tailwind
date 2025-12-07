import { useState, useEffect } from 'react';

// Componente SvgIcon que recibe el nombre del icono como prop
export default function SvgIcon({ name, alt = name, ...props }) {

    const [Svg, setSvg] = useState(null);

    useEffect(() => {
        // Función que carga dinámicamente el SVG basado en el nombre
        const loadSvg = async () => {

            try {
                // Importación dinámica utilizando Vite
                const importedSvg = await import(`../../images/icons/${name}.svg?component`);

                setSvg(importedSvg.default); // Vite devuelve el path del SVG en 'default'
            } catch (error) {
                console.error(`Error al cargar el icono ${name}:`, error);
            }
        };

        if (name) {
            loadSvg();
        }
    }, [name]);

    // Si el SVG aún no ha sido cargado, mostramos un placeholder o null
    if (!Svg) {
        return null;
    }

    // Retorna el SVG con cualquier prop adicional que se pase
    return <img src={Svg} alt={`${alt} icon`} {...props} />;
};