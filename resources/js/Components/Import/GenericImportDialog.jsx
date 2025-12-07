import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { Button } from "@/Components/ui/button";
import Icon from "@/imports/LucideIcon";
import { useDropzone } from 'react-dropzone';
// Importar utilidades optimizadas
import {
    validateEmail,
    validatePhone,
    validateDate,
    validateDDMMYYYY,
    normalizeDate as normalizeDateUtil,
    formatCellValue as formatCellValueUtil,
    getDynamicFieldMapping,
    clearFieldMappingCache
} from '@/utils/validationUtils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/Components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { Input } from "@/Components/ui/input";
import axios from 'axios';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { Checkbox } from "@/Components/ui/checkbox";
import {
    handleImportResponse,
    handleImportError,
    processValidationErrors,
    showImportErrorsInToast
} from '@/utils/errorUtils';
import { usePermissions } from "@/hooks/usePermissions";
import { normalizaFecha as normalizaFechaRobusta } from '@/Pages/Admin/Empleados/Components/ExcelUpload/utils/datesUtils';

/**
 * Componente genérico para importación de cualquier entidad
 * 
 * @param {Object} props
 * @param {string} props.entity - Nombre de la entidad (ej: 'empleados', 'usuarios', 'empresas')
 * @param {string} props.entityDisplayName - Nombre para mostrar de la entidad (ej: 'Empleados', 'Usuarios')
 * @param {boolean} props.isOpen - Si el diálogo está abierto
 * @param {Function} props.onOpenChange - Función para cambiar el estado del diálogo
 * @param {Function} props.onImportSuccess - Callback cuando la importación es exitosa
 * @param {Function} props.onImportError - Callback cuando hay errores (opcional)
 * @param {Object} props.validationOptions - Opciones de validación específicas (opcional)
 * @param {boolean} props.canImport - Si el usuario puede importar (opcional, se verifica internamente si no se proporciona)
 * @param {boolean} props.canExport - Si el usuario puede exportar (opcional, se verifica internamente si no se proporciona)
 * @param {boolean} props.loadingPerms - Si se están cargando los permisos (opcional)
 */
