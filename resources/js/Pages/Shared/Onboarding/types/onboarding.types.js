// ===== TYPES Y INTERFACES =====

/**
 * @typedef {Object} OnboardingStep
 * @property {string} id - Identificador único del paso
 * @property {string} title - Título del paso
 * @property {string} description - Descripción del paso
 * @property {string} icon - Nombre del icono
 * @property {string} [url] - URL opcional para navegación
 */

/**
 * @typedef {Object} OnboardingImages
 * @property {Object} welcome - Imágenes para la sección de bienvenida
 * @property {string} welcome.office1 - URL de imagen de oficina 1
 * @property {string} welcome.office2 - URL de imagen de oficina 2
 * @property {string} welcome.header - URL de imagen de cabecera
 * @property {string} welcome.meeting - URL de imagen de reunión
 * @property {string} welcome.team - URL de imagen de equipo
 * @property {Object} about - Imágenes para la sección acerca de
 * @property {string} about.classroom - URL de imagen de aula
 */

/**
 * @typedef {Object} ManagerInfo
 * @property {string} [nombreCompleto] - Nombre completo del manager
 * @property {string} [email] - Email del manager
 * @property {string} [telefono] - Teléfono del manager
 * @property {string} [extension_centrex] - Extensión del manager
 * @property {Object} [user] - Información del usuario
 * @property {string} [user.profile_photo_url] - URL de la foto de perfil
 */

/**
 * @typedef {Object} Departamento
 * @property {string} [nombre] - Nombre del departamento
 * @property {ManagerInfo} [manager] - Información del manager
 */

/**
 * @typedef {Object} Empleado
 * @property {Object} user - Información del usuario
 * @property {number} user.id - ID del usuario
 * @property {Departamento[]} departamentos - Lista de departamentos
 */

/**
 * @typedef {Object} OnboardingData
 * @property {Object} auth - Información de autenticación
 * @property {Object} [auth.user] - Usuario autenticado
 * @property {number} [auth.user.id] - ID del usuario autenticado
 * @property {Empleado} [empleado] - Información del empleado
 * @property {Departamento} [departamento] - Información del departamento
 * @property {ManagerInfo} [managerInfo] - Información del manager
 */

/**
 * @typedef {Object} OnboardingState
 * @property {number} currentStep - Paso actual del onboarding
 * @property {boolean[]} completed - Array de pasos completados
 * @property {boolean} showContent - Si mostrar el contenido
 * @property {number} activeContent - Contenido activo
 * @property {boolean} animate - Si animar las transiciones
 * @property {boolean} allStepsCompleted - Si todos los pasos están completados
 */

/**
 * @typedef {Object} OnboardingProgress
 * @property {Record<string, boolean>} visitedSteps - Pasos visitados
 * @property {boolean} onboardingSkipped - Si el onboarding fue omitido
 * @property {boolean} isComplete - Si está completo
 * @property {number} progressPercentage - Porcentaje de progreso
 */

/**
 * @typedef {Object} OnboardingModalProps
 * @property {Empleado[]} empleados - Lista de empleados
 * @property {boolean} show - Si mostrar el modal
 * @property {function} onClose - Callback para cerrar
 */

/**
 * @typedef {Object} OnboardingPageProps
 * @property {ManagerInfo} [managerInfo] - Información del manager
 * @property {Departamento} [departamento] - Información del departamento
 * @property {Empleado[]} empleados - Lista de empleados
 */

/**
 * @typedef {Object} StepItemProps
 * @property {OnboardingStep} step - Información del paso
 * @property {number} index - Índice del paso
 * @property {boolean} isCompleted - Si está completado
 * @property {boolean} isCurrent - Si es el paso actual
 * @property {boolean} canInteract - Si se puede interactuar
 * @property {function} onClick - Callback para click
 */

/**
 * @typedef {Object} ContentSectionProps
 * @property {boolean} animate - Si animar
 * @property {ManagerInfo} [managerInfo] - Información del manager
 * @property {Departamento} [departamento] - Información del departamento
 */

// ===== ENUMS =====
export const OnboardingStepId = {
    WELCOME: 'welcome',
    ABOUT: 'about',
    TEAM: 'team'
};

export const OnboardingPageSteps = {
    STEP1: 'step1',
    STEP2: 'step2',
    STEP3: 'step3',
    STEP4: 'step4',
    STEP5: 'step5'
};

// ===== STORAGE KEYS =====
export const STORAGE_KEYS = {
    ONBOARDING_VISITED: 'onboardingVisited',
    ONBOARDING_COMPLETED: 'onboardingCompleted',
    ONBOARDING_SKIPPED: 'onboardingSkipped',
    VISITED_STEPS: 'visitedSteps'
};

// ===== VALIDATION HELPERS =====
export const isValidOnboardingStep = (step) => {
    return step && 
           typeof step.id === 'string' && 
           typeof step.title === 'string' && 
           typeof step.description === 'string' && 
           typeof step.icon === 'string';
};

export const isValidManagerInfo = (manager) => {
    return manager && typeof manager === 'object';
};

export const isValidEmpleado = (empleado) => {
    return empleado && 
           empleado.user && 
           typeof empleado.user.id === 'number' && 
           Array.isArray(empleado.departamentos);
};
