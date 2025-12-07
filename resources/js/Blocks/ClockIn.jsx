import { useState, useEffect, useRef, useCallback } from 'react';
import HalfMoonProgressBar from '@/Components/HalfMoonProgressBar';
import PrimaryButton from '@/Components/OwnUi/PrimaryButton';
import BlockCard from '@/Components/OwnUi/BlockCard';
import { useTranslation } from 'react-i18next';
import { usePage } from '@inertiajs/react';
import { useClock } from '@/hooks/ClockContext';
import Icon from '@/imports/LucideIcon';
import { toast } from 'sonner';

//import Rest from '@/../images/logotipos/rest.png';
//import Logo from '@/../images/logotipos/logo.png';

function ClockIn() {
  const { t } = useTranslation();
  const user = usePage().props.auth.user;
  const {
    fichaje,
    fichajes,
    loading,
    disabled,
    setFichajeSelected,
    isClockingIn,
    currentEntry,
    currentExit,
    handlePause,
    handleMealBreak,
    handleClockIn,
    handleFinalize,
    isPaused,
    formatTime,
    tiempoTranscurrido,
  } = useClock();

  const intervalRef = useRef(null);

  const [countUp, setCountUp] = useState(tiempoTranscurrido);

  // Estado para el temporizador
  useEffect(() => {
    if (isClockingIn) {
      setCountUp(tiempoTranscurrido);
    }
  }, [isClockingIn, tiempoTranscurrido, fichaje]);

  // temporizador para la cuenta alante
  useEffect(() => {
    if (isClockingIn && !isPaused) {
      const interval = setInterval(() => {
        setCountUp(prevCount => Math.max(prevCount + 60, 0));
      }, 60000); // cada minuto

      return () => clearInterval(interval);
    }
  }, [isClockingIn, isPaused]);

  // Solicitar permisos para notificaciones al cargar el componente
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isClockingIn && isPaused) {
      intervalRef.current = setInterval(() => {
        // Mostrar notificación con toast
        toast.warning(t('ClockIn.pauseReminder'), {
          duration: 5000,
        });

        // Enviar notificación al sistema si los permisos están concedidos
        if (Notification.permission === "granted") {
          new Notification(t('ClockIn.pauseReminder'), {
            body: t('ClockIn.resumeReminder'),
          });
        }
      }, 5 * 60 * 1000); // Cada 5 minutos
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isClockingIn, isPaused, t]);

  const calculateProgress = useCallback(() => {
    if (!isClockingIn || !fichaje?.tiempo_total) return 0;

    const progress = Math.floor((countUp / fichaje.tiempo_total) * 100);
    return Math.min(progress, 100);
  }, [isClockingIn, fichaje?.tiempo_total, countUp]);

  return (
    <BlockCard>
      <h2 className='text-3xl font-bold text-custom-blackLight dark:text-custom-white'>
        {t('ClockIn.goodMorning')},
        <span className='text-custom-orange'> {user.name}</span>
      </h2>

      {/* si hay un fichaje o no */}
      {!loading && (
        !fichaje ? (
          <span className='flex flex-col items-center gap-2'>
            {/* <img src={user.empleado_id ? Rest : Logo} alt="Rest Logo" className="w-full max-w-64 h-auto" /> */}

            {user.empleado_id &&
              <p className='text-xl font-bold text-custom-blue dark:text-custom-gray-semiLight'>
                Hoy no tienes horarios programados
              </p>
            }
          </span>
        ) : (
          <>
            <div className='flex items-center justify-between flex-row gap-2'>
              <div className='flex w-full items-center flex-row overflow-hidden text-nowrap gap-2 p-2 rounded-full bg-custom-gray-default dark:bg-custom-blackSemi duration-300'>
                <Icon name='Building' className='w-5 min-w-5 text-custom-orange' />
                <p className='text-[10px]'>{fichaje?.centro || 'Sin asignación'}</p>
              </div>
              <div className='flex w-full items-center flex-row overflow-hidden text-nowrap gap-2 p-2 rounded-full bg-custom-gray-default dark:bg-custom-blackSemi'>
                <Icon name='Building2' className='w-5 min-w-5 text-custom-orange' />
                <p className='text-[10px]'>{fichaje?.empresa || 'Sin asignación'}</p>
              </div>
            </div>

            {/* selector de contratos en el caso de que exista mas de uno */}
            {fichajes.length > 1 ? (
              <div className='flex w-full items-center flex-row overflow-hidden text-nowrap gap-2 p-2 rounded-full bg-custom-gray-default dark:bg-custom-blackSemi'>
                {fichajes.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (!isClockingIn) {
                        setFichajeSelected(item);
                      }
                    }}
                    className={`p-2 rounded-full w-full items-center flex justify-center
                  ${item?.horario_id === fichaje?.horario_id && 'bg-custom-white shadow-sm dark:bg-custom-blackLight shadow-black/20'}
                  ${isClockingIn ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <p className='text-[10px]'>{item.asignacion}</p>
                  </div>
                ))}
              </div>
            ) : (
              fichaje?.asignacion && (
                <div className='flex items-center flex-row gap-2 p-2 rounded-full bg-custom-gray-default dark:bg-custom-blackSemi'>
                  <Icon name='BriefcaseBusiness' className='w-5 min-w-5 text-custom-orange' />
                  <p className='text-[10px]'>{fichaje?.asignacion || 'Sin asignación'}</p>
                </div>
              )
            )}

            <HalfMoonProgressBar
              color={
                countUp >= fichaje?.tiempo_total
                  ? 'green-500'
                  : 'custom-orange'
              }
              progress={calculateProgress()}
              paused={isPaused}
              title={
                fichaje?.estado_fichaje === 'finalizado'
                  ? 'Finalizado'
                  : countUp >= fichaje?.tiempo_total
                    ? `+ ${formatTime(countUp - fichaje?.tiempo_total)}`
                    : countUp
                      ? formatTime(countUp)
                      : tiempoTranscurrido
                        ? formatTime(tiempoTranscurrido)
                        : '--:--'
              }
              subtitle={
                fichaje?.estado_fichaje === 'finalizado'
                  ? ''
                  : 'Horas trabajadas'
              }
            />

            <div className='flex items-center flex-row gap-2'>
              <div className='flex items-center flex-col gap-2 bg-custom-gray-default dark:bg-custom-blackSemi rounded-l-xl p-4 w-1/2'>
                <div className='text-center'>
                  <h2 className='text-2xl font-bold text-custom-blackLight dark:text-custom-white'>
                    {t('ClockIn.entry')}
                  </h2>
                  <p className='text-sm text-custom-gray-dark dark:text-custom-gray-light'>
                    ({fichaje?.hora_entrada || '--:--'})
                  </p>
                </div>
                <h2 className='text-2xl font-bold text-custom-blackLight dark:text-custom-white'>
                  {currentEntry}
                </h2>
              </div>

              <div className='flex items-center flex-col gap-2 bg-custom-gray-default dark:bg-custom-blackSemi rounded-r-xl p-4 w-1/2'>
                <div className='text-center'>
                  <h2 className='text-2xl font-bold text-custom-gray-dark dark:text-custom-gray-light'>
                    {t('ClockIn.exit')}
                  </h2>
                  <p className='text-sm text-custom-gray-dark dark:text-custom-gray-light'>
                    ({fichaje?.hora_salida || '--:--'})
                  </p>
                </div>
                <h2 className='text-2xl font-bold text-custom-gray-dark dark:text-custom-gray-light'>
                  {currentExit}
                </h2>
              </div>
            </div>

            {fichajes.length !== 0 && fichaje && (
              fichaje?.estado_fichaje !== 'finalizado' && (
                !isClockingIn ? (
                  <PrimaryButton
                    onClick={handleClockIn}
                    disabled={disabled}
                  >
                    {t('ClockIn.clockIn')}
                  </PrimaryButton>
                ) : (
                  <div className='flex items-center gap-2 p-1 rounded-full bg-custom-gray-default dark:bg-custom-blackSemi'>
                    {!isPaused ? (
                      <>
                        {/* Descanso Obligatorio */}
                        < button
                          onClick={handleMealBreak}
                          className="flex items-center justify-center w-full h-8 rounded-full p-1 hover:bg-sky-500/30 hover:text-sky-500 transition-colors"
                        >
                          <Icon name='Utensils' size={16} />
                        </button>
                        {/* Pausa */}
                        <button
                          onClick={handlePause}
                          className="flex items-center justify-center w-full h-8 rounded-full p-1 hover:bg-custom-gray-light dark:hover:bg-custom-gray-semiDark transition-colors"
                        >
                          <Icon name='Pause' size={16} />
                        </button>
                        {/* Finalizar */}
                        <button
                          onClick={handleFinalize}
                          className="flex items-center justify-center w-full h-8 text-red-500 rounded-full p-1 hover:bg-red-500/30 transition-colors"
                        >
                          <Icon name='Square' size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Reanudar */}
                        <button
                          onClick={handlePause}
                          className="flex items-center justify-center w-full h-8 rounded-full p-1 hover:bg-sky-500/30 hover:text-sky-500 transition-colors"
                        >
                          <Icon name='Play' size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )
              )
            )}
          </>
        )
      )}
    </BlockCard>
  );
}

export default ClockIn;