export default function GenericImportDialog({
    entity,
    entityDisplayName,
    isOpen,
    onOpenChange,
    onImportSuccess,
    onImportError,
    validationOptions = {},
    canImport: propCanImport,
    canExport: propCanExport,
    loadingPerms: propLoadingPerms
}) {
    const [previewData, setPreviewData] = useState([]);
    const [errores, setErrores] = useState([]);
    const [duplicados, setDuplicados] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [schema, setSchema] = useState(null);
    //const [templateData, setTemplateData] = useState(null);
    const fileInputRef = useRef(null);
    //const [activeTab, setActiveTab] = useState("formato");
    const [isFormatDialogOpen, setIsFormatDialogOpen] = useState(false);
    const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
    //const [showErrors, setShowErrors] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [erroresBD, setErroresBD] = useState([]);
    const [fieldErrors, setFieldErrors] = useState([]); // Para errores específicos de campos del servidor
    const [currentStep, setCurrentStep] = useState(0); // Para controlar el paso actual del proceso

    // Usar permisos proporcionados como props o verificar internamente como fallback
    const shouldCheckPermissions = propCanImport === undefined || propCanExport === undefined || propLoadingPerms === undefined;
    const internalPermissions = usePermissions(shouldCheckPermissions ? entity : null);

    const canImport = propCanImport !== undefined ? propCanImport : internalPermissions.canImport;
    const canExport = propCanExport !== undefined ? propCanExport : internalPermissions.canExport;
    const loadingPerms = propLoadingPerms !== undefined ? propLoadingPerms : internalPermissions.loading;

    // Usar funciones optimizadas de las utilidades
    const formatCellValue = formatCellValueUtil;
    const normalizeDate = normalizeDateUtil;
    const isValidDDMMYYYY = validateDDMMYYYY;
    const isValidEmail = validateEmail;
    const isValidPhone = validatePhone;
    const isValidDate = validateDate;

    // Función genérica para procesar datos de Excel (memoizada)
    const processExcelData = useCallback((workbook, fileType) => {
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
            throw new Error('El archivo debe tener al menos encabezados y una fila de datos');
        }

        const headers = jsonData[0];
        const dataRows = jsonData.slice(1);

        return dataRows
            .filter(row => row.some(cell => cell && cell.toString().trim() !== ''))
            .map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            });
    }, []);

    // Función para normalizar fechas (específica para empleados) - memoizada
    const normalizaFecha = useCallback((fecha) => {
        if (!fecha) return fecha;

        const str = fecha.toString().trim();

        // Si ya está en formato YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

        // Convertir DD/MM/YYYY o DD-MM-YYYY a YYYY-MM-DD
        let match = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
        if (match) {
            return `${match[3]}-${match[2]}-${match[1]}`;
        }

        // Si es string ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
        if (/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(.\\d+)?Z$/.test(str)) {
            // Extrae solo la parte de la fecha
            return str.slice(0, 10);
        }

        // Si es string tipo dd-mm-yy o dd/mm/yy (año 2 dígitos)
        match = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{2})$/);
        if (match) {
            let dd = parseInt(match[1], 10);
            let mm = parseInt(match[2], 10);
            let yy = parseInt(match[3], 10);
            // Asume años 00-69 como 2000-2069, 70-99 como 1970-1999 (puedes ajustar)
            let yyyy = yy < 70 ? 2000 + yy : 1900 + yy;
            if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
                return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
            }
        }

        // Si es string vacío, guiones, o "-  -", tratar como vacío
        if (!str || str === '-  -' || str === '--' || str === '  -  ') return '';

        return str;
    }, []);

    // Función para obtener el mapeo dinámico de campos basado en el esquema del backend (optimizada con cache)
    const getDynamicFieldMappingMemo = useCallback(() => {
        return getDynamicFieldMapping(schema, entity);
    }, [schema, entity]);

    // Función para normalizar datos usando el esquema dinámico (memoizada)
    const normalizeRowData = useCallback((row) => {
        // Para empleados, NO normalizar - mantener las etiquetas exactas del Excel ya que el backend las espera así
        if (entity === 'empleados') {
            // Para empleados, devolver el row tal como está - el backend espera las etiquetas originales del Excel
            return { ...row };
        }

        // Para otras entidades, usar el mapeo dinámico basado en esquema
        if (!schema || !schema.fields) {
            console.warn('No se pudo normalizar: esquema no disponible para', entity);
            return row;
        }

        const mapping = getDynamicFieldMappingMemo();
        const normalizedRow = {};

        Object.keys(row).forEach(key => {
            const value = row[key];

            // Intentar mapear usando diferentes variaciones del key
            let mappedKey = null;

            // 1. Buscar mapeo exacto
            if (mapping[key]) {
                mappedKey = mapping[key];
            }
            // 2. Buscar mapeo por lowercase
            else if (mapping[key.toLowerCase()]) {
                mappedKey = mapping[key.toLowerCase()];
            }
            // 3. Buscar mapeo sin (*) y lowercase
            else if (mapping[key.replace(/\s*\(\*\)\s*$/, '').toLowerCase().trim()]) {
                mappedKey = mapping[key.replace(/\s*\(\*\)\s*$/, '').toLowerCase().trim()];
            }

            if (mappedKey) {
                normalizedRow[mappedKey] = value;
            } else {
                console.warn(`Campo no mapeado para ${entity}: ${key} -> usando clave original`);
                normalizedRow[key] = value;
            }
        });

        return normalizedRow;
    }, [entity, schema, getDynamicFieldMappingMemo]);

    // Función para validar datos dinámicamente basada en el esquema (memoizada)
    const validateDataWithSchema = useCallback((data) => {
        if (!schema || !schema.fields) {
            console.warn('No se pudo validar: esquema no disponible');
            return { errores: [], duplicados: {} };
        }

        const errores = [];
        const duplicados = {};
        const duplicateTracker = {};

        // Inicializar tracker de duplicados para campos únicos
        schema.fields.forEach(field => {
            if (field.unique || field.name === 'email' || field.name === 'nif' || field.name === 'niss') {
                duplicateTracker[field.name] = new Set();
            }
        });

        data.forEach((row, index) => {
            const rowErrors = [];

            // Para empleados, usar validación específica con etiquetas del Excel
            if (entity === 'empleados') {
                // No normalizar, usar las etiquetas originales que espera el backend
                const requiredFields = [
                    'Nombre (*)', 'Primer Apellido (*)',
                    'Fecha Nacimiento (*)', 'Género (*)', 'Tipo de Documento (*)',
                    'Nº Documento (*)', 'NISS (*)', 'Email (*)', 'Teléfono (*)',
                    'Dirección (*)', 'Tipo Empleado (*)', 'Estado Empleado (*)'
                ];

                requiredFields.forEach(field => {
                    if (!row[field] || row[field].toString().trim() === '') {
                        rowErrors.push(`Campo requerido: ${field}`);
                    }
                });

                // Validar email
                if (row['Email (*)'] && !isValidEmail(row['Email (*)'])) {
                    rowErrors.push('Email inválido');
                }

                // Validar teléfono
                if (row['Teléfono (*)'] && !isValidPhone(row['Teléfono (*)'])) {
                    rowErrors.push('Teléfono inválido');
                }

                // Validar fecha
                if (row['Fecha Nacimiento (*)'] && row['Fecha Nacimiento (*)'] === 'FECHA INVÁLIDA') {
                    rowErrors.push('Fecha inválida');
                }
            } else {
                // Para otras entidades, solo validar formato (NO obligatoriedad)
                const normalizedRow = normalizeRowData(row);

                // Validar cada campo según el esquema - SOLO FORMATO
                schema.fields.forEach(field => {
                    const value = normalizedRow[field.name] || row[field.label];
                    const fieldLabel = field.label;

                    // Si no hay valor, NO validar (solo el servidor puede determinar si es requerido)
                    if (!value || value.toString().trim() === '') {
                        return;
                    }

                    // Validar solo formato cuando hay valor
                    let hasFormatError = false; //
                    switch (field.type) {
                        case 'email':
                            if (!isValidEmail(value)) {
                                hasFormatError = true;
                            }
                            break;
                        case 'date':
                            const fechaNormalizada = normalizaFechaRobusta(value);
                            // Si está vacío y NO es requerido, no marcar error
                            if (
                                (!fechaNormalizada || fechaNormalizada === '') &&
                                field && !field.required
                            ) {
                                hasFormatError = false;
                                break;
                            }
                            // Si está vacío y es requerido, marcar error
                            if (
                                (!fechaNormalizada || fechaNormalizada === '') &&
                                field && field.required
                            ) {
                                hasFormatError = true;
                                break;
                            }
                            // Si no es válida, marcar error
                            if (
                                fechaNormalizada === 'FECHA INVÁLIDA' ||
                                !/^\d{4}-\d{2}-\d{2}$/.test(fechaNormalizada)
                            ) {
                                hasFormatError = true;
                            }
                            break;
                        case 'select':
                            if (field.options && value != null) {
                                const valueStr = value.toString();
                                const optionsStr = field.options.map(opt => opt.toString());
                                hasFormatError = !optionsStr.includes(valueStr);
                            }
                            break;
                        case 'string':
                            if (field.max_length && value && typeof value === 'string' && value.length > field.max_length) {
                                hasFormatError = true;
                            }
                            if (field.min_length && value && typeof value === 'string' && value.length < field.min_length) {
                                hasFormatError = true;
                            }
                            break;
                    }

                    if (hasFormatError) {
                        if (field.type === 'date') {
                            rowErrors.push(`Fecha inválida en ${fieldLabel}`);
                        } else if (field.type === 'email') {
                            rowErrors.push(`Email inválido en ${fieldLabel}`);
                        } else if (field.type === 'select') {
                            rowErrors.push(`Valor inválido en ${fieldLabel}. Debe ser uno de estos: ${field.options.join(', ')}`);
                        } else if (field.type === 'string') {
                            rowErrors.push(`${fieldLabel} no cumple con la longitud requerida`);
                        }
                    }

                    // Verificar duplicados
                    if (duplicateTracker[field.name]) {
                        if (duplicateTracker[field.name].has(value)) {
                            if (!duplicados[fieldLabel]) {
                                duplicados[fieldLabel] = [];
                            }
                            duplicados[fieldLabel].push(value);
                        } else {
                            duplicateTracker[field.name].add(value);
                        }
                    }
                });
            }

            if (rowErrors.length > 0) {
                errores.push({ row: index + 1, errors: rowErrors });
            }
        });

        return { errores, duplicados };
    }, [schema, entity, isValidEmail, isValidPhone, isValidDate, normalizeRowData]); // Dependencias memoizadas

    // Optimizar handleFileUpload - función crítica para procesar archivos
    const handleFileUpload = useCallback(async (fileOrEvent) => {
        try {
            let file = fileOrEvent;
            if (fileOrEvent?.target?.files) {
                file = fileOrEvent.target.files[0];
            } else if (fileOrEvent instanceof File) {
                file = fileOrEvent;
            }
            if (!file) throw new Error('No se proporcionó ningún archivo');

            // NUEVO: Limpiar errores del archivo anterior antes de procesar el nuevo
            setErrores([]);
            setDuplicados({});
            setErroresBD([]);
            setFieldErrors([]);

            setIsLoading(true);

            const data = await file.arrayBuffer();
            const fileType = file.name.endsWith('.csv') ? 'csv' : 'xlsx';
            const workbook = XLSX.read(data, { type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd' });

            // Procesar datos del Excel usando la función genérica
            const jsonData = processExcelData(workbook, fileType);

            // Aplicar validaciones dinámicas basadas en el esquema
            let processedData = jsonData;

            if (entity === 'empleados') {
                // Para empleados, mantener la lógica específica de fechas y usuarios
                processedData = jsonData
                    .map(row => {
                        let fechaOriginal = row['Fecha Nacimiento (*)'];
                        console.log('Fecha Nacimiento original:', JSON.stringify(fechaOriginal));
                        let fechaNormalizada = normalizaFechaRobusta(fechaOriginal);
                        console.log('Fecha Nacimiento normalizada:', JSON.stringify(fechaNormalizada));
                        // Buscar el campo de generar usuario con diferentes variaciones
                        let generarUsuario = row["Generar Usuario (*)"] || row["Generar Usuario"] || "No";
                        return {
                            ...row,
                            'Fecha Nacimiento (*)': fechaNormalizada,
                            fechaNacimientoOriginal: fechaOriginal,
                            checked: (generarUsuario?.toString().toLowerCase() === "sí" ||
                                generarUsuario?.toString().toLowerCase() === "yes" ||
                                generarUsuario?.toString().toLowerCase() === "true" ||
                                generarUsuario?.toString().toLowerCase() === "verdadero"),
                            'Segundo Apellido (*)': row['Segundo Apellido (*)'] || row['Segundo Apellido'] || ''
                        };
                    })
                    .filter(row => {
                        const keys = Object.keys(row).filter(k => k !== 'checked' && k !== 'fechaNacimientoOriginal');
                        return keys.some(k => row[k] && row[k].toString().trim() !== '' && row[k].toString().toLowerCase() !== 'falso');
                    });
            } else {
                // Para otras entidades, solo filtrar filas vacías
                processedData = jsonData.filter(row => {
                    return Object.values(row).some(value => value && value.toString().trim() !== '');
                });
            }

            // Aplicar validación dinámica basada en el esquema
            if (schema && schema.fields) {
                const validationResult = validateDataWithSchema(processedData);
                setErrores(validationResult.errores || []);
                setDuplicados(validationResult.duplicados || {});

                if (validationResult.errores?.length > 0) {
                    toast.warning('Se encontraron errores en los datos. Por favor, revise los errores señalados.');
                }
            }

            setPreviewData(processedData);
            toast.success('Archivo procesado correctamente');
        } catch (error) {
            console.error('Error al procesar el archivo:', error);
            toast.error(error.message || 'Error al procesar el archivo');
            setPreviewData([]);
            setErrores([]);
            setDuplicados({});
            setFieldErrors([]); // Limpiar errores de campos del servidor
        } finally {
            setIsLoading(false);
        }
    }, [entity, schema, processExcelData, normalizaFechaRobusta, validateDataWithSchema]); // Dependencias optimizadas

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1,

        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                try {
                    await handleFileUpload(acceptedFiles[0]);
                } catch (error) {
                    console.error('Error en el drop:', error);
                    toast.error(error.message || 'Error al procesar el archivo');
                }
            }
        },
        onDropRejected: (fileRejections) => {
            const error = fileRejections[0]?.errors[0]?.message || 'Archivo no válido';
            toast.error(`Error: ${error}`);
        }
    });

    useEffect(() => {
        if (fileInputRef.current) {
            fileInputRef.current.onchange = (event) => {
                try {
                    handleFileUpload(event);
                } catch (error) {
                    console.error('Error en input file:', error);
                    toast.error(error.message || 'Error al procesar el archivo');
                }
            };
        }
    }, []);

    useEffect(() => {
        if (isOpen && !schema) {
            fetchSchema();
        }
    }, [isOpen, entity]);

    // NUEVO: Solo limpiar estado cuando se complete una importación exitosa o se cambie de entidad
    // Ya no limpiamos automáticamente cuando se cierra el modal para preservar el estado
    const clearImportState = useCallback(() => {
        setPreviewData([]);
        setErrores([]);
        setDuplicados([]);
        setErroresBD([]);
        setFieldErrors([]);
        setIsLoading(false);
        setCurrentStep(0);
        setIsErrorDialogOpen(false);
        setIsGuideDialogOpen(false);
        setIsFormatDialogOpen(false);
    }, []);

    // Función para limpiar estado manualmente (para botón "Nuevo archivo")
    const handleNewFile = useCallback(() => {
        clearImportState();
        // Limpiar también el input file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [clearImportState]);

    // Eliminar dependencia específica de catálogos de empleados - ahora todo es dinámico
    useEffect(() => {
        // Limpiar estado al cambiar de entidad
        clearImportState();
        setSchema(null);
    }, [entity, clearImportState]);

    // Cache de esquemas para evitar llamadas repetidas al servidor
    const [schemaCache, setSchemaCache] = useState({});

    // Optimizar fetchSchema para evitar llamadas innecesarias con cache
    const fetchSchema = useCallback(async () => {
        // Si ya tenemos el schema en cache, usarlo
        if (schemaCache[entity]) {
            setSchema(schemaCache[entity]);
            return;
        }

        try {
            const response = await axios.get(`/api/v1/admin/import/${entity}/schema`);
            const schemaData = response.data;

            // Guardar en cache
            setSchemaCache(prev => ({
                ...prev,
                [entity]: schemaData
            }));

            setSchema(schemaData);
        } catch (error) {
            console.error('Error al obtener el esquema:', error);
            toast.error('Error al obtener la estructura de datos');
        } finally {
            console.log('entity >>', entity + 'Esquema obtenido:', schemaCache[entity]);
        }
    }, [entity, schemaCache]); // Solo se recrea cuando cambia la entidad o el cache

    const generarExcel = async () => {
        try {
            setIsLoading(true);

            const response = await axios.get(`/api/v1/admin/import/${entity}/template`, {
                responseType: 'blob',
                params: { format: 'xlsx' }
            });

            // Verificar si la respuesta es un blob (Excel/CSV) o JSON (error)
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/json')) {
                // Es un error, leer como texto
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        console.error('Error detallado:', errorData);
                        toast.error(`Error: ${errorData.message}`);
                    } catch (e) {
                        toast.error(`Error al generar la plantilla de ${entityDisplayName.toLowerCase()}`);
                    }
                };
                reader.readAsText(response.data);
                return;
            }

            // Es un archivo válido, crear descarga
            const blob = new Blob([response.data], {
                type: response.headers['content-type']
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Obtener el nombre del archivo de los headers
            const contentDisposition = response.headers['content-disposition'];
            let filename = `plantilla_${entity}.xlsx`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Limpiar
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`Plantilla de ${entityDisplayName.toLowerCase()} descargada correctamente`);

        } catch (error) {
            console.error('Error al generar el archivo:', error);

            if (error.response?.data) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        console.error('Error detallado:', errorData);
                        toast.error(`Error: ${errorData.message}`);
                    } catch (e) {
                        toast.error(`Error al generar la plantilla de ${entityDisplayName.toLowerCase()}`);
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                toast.error(`Error al generar la plantilla de ${entityDisplayName.toLowerCase()}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Función para obtener sugerencias de campos (memoizada)
    const getFieldSuggestion = useCallback((columnId) => {
        if (!schema || !schema.fields) return null;

        // Buscar por label (que es lo que se usa en la cabecera Excel)
        const field = schema.fields.find(f => f.label === columnId);
        if (!field) return null;

        if (field.type === 'email') return 'Debe ser un email válido.';
        if (field.type === 'date') return 'Debe ser una fecha en formato YYYY-MM-DD o DD/MM/YYYY.';
        if (field.type === 'select' && field.options) return `Debe ser uno de: ${field.options.join(', ')}`;
        if (field.type === 'string') {
            let suggestion = 'Debe ser un texto.';
            if (field.max_length) suggestion += ` Máximo ${field.max_length} caracteres.`;
            if (field.min_length) suggestion += ` Mínimo ${field.min_length} caracteres.`;
            return suggestion;
        }
        if (field.description) return field.description;
        return field.help || null;
    }, [schema]);

    // Helper para obtener el error completo (para el modal de errores)
    const getFullCellError = (rowIdx, columnId) => {
        const rowError = errores.find(e => e.row - 1 === rowIdx);
        if (!rowError) return null;

        // Manejar diferentes estructuras de error
        let errorMessages = [];
        let errorFields = [];

        if (Array.isArray(rowError.errors)) {
            // Formato legacy (array de strings)
            errorMessages = rowError.errors.filter(err => typeof err === 'string');
        } else if (rowError.errors && rowError.errors.messages) {
            // Formato nuevo (objeto con messages y fields)
            errorMessages = Array.isArray(rowError.errors.messages) ?
                rowError.errors.messages.filter(err => typeof err === 'string') : [];
            errorFields = Array.isArray(rowError.errors.fields) ?
                rowError.errors.fields : [];
        }

        // Estrategia 1: Mapeo directo por índice usando fields
        if (errorFields.length > 0 && errorMessages.length > 0) {
            const fieldIndex = errorFields.findIndex(field => {
                // Buscar coincidencia exacta con el field name
                if (field === columnId) return true;

                // Si tenemos schema, intentar mapear field name -> label
                if (schema && schema.fields) {
                    const schemaField = schema.fields.find(f => f.name === field);
                    if (schemaField && schemaField.label === columnId) return true;
                }

                return false;
            });

            if (fieldIndex !== -1 && errorMessages[fieldIndex]) {
                return errorMessages[fieldIndex]; // Retornar mensaje completo
            }
        }

        // Estrategia 2: Buscar error que mencione específicamente el campo (fallback)
        const errorMsg = errorMessages.find(err => {
            if (typeof err !== 'string') return false;
            try {
                return err.includes(columnId);
            } catch (e) {
                console.warn('Error checking error message:', err, e);
                return false;
            }
        });

        return errorMsg || null; // Retornar mensaje completo
    };

    // Helper para obtener el error concreto de la celda (VERSION ACORTADA)
    const getCellError = (rowIdx, columnId) => {
        const fullError = getFullCellError(rowIdx, columnId);
        return fullError ? shortenErrorMessage(fullError, columnId) : null;
    };

    // Helper para acortar mensajes de error largos en las celdas
    const shortenErrorMessage = (message, columnId) => {
        // Para Tipo Contrato específicamente
        if (columnId === 'Tipo Contrato (*)' || columnId === 'tipo_contrato_nombre') {
            if (message.includes('No se encontró un tipo de contrato con la clave') ||
                message.includes('Claves disponibles:')) {
                return 'Clave de tipo de contrato inválida';
            }
        }

        // Para campos de tipo select con muchas opciones, mostrar mensaje corto
        if (message.includes('debe ser uno de:') && message.length > 100) {
            const fieldName = columnId.replace(' (*)', '').toLowerCase();
            return `Valor no válido para ${fieldName}`;
        }

        // Para otros campos específicos con mensajes largos
        if (message.includes('No se encontró') && message.length > 60) {
            if (columnId === 'Email Empleado (*' || columnId === 'empleado_email') {
                return 'Empleado no encontrado';
            }
            if (columnId === 'Departamento (*)' || columnId === 'departamento_nombre') {
                return 'Departamento no encontrado';
            }
            if (columnId === 'Centro (*)' || columnId === 'centro_nombre') {
                return 'Centro no encontrado';
            }
            if (columnId === 'CIF Empresa (*)' || columnId === 'empresa_cif') {
                return 'Empresa no encontrada';
            }
            if (columnId === 'Asignación' || columnId === 'asignacion_nombre') {
                return 'Asignación no encontrada';
            }
            if (columnId === 'Jornada' || columnId === 'jornada_nombre') {
                return 'Jornada no encontrada';
            }

            // Para otros casos, extraer el tipo de entidad del mensaje
            const entityMatch = message.match(/No se encontró (?:un|una) ([^.]+)/);
            if (entityMatch) {
                return `${entityMatch[1].charAt(0).toUpperCase() + entityMatch[1].slice(1)} no encontrado/a`;
            }
        }

        // Para otros tipos de errores largos (más de 80 caracteres)
        if (message.length > 80) {
            // Tomar las primeras palabras hasta llegar cerca del límite
            const words = message.split(' ');
            let shortMessage = '';
            for (let i = 0; i < words.length; i++) {
                const nextMessage = shortMessage + words[i] + ' ';
                if (nextMessage.length > 60) {
                    break;
                }
                shortMessage = nextMessage;
            }
            return shortMessage.trim() + '...';
        }

        return message;
    };


    /**
     * Helper para verificar si un campo específico tiene errores del servidor
     * @param {string} fieldName - Nombre del campo (puede ser label o name del schema)
     * @returns {Object|null} - Objeto con el error si existe, null si no
     */
    const getServerFieldError = (fieldName) => {
        // Primero buscar por el nombre exacto (para empleados que usan labels)
        let error = fieldErrors.find(error => error.field === fieldName);

        // Si no se encuentra y tenemos schema, intentar mapear en ambas direcciones
        if (!error && schema && schema.fields) {
            // Caso 1: fieldName es un label, buscar el field.name correspondiente
            const schemaFieldByLabel = schema.fields.find(f => f.label === fieldName);
            if (schemaFieldByLabel) {
                error = fieldErrors.find(error => error.field === schemaFieldByLabel.name);
            }

            // Caso 2: fieldName es un field.name, buscar por él directamente  
            if (!error) {
                error = fieldErrors.find(error => error.field === fieldName);
            }

            // Caso 3: el error viene con field.name pero fieldName es el label de la columna
            // Buscar si algún error tiene un field.name que corresponda a un field.label igual a fieldName
            if (!error) {
                const errorWithFieldName = fieldErrors.find(errorItem => {
                    const schemaField = schema.fields.find(f => f.name === errorItem.field);
                    return schemaField && schemaField.label === fieldName;
                });
                error = errorWithFieldName;
            }
        }

        return error || null;
    };


    // Función crítica para renderizar contenido de celdas - OPTIMIZADA
    const renderCellContent = useCallback(({ row, column, getValue }) => {
        const value = getValue();
        const columnId = column.id;

        // Safe check para duplicados
        const isDuplicatedValue = duplicados[columnId] && value != null ?
            duplicados[columnId].includes(value) : false;

        const cellError = getCellError(row.index, columnId); // Errores de validación general
        const serverFieldError = getServerFieldError(columnId); // Error específico del servidor
        const suggestion = getFieldSuggestion(columnId);

        // Validaciones solo de formato (no de obligatoriedad)
        let hasFormatError = false;

        if (entity === 'empleados') {
            // Para empleados, validar solo formato cuando hay valor
            if (columnId === 'Email (*)' && value && !isValidEmail(value)) hasFormatError = true;
            if (columnId === 'Teléfono (*)' && value && !isValidPhone(value)) hasFormatError = true;
            if (columnId === 'Fecha Nacimiento (*)' && value && value === 'FECHA INVÁLIDA') hasFormatError = true;
        } else if (schema && schema.fields) {
            // Para otras entidades, validar solo formato cuando hay valor
            const field = schema.fields.find(f => f.label === columnId);
            if (field && value && value.toString().trim() !== '') {
                switch (field.type) {
                    case 'email':
                        if (!isValidEmail(value)) hasFormatError = true;
                        break;
                    case 'date':
                        // Normaliza antes de validar
                        const fechaNormalizada = normalizaFechaRobusta(value);
                        if (
                            !fechaNormalizada ||
                            fechaNormalizada === '' ||
                            fechaNormalizada === 'FECHA INVÁLIDA' ||
                            !/^\d{4}-\d{2}-\d{2}$/.test(fechaNormalizada)
                        ) {
                            hasFormatError = true;
                        }
                        break;
                    case 'select':
                        if (field.options && value != null) {
                            // Convertir tanto el valor como las opciones a string para comparación
                            const valueStr = value.toString();
                            const optionsStr = field.options.map(opt => opt.toString());
                            hasFormatError = !optionsStr.includes(valueStr);
                        }
                        break;
                }
            }
        }

        let displayValue = value;
        if (entity === 'empleados' && columnId === 'Fecha Nacimiento (*)') {
            displayValue = row.original.fechaNacimientoOriginal || value;
        }

        // Determinar el color del campo basado en el tipo de error
        let fieldColorClass = 'text-gray-700 dark:text-gray-300';
        let backgroundColorClass = '';

        if (serverFieldError) {
            // Errores del servidor (duplicados en BD, etc.): ROJO como en empleados
            fieldColorClass = 'text-red-600 dark:text-red-400';
            backgroundColorClass = 'bg-red-50 dark:bg-red-900/20';
        } else if (isDuplicatedValue) {
            // Duplicados dentro del Excel: rojo
            fieldColorClass = 'text-red-600 dark:text-red-400';
        } else if (hasFormatError || cellError) {
            // Errores de formato o validación local: amarillo
            fieldColorClass = 'text-amber-600 dark:text-amber-400';
        }

        // Solo mostrar tooltip si hay error concreto, duplicado o error del servidor
        if (!(cellError || isDuplicatedValue || serverFieldError || hasFormatError)) {
            return <span className={`truncate ${fieldColorClass}`}>{formatCellValue(displayValue)}</span>;
        }

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={`flex items-center gap-2 p-2 rounded-md ${fieldColorClass} ${backgroundColorClass}`}
                        >
                            <span className="truncate">{formatCellValue(displayValue)}</span>
                            <Icon
                                name={serverFieldError ? "AlertCircle" : isDuplicatedValue ? "AlertCircle" : "AlertTriangle"}
                                className={`h-4 w-4 flex-shrink-0 ${serverFieldError || isDuplicatedValue
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                    }`}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="flex flex-col gap-1">
                            {isDuplicatedValue && <span>Valor duplicado - Corrija el archivo Excel/Csv y vuelva a subirlo</span>}
                            {serverFieldError && <span className="font-semibold text-red-700 dark:text-red-300">{serverFieldError.message}</span>}
                            {cellError && <span>{cellError}</span>}
                            {hasFormatError && !cellError && !serverFieldError && !isDuplicatedValue && <span>Error de formato en el campo</span>}
                            {(cellError || serverFieldError || hasFormatError) && suggestion && <span className="text-xs text-gray-400 dark:text-gray-300">{suggestion}</span>}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }, [duplicados, errores, entity, schema, isValidEmail, isValidPhone, isValidDate,
        getCellError, getServerFieldError, getFieldSuggestion, formatCellValue]); // Dependencias optimizadas

    const columns = useMemo(() => {
        if (!previewData?.[0]) return [];

        const dataKeys = Object.keys(previewData[0]);
        const columnsArray = [];

        // Para empleados, agregar columna especial de generar usuario
        if (entity === 'empleados' && dataKeys.some(key => key.includes('Generar Usuario'))) {
            columnsArray.push({
                id: 'generar_usuario',
                header: () => <span>Generar Usuario</span>,
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={row.original.checked || false}
                            disabled
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            });
        }

        // Generar columnas dinámicamente basándose en los datos y el esquema
        const filteredKeys = dataKeys.filter(key => {
            // Excluir campos internos y campos ya manejados
            const excludedFields = [
                'checked',
                'fechaNacimientoOriginal',
                'Generar Usuario',
                'Generar Usuario (*)',
                'Notas',
                'Nombre Completo'
            ];
            return !excludedFields.includes(key);
        });

        filteredKeys.forEach(key => {
            const isRequired = schema?.fields?.find(f => f.label === key)?.required || key.includes('(*)');

            columnsArray.push({
                accessorKey: key,
                header: () => (
                    <div className="flex items-center gap-2">
                        <span>{key}</span>
                        {isRequired && (
                            <span className="text-red-600 dark:text-red-400" title="Campo requerido">*</span>
                        )}
                    </div>
                ),
                cell: renderCellContent
            });
        });

        return columnsArray;
    }, [previewData, duplicados, entity, schema]);

    const table = useReactTable({
        data: previewData || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            if (!previewData?.length) {
                toast.error('No hay datos para importar');
                return;
            }

            // Usar normalización dinámica basada en el esquema
            const normalizedData = previewData.map((row, index) => {
                const normalizedRow = normalizeRowData(row);

                // Para empleados, asegurar que el campo 'Generar Usuario (*)' esté presente con el valor correcto
                if (entity === 'empleados') {
                    if (!normalizedRow['Generar Usuario (*)'] || normalizedRow['Generar Usuario (*)'].trim() === '') {
                        normalizedRow['Generar Usuario (*)'] = row.checked ? 'Sí' : 'No';
                    }
                }

                // --- NUEVO: Para contratos, fechas vacías como null ---
                if (entity === 'contratos') {
                    ['fecha_inicio', 'fecha_fin'].forEach(campo => {
                        if (normalizedRow[campo] === '' || normalizedRow[campo] === undefined) {
                            normalizedRow[campo] = null;
                        }
                    });
                }

                if (schema && schema.fields) {
                    schema.fields.forEach(field => {
                        if (field.type === 'date') {
                            // Buscar por label y por name
                            const label = field.label;
                            const name = field.name;
                            if (normalizedRow[label]) {
                                normalizedRow[label] = normalizaFechaRobusta(normalizedRow[label]);
                            }
                            if (normalizedRow[name]) {
                                normalizedRow[name] = normalizaFechaRobusta(normalizedRow[name]);
                            }
                        }
                    });
                }

                return normalizedRow;
            });

            // Preparar datos para envío
            let dataToSubmit = {
                data: normalizedData
            };

            // Para empleados, agregar información de usuarios a crear
            if (entity === 'empleados') {
                dataToSubmit.createUsers = previewData
                    .map((row, idx) => row.checked ? idx : null)
                    .filter(idx => idx !== null);
            }

            // Enviar datos al backend usando la ruta dinámica
            const response = await axios.post(`/api/v1/admin/import/${entity}/json`, dataToSubmit);

            // Usar la utilidad handleImportResponse para manejar toda la lógica de respuesta
            handleImportResponse(
                response,
                // onSuccess callback
                () => {
                    clearImportState();
                    onOpenChange(false);
                    if (onImportSuccess) {
                        onImportSuccess(response.data);
                    }
                },
                // onError callback
                (errorData) => {
                    console.error(`❌ [${entity.toUpperCase()}] Error en importación desde handleImportResponse:`, errorData);

                    // PROCESAR ERRORES DE CAMPOS ESPECÍFICOS PRIMERO
                    if (errorData.invalidRows && errorData.invalidRows.length > 0) {
                        // Buscar errores de campos específicos en invalidRows
                        errorData.invalidRows.forEach(invalidRow => {
                            if (invalidRow.errors && invalidRow.errors.fields && invalidRow.errors.messages) {
                                // Procesar inmediatamente los errores de campos
                                const fields = invalidRow.errors.fields;
                                const messages = invalidRow.errors.messages;
                                const fieldErrorMap = fields.map((field, index) => ({
                                    field: field,
                                    message: messages[index] || 'Error desconocido'
                                }));

                                setFieldErrors(fieldErrorMap);
                            }
                        });

                        // Procesar otros tipos de errores DESPUÉS
                        const processedErrors = processValidationErrors(errorData.invalidRows);
                        setErrores(processedErrors.errors);
                        setDuplicados(processedErrors.duplicates);
                        setErroresBD(processedErrors.errorsBD);
                    }

                    if (onImportError) {
                        onImportError(errorData);
                    }
                },
                // options
                {
                    successMessage: `${entityDisplayName} importados correctamente`,
                    entityName: entityDisplayName.toLowerCase()
                }
            );

        } catch (error) {
            console.error(`❌ [${entity.toUpperCase()}] Error en importación:`, error);

            // Usar la utilidad para manejar errores
            handleImportError(
                error,
                (errorData) => {
                    console.error(`❌ [${entity.toUpperCase()}] Datos de error procesados:`, errorData);

                    // Procesar errores de campos directamente si vienen en la respuesta
                    if (error.response?.data?.errors?.fields && error.response?.data?.errors?.messages) {
                        const fields = error.response.data.errors.fields;
                        const messages = error.response.data.errors.messages;
                        const fieldErrorMap = fields.map((field, index) => ({
                            field: field,
                            message: messages[index] || 'Error desconocido'
                        }));


                        setFieldErrors(fieldErrorMap);
                    }

                    if (errorData.invalidRows) {
                        const processedErrors = processValidationErrors(errorData.invalidRows);
                        setErrores(processedErrors.errors);
                        setDuplicados(processedErrors.duplicates);
                        setErroresBD(processedErrors.errorsBD);
                    }

                    if (onImportError) {
                        onImportError(errorData);
                    }
                },
                {
                    entityName: entityDisplayName.toLowerCase()
                }
            );
        } finally {
            setIsLoading(false);
        }
    };

    const renderErrores = () => {
        const allErrores = [...errores];
        erroresBD.forEach(err => {
            if (!allErrores.some(e => e.row === err.row &&
                Array.isArray(e.errors) && e.errors.includes(err.message))) {
                allErrores.push({ row: err.row, data: err.data, errors: [err.message] });
            }
        });
        const hasFieldErrors = fieldErrors.length > 0;
        if (!allErrores.length && !Object.keys(duplicados).length && !hasFieldErrors) return null;

        return (
            <>
                {(allErrores.length > 0 || Object.keys(duplicados).length > 0 || hasFieldErrors) && (
                    <div className="bg-custom-error-background dark:bg-custom-blackSemi border border-custom-error-border dark:border-custom-error-darkText rounded-lg p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-start flex-1">
                                <Icon name="Info" className="h-7 w-7 text-custom-error-text dark:text-custom-error-darkText mt-0.5" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-custom-error-text dark:text-custom-error-darkText">
                                        {hasFieldErrors ? 'Errores de validación detectados' : 'Hay errores en el documento'}
                                    </h3>
                                    <div className="mt-2 text-sm text-custom-error-text dark:text-custom-error-darkText">
                                        <p>
                                            {hasFieldErrors
                                                ? 'Se detectaron errores específicos en algunos campos. Los campos con problemas están resaltados en rojo con un icono de error. Revise cada campo antes de continuar.'
                                                : 'El documento contiene errores que necesitan corrección. Revíselo antes de enviarlo a la base de datos para asegurar la precisión y la integridad de la información. Pase el cursor sobre la celda para identificar el error concreto.'
                                            }
                                        </p>
                                        {hasFieldErrors && (
                                            <div className="mt-2">
                                                <p className="font-medium">Campos con errores:</p>
                                                <ul className="list-disc list-inside">
                                                    {fieldErrors.map((error, index) => {
                                                        // Convertir el nombre técnico a nombre amigable
                                                        const getFriendlyFieldName = (fieldName) => {
                                                            if (!schema || !schema.fields) return fieldName;

                                                            // Buscar el campo en el schema por nombre
                                                            const schemaField = schema.fields.find(f => f.name === fieldName);
                                                            if (schemaField) {
                                                                return schemaField.label;
                                                            }

                                                            // Si no se encuentra, devolver el nombre original
                                                            return fieldName;
                                                        };

                                                        const friendlyFieldName = getFriendlyFieldName(error.field);

                                                        return (
                                                            <li key={index} className="text-xs">
                                                                <span className="font-medium">{friendlyFieldName}:</span> {error.message}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setIsErrorDialogOpen(true)}
                                    className="bg-custom-error-border hover:bg-custom-error-border/80 dark:bg-custom-black/20 dark:hover:bg-custom-error-semiDark/60 text-custom-error-text dark:text-custom-error-darkText rounded-full px-4 py-2 whitespace-nowrap"
                                >
                                    Revisar errores
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderPaginationControls = () => {
        const perPageOptions = [10, 20, 30, 40, 50, 100];

        return (
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground dark:text-custom-gray-light">
                </div>
                <Select
                    value={table.getState().pagination.pageSize.toString()}
                    onValueChange={(value) => {
                        table.setPageSize(Number(value));
                    }}
                    className="h-8"
                >
                    <SelectTrigger className="h-8 w-[140px] px-4 py-2 rounded-full bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-custom-blackLight dark:border-custom-gray-light">
                        <span className="text-sm dark:text-custom-gray-light">Por página: {table.getState().pagination.pageSize}</span>
                    </SelectTrigger>
                    <SelectContent className="dark:bg-custom-blackLight dark:border-custom-gray-light dark:text-custom-gray-light">
                        {perPageOptions.map((pageSize) => (
                            <SelectItem
                                key={pageSize}
                                value={pageSize.toString()}
                                className="cursor-default hover:bg-custom-orange/10 dark:hover:bg-custom-orange/10 focus:bg-custom-orange/10 dark:focus:bg-custom-orange/10 dark:text-custom-gray-light data-[state=checked]:bg-custom-orange/10 data-[state=checked]:text-custom-orange dark:data-[state=checked]:bg-custom-orange/10 dark:data-[state=checked]:text-custom-orange"
                            >
                                {pageSize}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="secondary"
                    size="sm"
                    className='bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-custom-blackLight'
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <Icon name='ChevronLeft' className="h-4 w-4 text-custom-gray-dark dark:text-custom-white" />
                </Button>
                <div className="flex justify-between text-sm text-muted-foreground dark:text-custom-gray-light py-2">
                    <span>
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                    </span>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    className='bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-custom-blackLight'
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <Icon name='ChevronRight' className="h-4 w-4 text-custom-gray-dark dark:text-custom-white" />
                </Button>
            </div>
        );
    };

    const renderPreviewTable = () => {
        if (!previewData?.length) return null;

        return (
            <div className="space-y-4">
                {/* Mensaje informativo sobre vista previa de solo lectura */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Icon name="Info" className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Vista Previa de Solo Lectura
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Los datos se muestran tal como están en el archivo. Si hay errores, debe corregir el archivo Excel/CSV y subirlo nuevamente.
                                <span className="font-medium"> No es posible editar los datos desde esta interfaz.</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="overflow-x-auto rounded-md border dark:border-custom-gray-light 
                        [&::-webkit-scrollbar]:h-2.5
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-custom-gray-default/30
                        dark:[&::-webkit-scrollbar-track]:bg-custom-blackLight
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-custom-gray-light/50
                        dark:[&::-webkit-scrollbar-thumb]:bg-custom-gray-semiDark/30
                        hover:[&::-webkit-scrollbar-thumb]:bg-custom-gray-light/80
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-custom-gray-semiDark/50
                        [&::-webkit-scrollbar-corner]:bg-transparent
                        dark:[&::-webkit-scrollbar]:bg-custom-blackLight
                        dark:dark-scrollbar">
                        <Table className="dark:bg-custom-blackLight">
                            <TableHeader className='bg-custom-gray-default dark:bg-custom-blackSemi'>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="dark:border-custom-gray-light hover:dark:bg-custom-blackLight">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className={`${header.id === 'select' ? 'w-[40px]' : ''} dark:text-custom-white`}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className={`
                                                ${row.index % 2 === 0 ? 'bg-gray-50/50 dark:bg-custom-blackSemi/50' : 'dark:bg-custom-blackLight'} 
                                                dark:border-custom-gray-light 
                                                dark:hover:bg-custom-blackSemi/80
                                            `}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className={`${cell.column.id === 'select' ? 'w-[40px]' : ''} dark:text-custom-gray-light`}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center dark:text-custom-gray-light"
                                        >
                                            No hay resultados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                {renderPaginationControls()}
            </div>
        );
    };

    const renderGuideDialog = () => (
        <Dialog open={isGuideDialogOpen} onOpenChange={setIsGuideDialogOpen}>
            <DialogContent className="sm:max-w-[800px] bg-custom-white dark:bg-custom-blackLight">
                <DialogHeader>
                    <DialogTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <Icon name="Info" className="h-5 w-5" />
                        Guía de uso de la plantilla
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-6">
                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
                        <CardContent className="p-4 space-y-4">
                            <div className="text-sm text-blue-600 dark:text-blue-300">
                                <p className="font-medium">Pasos para importar datos correctamente:</p>
                                <ol className="list-decimal list-inside mt-2 space-y-2">
                                    <li>Descarga la plantilla usando el botón "Descargar plantilla"</li>
                                    <li>Abre el archivo Excel descargado</li>
                                    <li>Verás dos filas importantes:
                                        <ul className="list-disc list-inside ml-4 mt-1">
                                            <li className="text-amber-600 dark:text-amber-400">Primera fila: Encabezados de columnas (NO ELIMINAR NI MODIFICAR)</li>
                                            <li className="text-amber-600 dark:text-amber-400">Segunda fila: Ejemplo de datos (ELIMINAR ESTA FILA ANTES DE SUBIR EL ARCHIVO)</li>
                                        </ul>
                                    </li>
                                    <li>Rellena con datos reales siguiendo el formato requerido para cada columna</li>
                                    <li>Guarda el archivo y súbelo usando el botón "Importar Excel" o arrastrándolo aquí</li>
                                </ol>
                            </div>
                            <div className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                                <p className="font-medium">Importante:</p>
                                <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                                    <li>No modifiques los nombres de las columnas</li>
                                    <li>Los campos marcados con (*) son obligatorios</li>
                                    <li>Usa el formato necesario para cada tipo de dato</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter className="px-6 py-4">
                    <Button
                        onClick={() => setIsGuideDialogOpen(false)}
                        className="bg-custom-orange hover:bg-custom-blue text-custom-white dark:text-custom-black dark:hover:bg-custom-white rounded-full"
                    >
                        Entendido
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    const renderErrorDialog = () => {

        return (
            <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <DialogContent className="sm:max-w-[1000px] sm:h-[600px] bg-custom-white dark:bg-custom-blackLight overflow-hidden flex flex-col">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-custom-error-text dark:text-custom-error-darkText">
                            Errores encontrados
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground dark:text-custom-gray-light mt-2">
                            A continuación se muestran todos los errores y duplicados encontrados en el documento subido.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 px-6 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-custom-gray/40 dark:[&::-webkit-scrollbar-thumb]:bg-custom-gray-light/40 [&::-webkit-scrollbar-track]:bg-transparent">
                        <div className="space-y-6 py-4">
                            {errores && errores.length > 0 && (
                                <div className="relative border-[5px] rounded-lg border-custom-error-border dark:border-custom-error-border/50 bg-white dark:bg-custom-blackLight">
                                    <div className="absolute -top-[13px] left-4 bg-custom-white dark:bg-custom-blackLight px-2">
                                        <span className="text-sm font-semibold text-custom-error-text dark:text-custom-error-darkText">
                                            Errores de validación
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <ul className="list-inside space-y-2">
                                            {errores.map((errorObj, index) => {

                                                // Extraer mensajes de error según la estructura
                                                let errorMessages = [];

                                                if (Array.isArray(errorObj.errors)) {
                                                    // Formato de frontend: array de strings
                                                    errorMessages = errorObj.errors.filter(err => typeof err === 'string');
                                                } else if (errorObj.errors && errorObj.errors.messages && Array.isArray(errorObj.errors.messages)) {
                                                    // Formato de backend: objeto con messages
                                                    errorMessages = errorObj.errors.messages.filter(err => typeof err === 'string');
                                                } else if (typeof errorObj.errors === 'string') {
                                                    // Formato simple: string único
                                                    errorMessages = [errorObj.errors];
                                                }

                                                // Solo mostrar si hay mensajes válidos
                                                if (errorMessages.length === 0) {
                                                    return null;
                                                }

                                                return (
                                                    <li key={index} className="text-sm text-custom-gray-semiDark dark:text-custom-gray-light">
                                                        <span className="font-medium">Fila {errorObj.row}:</span>
                                                        <ul className="ml-4 mt-1 space-y-1">
                                                            {errorMessages.map((err, i) => (
                                                                <li key={i} className="text-red-600 dark:text-red-400">
                                                                    • {err}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Errores de campos específicos del servidor */}
                            {fieldErrors && fieldErrors.length > 0 && (
                                <div className="relative border-[5px] rounded-lg border-custom-error-border dark:border-custom-error-border/50 bg-white dark:bg-custom-blackLight">
                                    <div className="absolute -top-[13px] left-4 bg-custom-white dark:bg-custom-blackLight px-2">
                                        <span className="text-sm font-semibold text-custom-error-text dark:text-custom-error-darkText">
                                            Errores de validación del servidor
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <ul className="list-inside space-y-2">
                                            {fieldErrors.map((fieldError, index) => {
                                                // Convertir el nombre técnico a nombre amigable
                                                const getFriendlyFieldName = (fieldName) => {
                                                    if (!schema || !schema.fields) return fieldName;

                                                    // Buscar el campo en el schema por nombre
                                                    const schemaField = schema.fields.find(f => f.name === fieldName);
                                                    if (schemaField) {
                                                        return schemaField.label;
                                                    }

                                                    // Si no se encuentra, devolver el nombre original
                                                    return fieldName;
                                                };

                                                const friendlyFieldName = getFriendlyFieldName(fieldError.field);

                                                return (
                                                    <li key={index} className="text-sm text-custom-gray-semiDark dark:text-custom-gray-light">
                                                        <span className="font-medium">{friendlyFieldName}:</span>
                                                        <ul className="ml-4 mt-1 space-y-1">
                                                            <li className="text-red-600 dark:text-red-400">
                                                                • {fieldError.message}
                                                            </li>
                                                        </ul>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {erroresBD && erroresBD.length > 0 && (
                                <div className="relative border-[5px] rounded-lg border-custom-error-border dark:border-custom-error-border/50 bg-white dark:bg-custom-blackLight mt-6">
                                    <div className="absolute -top-[13px] left-4 bg-custom-white dark:bg-custom-blackLight px-2">
                                        <span className="text-sm font-semibold text-custom-error-text dark:text-custom-error-darkText">
                                            Errores de duplicidad en la base de datos
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <ul className="list-inside space-y-2">
                                            {erroresBD.map((err, idx) => (
                                                <li key={idx} className="text-sm text-custom-gray-semiDark dark:text-custom-gray-light">
                                                    Fila {err.row}, columna <b>{err.field}</b>:
                                                    <ul>
                                                        <li style={{ color: 'red' }}>{err.message}</li>
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {Object.entries(duplicados || {}).map(([campo, valores]) => (
                                <div key={campo} className="mb-4 last:mb-0">
                                    <p className="text-sm font-semibold text-custom-gray-semiDark dark:text-custom-gray-light mb-2">
                                        {campo}:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {valores.map((valor, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 text-sm border border-custom-error-border dark:border-custom-error-border/50 text-custom-error-text dark:text-custom-error-darkText rounded bg-custom-error-background dark:bg-custom-gray-semiDark/50"
                                            >
                                                {valor}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4">
                        <Button
                            onClick={() => setIsErrorDialogOpen(false)}
                            className="bg-custom-orange hover:bg-custom-blue dark:hover:bg-custom-blue/80 text-custom-white dark:text-custom-white rounded-full"
                        >
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };


    // Limpiar cache al desmontar el componente para liberar memoria
    useEffect(() => {
        return () => {
            // Cleanup: limpiar cache cuando el componente se desmonta
            try {
                if (typeof clearFieldMappingCache === 'function') {
                    clearFieldMappingCache();
                }
            } catch (error) {
                // Silenciar errores de cleanup
            }
        };
    }, []);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[1225px] sm:h-[725px] bg-custom-white dark:bg-custom-blackLight overflow-hidden flex flex-col">
                    <DialogHeader className="p-6 pb-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-custom-blue dark:text-custom-white">Importación de {entityDisplayName.toLowerCase()} masiva</DialogTitle>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={generarExcel}
                                    variant="outline"
                                    className="h-9 px-4 py-2 bg-custom-gray-default hover:bg-custom-gray-light dark:bg-custom-blackSemi dark:hover:bg-custom-blackLight text-custom-black dark:text-custom-white rounded-full flex items-center gap-2"
                                    disabled={isLoading || loadingPerms || !canExport}
                                >
                                    {isLoading ? (
                                        <Icon name="Loader" className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Icon name="Download" className="h-4 w-4" />
                                    )}
                                    <span>Descargar plantilla</span>
                                </Button>
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    className="h-9 px-4 py-2 bg-custom-gray-default hover:bg-custom-gray-light dark:bg-custom-blackSemi dark:hover:bg-custom-blackLight text-custom-black dark:text-custom-white rounded-full flex items-center gap-2"
                                    disabled={isLoading || loadingPerms || !canImport}
                                >
                                    <Icon name="Upload" className="h-4 w-4" />
                                    <span>Importar Excel</span>
                                </Button>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground dark:text-custom-gray-light mt-4">
                            Descarga la plantilla para rellenar o carga tu archivo Excel para importar {entityDisplayName.toLowerCase()} masivamente.
                        </div>
                        {!loadingPerms && (!canImport || !canExport) && (
                            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Icon name="AlertTriangle" className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-amber-700 dark:text-amber-300">
                                        {!canImport && !canExport && (
                                            <span>No tienes permisos para importar ni exportar {entityDisplayName.toLowerCase()}.</span>
                                        )}
                                        {!canImport && canExport && (
                                            <span>No tienes permisos para importar {entityDisplayName.toLowerCase()}. Solo puedes descargar plantillas.</span>
                                        )}
                                        {canImport && !canExport && (
                                            <span>No tienes permisos para exportar {entityDisplayName.toLowerCase()}. Solo puedes importar datos.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogHeader>

                    <div className="flex-1 px-6 overflow-y-auto [&::-webkit-scrollbar]:w-2 
                        [&::-webkit-scrollbar-thumb]:rounded-full 
                        [&::-webkit-scrollbar-track]:rounded-full 
                        [&::-webkit-scrollbar-thumb]:bg-custom-gray/40 
                        dark:[&::-webkit-scrollbar-thumb]:bg-custom-gray-light/40 
                        [&::-webkit-scrollbar-track]:bg-transparent">
                        <div className="space-y-6">
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                ${isDragActive
                                        ? 'border-custom-orange bg-custom-orange/5'
                                        : previewData?.length > 0
                                            ? 'border-green-300 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20'
                                            : 'border-gray-300 dark:border-custom-gray hover:border-custom-orange hover:bg-custom-orange/5'}`}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center">
                                    <div className="bg-gray-100 dark:bg-custom-blackSemi rounded-full px-4 py-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <Icon name={previewData?.length > 0 ? "FileCheck" : "Upload"} className="h-4 w-4 text-gray-500 dark:text-custom-gray-light" />
                                            <span className="text-sm font-medium text-foreground dark:text-custom-white">
                                                {previewData?.length > 0 ? 'Archivo cargado' : 'Subir archivo'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        {previewData?.length > 0 ? (
                                            <>
                                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                    Archivo procesado con {previewData.length} filas
                                                </span>
                                                <span className="text-xs text-muted-foreground dark:text-custom-gray-light">
                                                    Arrastra un nuevo archivo para reemplazar o usa "Nuevo archivo" para limpiar
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-sm text-muted-foreground dark:text-custom-gray-light">
                                                    Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
                                                </span>
                                                <span className="text-xs text-muted-foreground dark:text-custom-gray-light">
                                                    Solo se permite 1 archivo por importación
                                                </span>
                                                <span className="text-xs text-muted-foreground dark:text-custom-gray-light">
                                                    Tipos permitidos: XLSX, XLS, CSV &nbsp; | &nbsp; Tamaño máximo: 10MB
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-custom-blue dark:text-custom-white">Vista previa</h3>
                                    <div className="flex items-center gap-2">
                                        {previewData?.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleNewFile}
                                                className="text-xs text-muted-foreground dark:text-custom-gray-light hover:text-foreground dark:hover:text-custom-white flex items-center gap-1"
                                            >
                                                <Icon name="Plus" className="h-4 w-4" />
                                                Nuevo archivo
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsGuideDialogOpen(true)}
                                            className="text-xs text-muted-foreground dark:text-custom-gray-light hover:text-foreground dark:hover:text-custom-white flex items-center gap-1"
                                        >
                                            <Icon name="FileText" className="h-4 w-4" />
                                            Guía de uso
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsFormatDialogOpen(true)}
                                            className="text-xs text-muted-foreground dark:text-custom-gray-light hover:text-foreground dark:hover:text-custom-white flex items-center gap-1"
                                        >
                                            <Icon name="FileText" className="h-4 w-4" />
                                            Formato requerido
                                        </Button>

                                        {isFormatDialogOpen && (
                                            <Dialog open={isFormatDialogOpen} onOpenChange={setIsFormatDialogOpen}>
                                                <DialogContent className="sm:max-w-[900px] w-[95vw] h-[90vh] max-h-[90vh] bg-custom-white dark:bg-custom-blackLight flex flex-col rounded-2xl shadow-xl border-0">
                                                    <DialogHeader className="flex-shrink-0 px-8 pt-8 pb-4">
                                                        <DialogTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xl font-bold">
                                                            <Icon name="FileSpreadsheet" className="h-6 w-6" />
                                                            Formato requerido para {entityDisplayName}
                                                        </DialogTitle>
                                                        <DialogDescription className="text-gray-500 dark:text-gray-300 mt-2">
                                                            Estructura de campos requerida para la importación de {entityDisplayName.toLowerCase()}
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="flex-1 overflow-hidden px-8">
                                                        <ScrollArea className="h-full pr-4">
                                                            <div className="space-y-4">
                                                                {schema && schema.fields ? (
                                                                    <>
                                                                        <div className="text-sm text-muted-foreground dark:text-custom-gray-light mb-4">
                                                                            La siguiente tabla muestra todos los campos disponibles para la importación de {entityDisplayName.toLowerCase()}:
                                                                        </div>
                                                                        <div className="rounded-2xl border border-gray-200 dark:border-custom-blackSemi overflow-hidden shadow-sm">
                                                                            <Table>
                                                                                <TableHeader className="bg-blue-50 dark:bg-custom-blackSemi">
                                                                                    <TableRow>
                                                                                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300 text-base">Campo</TableHead>
                                                                                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300 text-base">Tipo</TableHead>
                                                                                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300 text-base">Requerido</TableHead>
                                                                                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300 text-base">Descripción</TableHead>
                                                                                    </TableRow>
                                                                                </TableHeader>
                                                                                <TableBody>
                                                                                    {schema.fields.map((field, index) => (
                                                                                        <TableRow key={index} className="hover:bg-blue-50/50 dark:hover:bg-custom-blackSemi/60">
                                                                                            <TableCell className="font-medium text-gray-900 dark:text-custom-white">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    {field.label}
                                                                                                    {field.required && (
                                                                                                        <Badge variant="destructive" className="text-xs rounded-full px-2 py-0.5">Requerido</Badge>
                                                                                                    )}
                                                                                                </div>
                                                                                            </TableCell>
                                                                                            <TableCell className="text-gray-600 dark:text-gray-300">
                                                                                                {field.type === 'select' && field.options ? (
                                                                                                    <div className="flex flex-wrap gap-1">
                                                                                                        {field.options.map((opt, i) => (
                                                                                                            <Badge key={i} variant="outline" className="rounded-full px-2 py-0.5 text-xs">
                                                                                                                {opt}
                                                                                                            </Badge>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">
                                                                                                        {field.type === 'string'
                                                                                                            ? 'Texto o números'
                                                                                                            : field.type === 'email'
                                                                                                                ? 'Correo electrónico'
                                                                                                                : field.type === 'date'
                                                                                                                    ? 'Fecha'
                                                                                                                    : field.type}
                                                                                                    </Badge>
                                                                                                )}
                                                                                            </TableCell>
                                                                                            <TableCell>
                                                                                                {field.required ? (
                                                                                                    <Icon name="Check" className="h-4 w-4 text-green-600" />
                                                                                                ) : (
                                                                                                    <Icon name="X" className="h-4 w-4 text-gray-400" />
                                                                                                )}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                                                                                                {field.description || field.help || getFieldSuggestion(field.label) || 'Sin descripción adicional'}
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    ))}
                                                                                </TableBody>
                                                                            </Table>
                                                                        </div>
                                                                        <div className="flex justify-end gap-3 mt-8">
                                                                            <Button
                                                                                onClick={generarExcel}
                                                                                disabled={isLoading}
                                                                                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 text-base font-semibold shadow"
                                                                            >
                                                                                {isLoading ? (
                                                                                    <>
                                                                                        <Icon name="Loader" className="h-4 w-4 animate-spin mr-2" />
                                                                                        Generando...
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Icon name="Download" className="h-4 w-4 mr-2" />
                                                                                        Descargar plantilla
                                                                                    </>
                                                                                )}
                                                                            </Button>
                                                                            <Button
                                                                                onClick={() => setIsFormatDialogOpen(false)}
                                                                                variant="outline"
                                                                                className="rounded-full px-6 py-2 text-base font-semibold"
                                                                            >
                                                                                Cerrar
                                                                            </Button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="text-center py-8">
                                                                        <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                                                                        <p className="text-gray-500 dark:text-gray-400">
                                                                            Cargando estructura de campos...
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground dark:text-custom-gray-light">
                                    Los datos aparecerán en la tabla tras subir el documento. Al resubir un documento, se reemplaza por el documento actual.
                                    <span className="text-blue-600 dark:text-blue-400 font-medium"> El documento se mantiene cargado al cerrar y reabrir este recuadro.</span>
                                </p>

                                {renderErrores()}

                                {renderPreviewTable()}

                                {!previewData?.length && (
                                    <div className="border-1 bg-gray-50 dark:bg-custom-blackSemi rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-custom-gray-light">
                                            <Icon name="Info" className="h-4 w-4" />
                                            <div className="flex flex-col">
                                                <span>Aún no hay datos para mostrar.</span>
                                                <span className="text-xs">
                                                    Carga un archivo Excel para ver la vista previa del documento.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 flex-shrink-0">
                        <div className="flex justify-end gap-4">
                            <DialogClose
                                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium 
                                    ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 
                                    focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none 
                                    disabled:opacity-50 h-10 px-4 py-2 bg-hidden hover:bg-custom-gray-default 
                                    dark:hover:bg-custom-blackSemi text-custom-black dark:text-custom-white rounded-full"
                            >
                                Cancelar
                            </DialogClose>
                            <Button
                                onClick={handleSubmit}
                                className="bg-custom-orange hover:bg-custom-blue text-custom-white 
                                    dark:text-custom-black dark:hover:bg-custom-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!previewData?.length || errores.length > 0 || isLoading || loadingPerms || !canImport}
                            >
                                {isLoading ? (
                                    <>
                                        <Icon name="Loader" className="h-4 w-4 animate-spin mr-2" />
                                        Importando...
                                    </>
                                ) : (
                                    'Importar'
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {renderErrorDialog()}
            {renderGuideDialog()}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
                className="hidden"

            />
        </>
    );
}