# 🎯 Sistema de Onboarding Refactorizado

## 📋 Descripción General

Este es el sistema de onboarding completamente refactorizado siguiendo las mejores prácticas de React y arquitectura modular. El sistema se ha reestructurado para ser más mantenible, escalable y fácil de entender.

## 🏗️ Arquitectura y Estructura

### 📁 Estructura de Carpetas

```
resources/js/Pages/Shared/Onboarding/
├── components/           # Componentes reutilizables
│   ├── StepItem.jsx     # Item individual de paso
│   ├── StepProgress.jsx # Barra de progreso y lista de pasos
│   ├── WelcomeContent.jsx # Contenido de bienvenida
│   ├── AboutContent.jsx # Contenido "Acerca de nosotros"
│   ├── TeamContent.jsx  # Contenido del equipo
│   └── index.js         # Barrel export
├── constants/           # Configuraciones y constantes
│   ├── onboardingConfig.js # Configuración principal
│   ├── onboardingImages.js # URLs y configuración de imágenes
│   ├── onboardingSteps.js  # Configuración de pasos
│   └── index.js           # Barrel export
├── hooks/              # Custom hooks
│   ├── useOnboardingData.js        # Hook para datos del onboarding
│   ├── useOnboardingState.js       # Hook para estado del modal
│   ├── useOnboardingLocalStorage.js # Hook para localStorage
│   └── index.js                    # Barrel export
├── services/           # Servicios y lógica de negocio
│   ├── onboardingService.js        # Servicio principal
│   ├── onboardingStorage.js        # Servicio de almacenamiento
│   └── index.js                    # Barrel export
├── types/              # Definiciones de tipos
│   └── onboarding.types.js         # JSDoc types
├── utils/              # Funciones utilitarias
│   ├── onboardingUtils.js          # Utilidades generales
│   └── index.js                    # Barrel export
├── OnboardingModal.jsx     # Modal principal refactorizado
├── OnboardingPage.jsx      # Página principal refactorizada
└── index.js               # Barrel export principal
```

## 🔧 Componentes Principales

### 1. **OnboardingModal.jsx**
Modal principal que contiene toda la presentación de la empresa.

**Props:**
- `empleados`: Array de empleados
- `show`: Boolean para mostrar/ocultar
- `onClose`: Función callback para cerrar

**Características:**
- Diseño responsivo (desktop/mobile)
- Navegación entre pasos
- Animaciones fluidas
- Accesibilidad mejorada

### 2. **OnboardingPage.jsx**
Página principal del proceso de incorporación.

**Props:**
- `managerInfo`: Información del manager
- `departamento`: Información del departamento
- `empleados`: Array de empleados

**Características:**
- Tracking de progreso
- Persistencia en localStorage
- Navegación a diferentes secciones
- Modal automático

### 3. **Componentes Modulares**

#### **StepProgress.jsx**
- Barra de progreso visual
- Lista de pasos interactiva
- Indicadores de estado

#### **StepItem.jsx**
- Item individual de paso
- Estados: completado, actual, pendiente
- Interacción con teclado

#### **Content Components**
- `WelcomeContent.jsx`: Presentación de bienvenida
- `AboutContent.jsx`: Información de la empresa
- `TeamContent.jsx`: Información del equipo y manager

## 🎣 Custom Hooks

### **useOnboardingData**
```javascript
const { auth, empleado, departamento, managerInfo } = useOnboardingData(empleados);
```
Extrae y procesa los datos del empleado actual.

### **useOnboardingState**
```javascript
const {
    currentStep,
    completed,
    showContent,
    activeContent,
    animate,
    allStepsCompleted,
    handleStepClick
} = useOnboardingState(totalSteps);
```
Maneja todo el estado del modal de onboarding.

### **useOnboardingProgress**
```javascript
const {
    visitedSteps,
    onboardingSkipped,
    progressPercentage,
    isComplete,
    markStepAsVisited,
    setOnboardingSkipped
} = useOnboardingProgress();
```
Maneja el progreso del onboarding page con persistencia.

### **useOnboardingModal**
```javascript
const {
    showOnboardingModal,
    showModal,
    hideModal,
    toggleModal
} = useOnboardingModal();
```
Controla la visibilidad del modal.

## 🛠️ Servicios

### **OnboardingService**
Servicio principal para la lógica de negocio:
- `initialize()`: Inicializar onboarding
- `navigateToStep()`: Navegar a paso específico
- `completeOnboarding()`: Completar proceso
- `skipOnboarding()`: Omitir proceso
- `shouldShowOnboarding()`: Verificar si mostrar

### **OnboardingStorageService**
Servicio para manejo de localStorage:
- `get()`, `set()`, `remove()`: Operaciones básicas
- `getVisitedSteps()`: Obtener pasos visitados
- `markStepAsVisited()`: Marcar paso como visitado
- `isOnboardingCompleted()`: Verificar completado

## ⚙️ Configuración

### **onboardingConfig.js**
Configuración principal del sistema:
```javascript
export const ONBOARDING_CONFIG = {
    animations: { contentDelay: 300, stepTransition: 500 },
    behavior: { allowSkip: true, rememberProgress: true },
    ui: { showProgressBar: true, showSkipButton: true }
};
```

