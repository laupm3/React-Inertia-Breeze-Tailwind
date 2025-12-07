import HalfMoonProgressBar from '@/Components/HalfMoonProgressBar';
import Pill from '@/Components/App/Pills/Pill'
import BlockCard from '@/Components/OwnUi/BlockCard';
import { useTranslation } from 'react-i18next'; // Hook para traducción
import { router } from '@inertiajs/react';
import { Button } from '@/Components/App/Buttons/Button';

function Vacation() {
  const { t } = useTranslation('vacation'); // Inicializar traducción

  const titleProgress = '18/30';

  const vacationStatus = {
    nonDefined: 'gray',
    accepted: 'green',
    delayed: 'orange',
    rejected: 'red',
    solicitationError: 'rose',
  };

  const currentStatus = vacationStatus.nonDefined;

  const statusText = {
    gray: t('Vacation.nonDefined'),
    green: t('Vacation.accepted'),
    orange: t('Vacation.delayed'),
    red: t('Vacation.rejected'),
    rose: t('Vacation.solicitationError'),
  };

  return (
    <BlockCard>
      <Pill color={currentStatus} text={statusText[currentStatus]} />
      <HalfMoonProgressBar 
        progress={70} 
        title={titleProgress} 
        subtitle={t('Vacation.daysRemaining')} 
      />
      <Button
        variant={'primary'}
        className='w-full'
        onClick={() => router.visit("user/vacaciones")}
      >
        Solicitar vacaciones
      </Button>
      <hr className="w-full my-4 border-2 border-custom-gray-default dark:border-custom-blackSemi" />
      <Button
        variant={'secondary'}
        className='w-full'
        onClick={() => router.visit('user/solicitudes')}
      >
        Solicitar permisos
      </Button>
    </BlockCard>
  );
}

export default Vacation;
