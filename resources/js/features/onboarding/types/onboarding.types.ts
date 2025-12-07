// ===== TYPES Y INTERFACES =====

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  url?: string;
}

export interface OnboardingImages {
  welcome: {
    office1: string;
    office2: string;
    header: string;
    meeting: string;
    team: string;
  };
  about: {
    classroom: string;
  };
}

export interface ManagerInfo {
  nombreCompleto?: string;
  email?: string;
  telefono?: string;
  extension_centrex?: string;
  user?: {
    profile_photo_url?: string;
  };
}

export interface Departamento {
  nombre?: string;
  manager?: ManagerInfo;
}

export interface Empleado {
  user: {
    id: number;
  };
  departamentos: Departamento[];
}

export interface OnboardingData {
  auth: {
    user?: {
      id: number;
    };
  };
  empleado?: Empleado;
  departamento?: Departamento;
  managerInfo?: ManagerInfo;
}

export interface OnboardingState {
  currentStep: number;
  completed: boolean[];
  showContent: boolean;
  activeContent: number;
  animate: boolean;
  allStepsCompleted: boolean;
}

export interface OnboardingProgress {
  visitedSteps: Record<string, boolean>;
  onboardingSkipped: boolean;
  isComplete: boolean;
  progressPercentage: number;
}

export interface OnboardingModalProps {
  empleados: Empleado[];
  show: boolean;
  onClose: () => void;
}

export interface OnboardingPageProps {
  managerInfo?: ManagerInfo;
  departamento?: Departamento;
  empleados: Empleado[];
}

export interface StepItemProps {
  step: OnboardingStep;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  canInteract: boolean;
  onClick: () => void;
}

export interface ContentSectionProps {
  animate: boolean;
  managerInfo?: ManagerInfo;
  departamento?: Departamento;
}

// ===== ENUMS =====
export enum OnboardingStepId {
  WELCOME = 'welcome',
  ABOUT = 'about',
  TEAM = 'team'
}

export enum OnboardingPageSteps {
  STEP1 = 'step1',
  STEP2 = 'step2',
  STEP3 = 'step3',
  STEP4 = 'step4',
  STEP5 = 'step5'
}

// ===== CONSTANTS TYPES =====
export type OnboardingStepKey = keyof typeof OnboardingPageSteps;
export type OnboardingContentType = 'welcome' | 'about' | 'team';

// ===== STORAGE KEYS =====
export const STORAGE_KEYS = {
  ONBOARDING_VISITED: 'onboardingVisited',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  ONBOARDING_SKIPPED: 'onboardingSkipped',
  VISITED_STEPS: 'visitedSteps'
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
