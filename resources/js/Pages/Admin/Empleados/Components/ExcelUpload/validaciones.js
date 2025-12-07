export const COLUMN_MAPPING = {
    'Nombre (*)': 'nombre',
    'Primer Apellido (*)': 'primer_apellido',
    'Segundo Apellido': 'segundo_apellido',
    'Tipo de Documento (*)': 'tipo_documento',
    'Nº Documento (*)': 'numero_documento',
    'NISS (*)': 'niss',
    'Email (*)': 'email',
    'Email Secundario': 'email_secundario',
    'Teléfono (*)': 'telefono',
    'Teléfono Personal Móvil': 'telefono_personal_movil',
    'Teléfono Personal Fijo': 'telefono_personal_fijo',
    'Extensión Centrex': 'extension_centrex',
    'Dirección (*)': 'direccion',
    'Fecha Nacimiento (*)': 'fecha_nacimiento',
    'Género (*)': 'genero',
    'Tipo Empleado (*)': 'tipo_empleado',
    'Estado Empleado (*)': 'estado_empleado',
    'Contacto Emergencia (*)': 'contacto_emergencia',
    'Teléfono de Emergencia (*)': 'telefono_emergencia',
};

export const VALIDATION_SCHEMA = {
    'Nombre (*)': {
        required: true,
        mensaje: 'El nombre es requerido'
    },
    'Primer Apellido (*)': {
        required: true,
        mensaje: 'El primer apellido es requerido'
    },
    'Segundo Apellido': {
        required: false,
        mensaje: 'El segundo apellido es requerido'
    },
    'Fecha Nacimiento (*)': {
        required: true,
        tipo: 'fecha',
        mensaje: 'La fecha debe tener el formato YYYY-MM-DD (1990-01-01), DD-MM-YYYY (01-01-1990) o MM/DD/YYYY (12/31/1990)',
        ejemplo: '1990-01-01 o 01-01-1990 o 12/31/1990'
    },
    'Género (*)': {
        required: true,
        valores: ['Masculino', 'Femenino', 'Otro'],
        mensaje: 'El género debe ser Masculino, Femenino u Otro'
    },
    'Tipo de Documento (*)': {
        required: true,
        valores: ['DNI', 'NIE', 'Pasaporte'],
        mensaje: 'El tipo de documento debe ser DNI, NIE o Pasaporte'
    },
    'Nº Documento (*)': {
        required: true,
        unico: true,
        mensaje: 'El número de documento es requerido y debe ser único'
    },
    'NISS (*)': {
        required: true,
        unico: true,
        regex: /^\d{12}$/,
        mensaje: 'El NISS debe tener 12 dígitos',
        ejemplo: '281234567840'
    },
    'Email (*)': {
        required: true,
        unico: true,
        tipo: 'email',
        mensaje: 'El email debe ser válido y único',
        ejemplo: 'ejemplo@dominio.com'
    },
    'Email Secundario': {
        tipo: 'email',
        mensaje: 'El email secundario debe ser válido',
        ejemplo: 'ejemplo.secundario@dominio.com'
    },
    'Teléfono (*)': {
        required: true,
        tipo: 'telefono',
        mensaje: 'El teléfono debe comenzar con + y tener entre 9 y 15 dígitos',
        ejemplo: '+34612345678'
    },
    'Teléfono Secundario': {
        tipo: 'telefono',
        mensaje: 'El teléfono secundario debe comenzar con + y tener entre 9 y 15 dígitos',
        ejemplo: '+34623456789'
    },
    'Dirección (*)': {
        required: true,
        mensaje: 'La dirección es requerida'
    },
    'Tipo Empleado (*)': {
        required: true,
        valores: ['Empleado', 'Manager', 'Directivo'],
        mensaje: 'El tipo de empleado debe ser Empleado, Manager o Directivo'
    },
    'Estado Empleado (*)': {
        required: true,
        valores: ['Activo', 'Inactivo'],
        mensaje: 'El estado debe ser Activo o Inactivo'
    },
    'Contacto Emergencia (*)': {
        required: true,
        mensaje: 'El contacto de emergencia es requerido'
    },
    'Teléfono de Emergencia (*)': {
        required: true,
        tipo: 'telefono',
        mensaje: 'El teléfono de emergencia debe comenzar con + y tener entre 9 y 15 dígitos',
        ejemplo: '+34634567890'
    },
    'Teléfono Personal Móvil': {
        tipo: 'telefono',
        required: false,
        mensaje: 'Debe ser un número de teléfono válido con prefijo internacional (+).'
    },
    'Teléfono Personal Fijo': {
        tipo: 'telefono',
        required: false,
        mensaje: 'Debe ser un número de teléfono válido con prefijo internacional (+).'
    },
    'Extensión Centrex': {
        tipo: 'texto',
        required: false,
        mensaje: 'Debe ser una extensión válida.'
    }
};

