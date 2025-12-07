import { OnboardingStepId } from '../types/onboarding.types.js';

// ===== CONFIGURACIÓN DE PASOS DEL ONBOARDING =====
export const ONBOARDING_STEPS = [
    {
        id: OnboardingStepId.WELCOME,
        title: "¡Bienvenido/a a Empresa",
        description: "¡Estamos encantados de tenerte a bordo!",
        icon: "HeartHandshake"
    },
    {
        id: OnboardingStepId.ABOUT,
        title: "¿Quiénes somos?",
        description: "Formación que cambia vidas.",
        icon: "Earth"
    },
    {
        id: OnboardingStepId.TEAM,
        title: "Conoce a tu equipo",
        description: "¡Listo para comenzar!",
        icon: "Users"
    }
];

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
            url: '/admin/employees/create',
            description: 'Completa tu información personal'
        },
        {
            id: 'step2',
            title: 'Documentos',
            url: '/admin/documents',
            description: 'Revisa los documentos importantes'
        },
        {
            id: 'step3',
            title: 'Horarios',
            url: '/admin/schedules',
            description: 'Conoce tus horarios de trabajo'
        },
        {
            id: 'step4',
            title: 'Normativas',
            url: '/admin/policies',
            description: 'Lee las normativas de la empresa'
        },
        {
            id: 'step5',
            title: 'Finalizar',
            url: '/dashboard',
            description: 'Completa tu proceso de incorporación'
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
        title: "¡Bienvenido/a a Empresa",
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
