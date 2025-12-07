// ===== CONFIGURACIÓN DE IMÁGENES DEL ONBOARDING =====

export const ONBOARDING_IMAGES = {
    welcome: {
        office1: "https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        office2: "https://images.pexels.com/photos/699459/pexels-photo-699459.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        header: "https://images.pexels.com/photos/936722/pexels-photo-936722.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        meeting: "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&fit=crop&w=800&q=80",
        team: "https://images.pexels.com/photos/1367276/pexels-photo-1367276.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    about: {
        classroom: "https://images.pexels.com/photos/936722/pexels-photo-936722.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    }
};

// ===== CONFIGURACIÓN DE ALT TEXTS PARA ACCESIBILIDAD =====
export const ONBOARDING_IMAGE_ALTS = {
    welcome: {
        office1: "Oficina moderna con espacio de trabajo colaborativo",
        office2: "Ambiente de trabajo profesional en empresa",
        header: "Cabecera de profesores de empresa",
        meeting: "Reunión de equipo profesional",
        team: "Equipo de trabajo colaborando"
    },
    about: {
        classroom: "Aula de formación de empresa"
    }
};

// ===== CONFIGURACIÓN DE LAZY LOADING =====
export const IMAGE_LOADING_CONFIG = {
    loading: "lazy",
    decoding: "async",
    referrerPolicy: "no-referrer"
};

// ===== PRELOAD DE IMÁGENES CRÍTICAS =====
export const CRITICAL_IMAGES = [
    ONBOARDING_IMAGES.welcome.header,
    ONBOARDING_IMAGES.about.classroom
];

// ===== HELPER PARA OBTENER IMAGEN CON FALLBACK =====
export const getImageWithFallback = (imageKey, section = 'welcome') => {
    const image = ONBOARDING_IMAGES[section]?.[imageKey];
    return image || ONBOARDING_IMAGES.welcome.office1; // Fallback por defecto
};

// ===== HELPER PARA OBTENER ALT TEXT =====
export const getImageAlt = (imageKey, section = 'welcome') => {
    const alt = ONBOARDING_IMAGE_ALTS[section]?.[imageKey];
    return alt || `Imagen de ${section} - ${imageKey}`;
};