### **onboardingSteps.js**
Configuración de pasos y helpers:
```javascript
export const getStepClasses = (isCompleted, isCurrent, canInteract) => { ... };
export const calculateProgress = (completed) => { ... };
```

### **onboardingImages.js**
Configuración centralizada de imágenes:
```javascript
export const ONBOARDING_IMAGES = {
    welcome: { office1: "url1", office2: "url2" },
    about: { classroom: "url3" }
};
```

## 🎨 Utilidades

### **onboardingUtils.js**
Funciones utilitarias:
- `formatProgress()`: Formatear porcentaje
- `isSafeUrl()`: Validar URLs
- `debounce()`, `throttle()`: Optimización
- `getDeviceType()`: Detección de dispositivo
- `smoothScrollTo()`: Scroll suave

## 🔄 Flujo de Trabajo

### **1. Inicialización**
```javascript
// 1. El usuario accede a OnboardingPage
// 2. useOnboardingProgress verifica localStorage
// 3. Si no está completo, muestra modal automáticamente
```

### **2. Navegación Modal**
```javascript
// 1. useOnboardingState maneja los pasos
// 2. handleStepClick actualiza estado
// 3. Renderiza contenido correspondiente
```

### **3. Navegación Page**
```javascript
// 1. handleStepClick marca paso como visitado
// 2. OnboardingService.navigateToStep navega
// 3. useOnboardingProgress actualiza localStorage
```

### **4. Completado**
```javascript
// 1. Todos los pasos visitados OR skipped
// 2. isComplete = true
// 3. Opciones de finalización disponibles
```

## 📱 Responsive Design

### **Breakpoints**
```javascript
// Mobile: < 768px
// Tablet: 768px - 1024px  
// Desktop: > 1024px
```

### **Layouts**
- **Mobile**: Stack vertical, componentes simplificados
- **Tablet**: Layout híbrido
- **Desktop**: Grid complejo, sidebar

## ♿ Accesibilidad

### **Características**
- Navegación por teclado
- Roles ARIA apropiados
- Alt texts para imágenes
- Indicadores de estado
- Soporte para `prefers-reduced-motion`

### **Ejemplo**
```javascript
<div
    role="button"
    tabIndex={canInteract ? 0 : -1}
    aria-label={`${step.title} - ${isCompleted ? 'Completado' : 'Pendiente'}`}
    onKeyDown={handleKeyDown}
>
```

## 🚀 Performance

### **Optimizaciones**
- Lazy loading de componentes
- Memoización con useMemo/useCallback
- Debounce en interacciones
- Animaciones CSS optimizadas
- Imágenes con loading="lazy"

### **Bundle Splitting**
```javascript
// Cada módulo exporta su funcionalidad específica
// Barrel exports permiten tree shaking eficiente
import { OnboardingModal } from './components';
```

## 🧪 Testing

### **Estructura para Tests**
```javascript
// Hooks testeable por separado
// Componentes con props claras
// Servicios con funciones puras
// Mocks sencillos para localStorage
```

## 🔧 Configuración de Desarrollo

### **ESLint/Prettier**
Código completamente compatible con:
- ESLint React rules
- Prettier formatting
- JSDoc standards

### **Imports**
```javascript
// Barrel exports limpios
import { useOnboardingState, OnboardingModal } from '@/Pages/Shared/Onboarding';

// Imports específicos cuando es necesario
import { OnboardingService } from '@/Pages/Shared/Onboarding/services';
```

## 📦 Instalación y Uso

### **1. Importar en tu página**
```javascript
import OnboardingPage from '@/Pages/Shared/Onboarding/OnboardingPage';
```

### **2. Usar el modal independiente**
```javascript
import { OnboardingModal } from '@/Pages/Shared/Onboarding';

<OnboardingModal 
    empleados={empleados}
    show={showModal}
    onClose={() => setShowModal(false)}
/>
```

### **3. Usar hooks en otros componentes**
```javascript
import { useOnboardingProgress } from '@/Pages/Shared/Onboarding';

const { progressPercentage, isComplete } = useOnboardingProgress();
```

## 🔮 Escalabilidad Futura

### **Extensiones Posibles**
1. **Múltiples tipos de onboarding** por rol
2. **Sistema de badges** y logros
3. **Integración con analytics**
4. **Onboarding condicional** basado en datos
5. **Modo de práctica** para re-ver contenido
6. **Internacionalización** i18n
7. **Temas personalizables**

### **Puntos de Extensión**
```javascript
// Nuevos pasos en onboardingConfig.js
// Nuevos contenidos en components/
// Nuevos hooks en hooks/
// Nuevos servicios en services/
```

## 🎯 Beneficios de la Refactorización

### **✅ Mantenibilidad**
- Separación clara de responsabilidades
- Código modular y reutilizable
- Fácil localización de bugs

### **✅ Escalabilidad**
- Estructura preparada para nuevas features
- Hooks reutilizables
- Configuración centralizada

### **✅ Performance**
- Re-renders optimizados
- Lazy loading
- Tree shaking efectivo

### **✅ Developer Experience**
- JSDoc completo
- Imports organizados
- Testing más sencillo

### **✅ User Experience**
- Mejores animaciones
- Accesibilidad completa
- Responsividad mejorada

---

**🎉 ¡El sistema está listo para producción y futuras extensiones!**
