import React, { memo, useMemo } from 'react';

// Importar iconos SVG como componentes React
import DefaultIcon from './Icons/default.svg';
import UnknownIcon from './Icons/unknown.svg';

// Archivos comprimidos
import ZipIcon from './Icons/Archivos comprimidos/zip.svg';
import RarIcon from './Icons/Archivos comprimidos/rar.svg';
import SevenZIcon from './Icons/Archivos comprimidos/7z.svg';
import TarIcon from './Icons/Archivos comprimidos/tar.svg';
import GzIcon from './Icons/Archivos comprimidos/gz.svg';

// Audio
import Mp3Icon from './Icons/Audio/mp3.svg';
import WavIcon from './Icons/Audio/wav.svg';
import FlacIcon from './Icons/Audio/flac.svg';

// Código
import JsIcon from './Icons/Código/js.svg';
import TsIcon from './Icons/Código/ts.svg';
import JsxIcon from './Icons/Código/jsx.svg';
import TsxIcon from './Icons/Código/tsx.svg';
import PyIcon from './Icons/Código/py.svg';
import JavaIcon from './Icons/Código/java.svg';
import CppIcon from './Icons/Código/cpp.svg';
import CssIcon from './Icons/Código/css.svg';
import HtmlIcon from './Icons/Código/html.svg';
import PhpIcon from './Icons/Código/php.svg';

// Documentos de texto
import PdfIcon from './Icons/Documentos de texto/pdf.svg';
import DocIcon from './Icons/Documentos de texto/doc.svg';
import DocxIcon from './Icons/Documentos de texto/docx.svg';
import TxtIcon from './Icons/Documentos de texto/txt.svg';
import RtfIcon from './Icons/Documentos de texto/rtf.svg';
import MdIcon from './Icons/Documentos de texto/md.svg';
import WordIcon from './Icons/Documentos de texto/word.svg';

// Hojas de cálculo
import XlsIcon from './Icons/Hoja de cálculos/xls.svg';
import XlsxIcon from './Icons/Hoja de cálculos/xlsx.svg';
import CsvIcon from './Icons/Hoja de cálculos/csv.svg';
import ExcelIcon from './Icons/Hoja de cálculos/excel.svg';

// Imágenes
import PngIcon from './Icons/Imágenes/png.svg';
import JpgIcon from './Icons/Imágenes/jpg.svg';
import JpegIcon from './Icons/Imágenes/jpeg.svg';
import GifIcon from './Icons/Imágenes/gif.svg';
import WebpIcon from './Icons/Imágenes/webp.svg';
import SvgIcon from './Icons/Imágenes/svg.svg';
import IcoIcon from './Icons/Imágenes/ico.svg';

// Presentaciones
import PptIcon from './Icons/Presentaciones/ppt.svg';
import PptxIcon from './Icons/Presentaciones/pptx.svg';

/**
 * Mapeo de extensiones de archivo a componentes de iconos SVG
 * Solo incluye extensiones que tienen iconos SVG correspondientes
 */
const FILE_TYPE_CONFIG = {
    // Documentos PDF
    pdf: { icon: PdfIcon, label: 'PDF' },
    
    // Archivos comprimidos
    zip: { icon: ZipIcon, label: 'ZIP' },
    rar: { icon: RarIcon, label: 'RAR' },
    '7z': { icon: SevenZIcon, label: '7Z' },
    tar: { icon: TarIcon, label: 'TAR' },
    gz: { icon: GzIcon, label: 'GZ' },
    
    // Hojas de cálculo
    xls: { icon: XlsIcon, label: 'XLS' },
    xlsx: { icon: XlsxIcon, label: 'XLSX' },
    csv: { icon: CsvIcon, label: 'CSV' },
    excel: { icon: ExcelIcon, label: 'EXCEL' },
    
    // Imágenes
    png: { icon: PngIcon, label: 'PNG' },
    jpg: { icon: JpgIcon, label: 'JPG' },
    jpeg: { icon: JpegIcon, label: 'JPEG' },
    gif: { icon: GifIcon, label: 'GIF' },
    webp: { icon: WebpIcon, label: 'WEBP' },
    svg: { icon: SvgIcon, label: 'SVG' },
    ico: { icon: IcoIcon, label: 'ICO' },
    
    // Documentos de texto
    doc: { icon: DocIcon, label: 'DOC' },
    docx: { icon: DocxIcon, label: 'DOCX' },
    txt: { icon: TxtIcon, label: 'TXT' },
    rtf: { icon: RtfIcon, label: 'RTF' },
    md: { icon: MdIcon, label: 'MD' },
    word: { icon: WordIcon, label: 'WORD' },
    
    // Presentaciones
    ppt: { icon: PptIcon, label: 'PPT' },
    pptx: { icon: PptxIcon, label: 'PPTX' },
    
    // Audio
    mp3: { icon: Mp3Icon, label: 'MP3' },
    wav: { icon: WavIcon, label: 'WAV' },
    flac: { icon: FlacIcon, label: 'FLAC' },
    
    // Código
    js: { icon: JsIcon, label: 'JS' },
    ts: { icon: TsIcon, label: 'TS' },
    jsx: { icon: JsxIcon, label: 'JSX' },
    tsx: { icon: TsxIcon, label: 'TSX' },
    py: { icon: PyIcon, label: 'PY' },
    java: { icon: JavaIcon, label: 'JAVA' },
    cpp: { icon: CppIcon, label: 'CPP' },
    css: { icon: CssIcon, label: 'CSS' },
    html: { icon: HtmlIcon, label: 'HTML' },
    php: { icon: PhpIcon, label: 'PHP' },
    
    // Por defecto y desconocido
    default: { icon: DefaultIcon, label: 'FILE' },
    unknown: { icon: UnknownIcon, label: 'UNKNOWN' }
};

/**
 * Componente ExtensionIcon - Muestra iconos SVG personalizados según la extensión del archivo
 * 
 * @param {Object} props - Las propiedades del componente
 * @param {string} props.extension - La extensión del archivo (pdf, zip, doc, etc.)
 * @param {number} props.size - El tamaño del icono en píxeles (por defecto 48)
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.alt - Texto alternativo para accesibilidad
 * @param {Object} props.style - Estilos CSS adicionales
 * 
 * @returns {JSX.Element} El componente ExtensionIcon
 */
const ExtensionIcon = memo(function ExtensionIcon({ 
    extension, 
    size = 48, 
    className = "",
    alt = "",
    style = {},
    ...props
}) {
    // Normalizar la extensión y obtener configuración
    const fileConfig = useMemo(() => {
        const normalizedExtension = extension?.toLowerCase()?.replace(/^\./, '') || '';
        return FILE_TYPE_CONFIG[normalizedExtension] || FILE_TYPE_CONFIG.default;
    }, [extension]);

    // Generar el alt text si no se proporciona
    const altText = useMemo(() => {
        if (alt) return alt;
        return `Icono de archivo ${fileConfig.label}`;
    }, [alt, fileConfig.label]);

    // Obtener el componente de icono
    const IconComponent = fileConfig.icon;

    // Combinar estilos
    const combinedStyle = useMemo(() => ({
        width: size,
        height: size,
        display: 'block',
        ...style
    }), [size, style]);

    // Renderizar el componente SVG
    return (
        <IconComponent
            width={size}
            height={size}
            className={className}
            style={combinedStyle}
            title={altText}
            role="img"
            aria-label={altText}
            {...props}
        />
    );
});

ExtensionIcon.displayName = 'ExtensionIcon';

export default ExtensionIcon;