export const validateData = (data, catalogos) => {
    const errores = [];
    const duplicados = {};
    const schema = getValidationSchema(catalogos);

    // Verificar duplicados primero
    Object.entries(VALIDATION_SCHEMA).forEach(([campo, schema]) => {
        if (schema.unico) {
            const valores = data.map(row => row[campo]?.toString().trim()).filter(Boolean);
            const duplicadosEncontrados = valores.filter((valor, index) => 
                valores.indexOf(valor) !== index
            );
            if (duplicadosEncontrados.length > 0) {
                duplicados[campo] = [...new Set(duplicadosEncontrados)];
            }
        }
    });

    data.forEach((row, index) => {
        const rowErrors = [];
        Object.entries(schema).forEach(([field, rules]) => {
            const value = row[field]?.toString().trim();

            // Validar campos requeridos
            if (rules.required && (!value || value === '')) {
                rowErrors.push(`El campo "${field}" es requerido`);
                return;
            }

            if (value) {
                // Validar formato de fecha
                if (rules.tipo === 'fecha') {
                    // Aceptar YYYY-MM-DD, DD-MM-YYYY, MM-DD-YYYY, DD/MM/YYYY, MM/DD/YYYY
                    if (
                        !/^\d{4}-\d{2}-\d{2}$/.test(value) &&
                        !/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(value) &&
                        !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)
                    ) {
                        rowErrors.push(`El campo "${field}" debe tener el formato YYYY-MM-DD (1990-01-01), DD-MM-YYYY (01-01-1990) o MM/DD/YYYY (12/31/1990)`);
                    }
                }

                // Validar formato de email
                if (rules.tipo === 'email') {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        rowErrors.push(`El campo "${field}" debe ser un email válido`);
                    }
                }

                // Validar formato de teléfono
                if (rules.tipo === 'telefono') {
                    if (!/^\+\d{9,15}$/.test(value)) {
                        rowErrors.push(`El campo "${field}" debe comenzar con + y tener entre 9 y 15 dígitos`);
                    }
                }

                // Validar valores permitidos
                if (rules.valores && !rules.valores.includes(value)) {
                    rowErrors.push(`El campo "${field}" debe ser uno de: ${rules.valores.join(', ')}`);
                }

                // Validar expresión regular personalizada
                if (rules.regex && !rules.regex.test(value)) {
                    rowErrors.push(`El campo "${field}" no tiene el formato correcto`);
                }

                // Validar teléfonos
                if (rules.tipo === 'telefono' && value) {
                    if (!/^\+\d{9,15}$/.test(value)) {
                        rowErrors.push(`El campo "${field}" debe ser un número de teléfono válido con prefijo internacional (+).`);
                    }
                }

                // Validar extensión centrex
                if (field === 'Extensión Centrex' && value) {
                    if (!/^\d{1,4}$/.test(value)) {
                        rowErrors.push(`El campo "${field}" debe ser una extensión válida (1-4 dígitos).`);
                    }
                }
            }
        });
        if (rowErrors.length > 0) {
            errores.push({
                row: index + 1,
                data: row,
                errors: rowErrors
            });
        }
    });

    return {
        errores,
        duplicados
    };
};

export const convertToRealNames = (data) => {
    return data.map(row => {
        const newRow = {};
        Object.entries(row).forEach(([key, value]) => {
            const realKey = COLUMN_MAPPING[key] || key;
            newRow[realKey] = value;
        });
        return newRow;
    });
};

export const convertToFriendlyNames = (data) => {
    return data.map(row => {
        const newRow = {};
        Object.entries(row).forEach(([key, value]) => {
            const friendlyKey = Object.entries(COLUMN_MAPPING).find(([_, v]) => v === key)?.[0] || key;
            newRow[friendlyKey] = value;
        });
        return newRow;
    });
};

export const getValidationSchema = (catalogos) => ({
    'Tipo de Documento (*)': {
        required: true,
        valores: catalogos.tiposDocumento.map(t => t.nombre),
        mensaje: 'El tipo de documento debe ser uno de los permitidos'
    },
    'Género (*)': {
        required: true,
        valores: catalogos.generos.map(g => g.nombre),
        mensaje: 'El género debe ser uno de los permitidos'
    },
    'Tipo Empleado (*)': {
        required: true,
        valores: catalogos.tiposEmpleado.map(t => t.nombre),
        mensaje: 'El tipo de empleado debe ser uno de los permitidos'
    },
    'Estado Empleado (*)': {
        required: true,
        valores: catalogos.estadosEmpleado.map(e => e.nombre),
        mensaje: 'El estado debe ser uno de los permitidos'
    },
    'Teléfono Personal Móvil': {
        tipo: 'telefono',
        required: false,
        mensaje: 'Debe ser un número de teléfono válido con prefijo internacional (+).'
    },
    'Teléfono Personal Fijo': {
        tipo: 'telefono',
        required: false,
        mensaje: 'Debe ser un número de teléfono válido con prefijo internacional (+).'
    },
    'Extensión Centrex': {
        tipo: 'texto',
        required: false,
        mensaje: 'Debe ser una extensión válida.'
    }
}); 