import CompletionMessage from '../sections/CompletionMessage.jsx';
import ProgressSection from '../sections/ProgressSection.jsx';
import ManagerInfo from '../sections/ManagerInfo.jsx';
import OnboardingSteps from '../sections/OnboardingSteps.jsx';
import DocumentsSection from '../sections/DocumentsSection.jsx';
import SocialMediaSection from '../sections/SocialMediaSection.jsx';
import { PresentationSection, QuickAccessSection } from '../sections/CommonSections.jsx';

/**
 * Layout para vista desktop del onboarding
 * @param {Object} props - Props del componente
 * @returns {JSX.Element}
 */
const DesktopLayout = ({
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
        <div className="hidden xl:grid xl:grid-cols-5 xl:grid-rows-5 w-full h-full gap-4 p-6">
            {/* Sidebar izquierdo */}
            <section className="col-span-2 row-span-5">
                <CompletionMessage 
                    show={showCompletionMessage}
                    isMobile={false}
                />
                
                <PresentationSection 
                    onPresentationClick={handlePresentationClick}
                    isMobile={false}
                />

                <ProgressSection
                    progressPercentage={progressPercentage}
                    isComplete={isOnboardingComplete}
                    onSkip={handleSkipOnboarding}
                    onComplete={handleCompleteToDashboard}
                    isMobile={false}
                />

                <OnboardingSteps
                    visitedSteps={visitedSteps}
                    onStepClick={handleStepClick}
                    isMobile={false}
                />

                <SocialMediaSection isMobile={false} />
            </section>

            {/* Contenido principal*/}
            <div className="col-span-3 row-span-5 col-start-3">
                <section className="flex flex-row gap-4">
                    <QuickAccessSection isMobile={false} />
                    
                    <ManagerInfo 
                        managerInfo={managerInfo}
                        departamento={departamento}
                        isMobile={false}
                    />
                </section>

                <DocumentsSection isMobile={false} />
            </div>
        </div>
    );
};

export default DesktopLayout;
