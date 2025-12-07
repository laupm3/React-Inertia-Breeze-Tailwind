// ===== CONFIGURACIÓN DE PASOS DEL ONBOARDING =====
// Los pasos están definidos en onboardingSteps.js para evitar importaciones circulares

// ===== CONFIGURACIÓN GENERAL =====
export const ONBOARDING_CONFIG = {
    // Configuración de animaciones
    animations: {
        contentDelay: 300,
        stepTransition: 500,
        fadeInDuration: 300
    },
    
    // Configuración de comportamiento
    behavior: {
        allowSkip: true,
        autoProgress: false,
        rememberProgress: true,
        resetOnRevisit: false
    },
    
    // Configuración de UI
    ui: {
        showProgressBar: true,
        showStepNumbers: true,
        showSkipButton: true,
        showNavigationButtons: true
    },
    
    // Breakpoints responsivos
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
    }
};

// ===== CONFIGURACIÓN DE PÁGINA DE ONBOARDING =====
export const ONBOARDING_PAGE_CONFIG = {
    steps: [
        {
            id: 'step1',
            title: 'Información Personal',
            url: '/user/profile',
            description: 'Comprueba tu información personal en tu perfil'
        },
        {
            id: 'step2',
            title: 'Organigrama',
            url: '/organization',
            description: 'Entra en la página de Organigrama y conoce la empresa'
        },
        {
            id: 'step3',
            title: 'Eventos',
            url: '/user/eventos',
            description: 'Entra en Eventos y mira tu calendario'
        },
        {
            id: 'step4',
            title: 'Vacaciones',
            url: '/user/vacaciones',
            description: 'Entra en Vacaciones para pedir tus días libres'
        },
        {
            id: 'step5',
            title: 'Horarios',
            url: '/user/horarios',
            description: 'Entra en Horarios e infórmate de tus jornadas y días libres'
        }
    ],
    
    // Configuración de progreso
    progress: {
        showPercentage: true,
        persistInStorage: true,
        autoSave: true
    }
};

// ===== MENSAJES Y TEXTOS =====
export const ONBOARDING_MESSAGES = {
    welcome: {
        title: "¡Bienvenido/a a Empresa!",
        subtitle: "Estamos encantados de tenerte a bordo",
        description: "Desde hoy formas parte de una organización que lleva casi 40 años impulsando la formación de calidad."
    },
    
    about: {
        title: "¿Quiénes somos?",
        subtitle: "Formación que cambia vidas",
        description: "En Empresa creemos en las personas, en el talento compartido y en el aprendizaje constante."
    },
    
    team: {
        title: "Conoce a tu equipo",
        subtitle: "¡Listo para comenzar!",
        description: "Tu manager y equipo están aquí para ayudarte en todo lo que necesites."
    },
    
    buttons: {
        skip: "Omitir onboarding",
        next: "Siguiente",
        previous: "Anterior",
        finish: "Finalizar",
        close: "Cerrar"
    },
    
    progress: {
        stepOf: "Paso {current} de {total}",
        completed: "¡Proceso completado!",
        skipped: "Proceso omitido"
    }
};
