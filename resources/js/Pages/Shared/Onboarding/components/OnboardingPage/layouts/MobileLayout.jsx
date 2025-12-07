import CompletionMessage from '../sections/CompletionMessage.jsx';
import ProgressSection from '../sections/ProgressSection.jsx';
import ManagerInfo from '../sections/ManagerInfo.jsx';
import OnboardingSteps from '../sections/OnboardingSteps.jsx';
import DocumentsSection from '../sections/DocumentsSection.jsx';
import SocialMediaSection from '../sections/SocialMediaSection.jsx';
import { PresentationSection, QuickAccessSection } from '../sections/CommonSections.jsx';

/**
 * Layout para vista móvil del onboarding
 * @param {Object} props - Props del componente
 * @returns {JSX.Element}
 */
const MobileLayout = ({
    // Estados
    showCompletionMessage,
    progressPercentage,
    isOnboardingComplete,
    visitedSteps,
    managerInfo,
    departamento,
    
    // Funciones
    handleSkipOnboarding,
    handleCompleteToDashboard,
    handlePresentationClick,
    handleStepClick
}) => {
    return (
        <div className="block xl:hidden p-4 space-y-6">
            <PresentationSection 
                onPresentationClick={handlePresentationClick}
                isMobile={true}
            />

            <CompletionMessage 
                show={showCompletionMessage}
                isMobile={true}
            />

            <ProgressSection
                progressPercentage={progressPercentage}
                isComplete={isOnboardingComplete}
                onSkip={handleSkipOnboarding}
                onComplete={handleCompleteToDashboard}
                isMobile={true}
            />

            <QuickAccessSection isMobile={true} />

            <ManagerInfo 
                managerInfo={managerInfo}
                departamento={departamento}
                isMobile={true}
            />

            <OnboardingSteps
                visitedSteps={visitedSteps}
                onStepClick={handleStepClick}
                isMobile={true}
            />

            <DocumentsSection isMobile={true} />

            <SocialMediaSection isMobile={true} />
        </div>
    );
};

export default MobileLayout;
