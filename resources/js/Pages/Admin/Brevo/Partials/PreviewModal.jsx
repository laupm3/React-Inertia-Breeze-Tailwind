import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import TemplateRenderer from './TemplateRenderer';

export default function PreviewModal({ isOpen, onClose, htmlContent, templateName }) {
    const [processedHtml, setProcessedHtml] = useState('');

    // Procesar HTML cuando cambie el contenido
    useEffect(() => {
        if (htmlContent) {
            try {
                const cleanHtml = htmlContent
                    .replace(/\\n/g, '\n')
                    .replace(/\\t/g, '\t')
                    .replace(/\\"/g, '"')
                    .replace(/\\/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');
                
                setProcessedHtml(cleanHtml);
            } catch (error) {
                console.error('Error procesando HTML:', error);
                setProcessedHtml('Error al procesar contenido');
            }
        }
    }, [htmlContent]);

    // Cerrar modal con tecla ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Preview de plantilla: {templateName}
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Cerrar modal"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white overflow-hidden">
                        <TemplateRenderer htmlContent={htmlContent} />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">

                    </div>
                </div>
            </div>
        </div>
    );
}
