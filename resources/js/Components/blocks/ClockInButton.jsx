import React, { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/OwnUi/PrimaryButton';
import { useTranslation } from 'react-i18next';
import { useClock } from '@/hooks/ClockContext';
import ClockInTime from '@/Components/blocks/ClockInTime';
import DecisionModal from "@/Components/App/Modals/DecisionModal";
import Icon from '@/imports/LucideIcon';

function ClockInButton() {
  const { t } = useTranslation();
  const {
    recharge,
    fichaje,
    fichajes,
    disabled,
    isClockingIn,
    isPaused,
    handleClockIn,
    handlePause,
    handleMealBreak,
    handleFinalize,
    formatTime,
    tiempoTranscurrido,
    tiempoRestante,
    confirmHandleFinalize,
  } = useClock();

  const [countUp, setCountUp] = useState(tiempoTranscurrido);

  // abrir modal con mensaje condicional
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState(false);
  const [modalAction, setModalAction] = useState('');

  const openModal = ({ title, content, action }) => {
    setModalTitle(title);
    setModalContent(content);
    setModalAction(action);

    setShowModal(true);
  }

  //detectar la hora cada minuto
  useEffect(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    ClockInTime({ currentTime, fichaje, fichajes, isClockingIn, isPaused, openModal, countUp });

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      ClockInTime({ currentTime, fichaje, fichajes, isClockingIn, isPaused, openModal, countUp });
    }, 60000); // cada minuto

    return () => clearInterval(interval);
  }, [countUp, isPaused]);

  useEffect(() => {
    if (isClockingIn && !isPaused) {
      const interval = setInterval(() => {
        setCountUp(prevCount => Math.max(prevCount + 60, 0));
      }, 60000); // cada minuto

      return () => clearInterval(interval);
    }
  }, [isClockingIn, isPaused]);

  useEffect(() => {
    if (isClockingIn) {
      setCountUp(tiempoTranscurrido);
    }
  }, [isClockingIn, tiempoTranscurrido]);

  return (
    <>
      <div className="flex items-center gap-2">
        {isClockingIn && fichajes.length !== 0 && fichaje && (
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-sm font-bold text-gray-700 dark:text-gray-300">
              {isPaused ? t('Clock.pause') : t('Clock.working')}
            </div>
            <div
              className={`w-full h-8 gap-2 py-1 px-8 rounded-full text-center flex items-center justify-center ${isPaused
                ? 'bg-custom-gray-default dark:bg-custom-blackSemi text-black dark:text-white animate-pulse'
                : 'bg-custom-gray-default dark:bg-custom-blackSemi text-black dark:text-white'
                }`}
            >
              <span className="text-sm font-bold">{formatTime(countUp)}</span>
            </div>
          </div>
        )}

        {/* Botón ClockIn */}
        {fichajes.length !== 0 && fichaje && (
          fichaje?.estado_fichaje !== 'finalizado' && (
            <div className="flex items-center gap-1">
              {!isClockingIn ? (
                <PrimaryButton
                  onClick={handleClockIn}
                  className="px-3 py-1 text-sm"
                  disabled={disabled}
                >
                  {t('Clock.entrance')}
                </PrimaryButton>
              ) : (
                <div className='flex items-center gap-2 py-1 px-2 rounded-full bg-custom-gray-default dark:bg-custom-blackSemi'>
                  {!isPaused ? (
                    <>
                      {/* Descanso Obligatorio */}
                      < button
                        onClick={handleMealBreak}
                        className="flex items-center justify-center w-8 h-8 rounded-full p-1 hover:bg-sky-500/30 hover:text-sky-500 transition-colors"
                      >
                        <Icon name='Utensils' size={16} />
                      </button>
                      {/* Pausa */}
                      <button
                        onClick={handlePause}
                        className="flex items-center justify-center w-8 h-8 rounded-full p-1 hover:bg-custom-gray-light dark:hover:bg-custom-gray-semiDark transition-colors"
                      >
                        <Icon name='Pause' size={16} />
                      </button>
                      {/* Finalizar */}
                      <button
                        onClick={handleFinalize}
                        className="flex items-center justify-center w-8 h-8 text-red-500 rounded-full p-1 hover:bg-red-500/30 transition-colors"
                      >
                        <Icon name='Square' size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Reanudar */}
                      <button
                        onClick={handlePause}
                        className="flex items-center justify-center w-8 h-8 rounded-full p-1 hover:bg-sky-500/30 hover:text-sky-500 transition-colors"
                      >
                        <Icon name='Play' size={16} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div >

      {/* Modal de ClockInTime.jsx */}
      < DecisionModal
        variant="default"
        title={modalTitle}
        content={modalContent}
        open={showModal}
        icon={
          < Icon name="ClockAlert" className="text-custom-orange" />
        }
        action={() => {
          if (modalAction === 'finalize') {
            confirmHandleFinalize();
          } else if (modalAction === 'change') {
            recharge();
          }
          setShowModal(false);
        }}
        onOpenChange={() => {
          setShowModal(false)
        }}
      />
    </>
  );
}

export default ClockInButton;
