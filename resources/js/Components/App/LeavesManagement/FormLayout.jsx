import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Events from '@/Blocks/Events/Events'
import Icon from '@/imports/LucideIcon'

function FormLayout({ children }) {
  const { t } = useTranslation('vacationRequest');

  const [viewAlert, setViewAlert] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    const start = new Date(newStartDate);
    const today = new Date();
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setViewAlert(diffDays < 15);

    // Reset end date if it's before the new start date
    if (endDate && new Date(endDate) < new Date(newStartDate)) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
  };

  return (
    <>
      <div className='flex flex-col lg:flex-row justify-center w-full p-14 gap-20'>
        <div className='w-full lg:w-2/5'>
          <Events />
        </div>

        <div className='w-full lg:w-3/5 space-y-8'>
          {viewAlert && (
            <div className='flex flex-col gap-4 p-4 bg-yellow-500/20 rounded-2xl'>
              <div className='flex flex-row items-center gap-4'>
                <Icon name="TriangleAlert" size="24" className="text-custom-orange" />
                <h3 className='font-bold text-custom-orange'>{t('VacationRequest.remember')}</h3>
              </div>
              <p className='text-sm text-custom-orange'>{t('VacationRequest.warning')}</p>
            </div>
          )}

          <form action="" className="flex flex-col gap-4 mb-8">
            <h2 className="text-xl font-bold text-custom-blackLight dark:text-custom-white">
              {t('VacationRequest.startDate')}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleStartDateChange}
                className="dark:[color-scheme:dark] bg-custom-gray w-full dark:bg-custom-blackSemi rounded-full p-2 border-2 border-custom-gray-light dark:border-custom-gray-darker"
              />
            </div>
            <h2 className="text-xl font-bold text-custom-blackLight dark:text-custom-white">
              {t('VacationRequest.endDate')}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <input
                type="date"
                name="endDate"
                value={endDate}
                min={startDate}
                onChange={handleEndDateChange}
                className="dark:[color-scheme:dark] bg-custom-gray w-full dark:bg-custom-blackSemi rounded-full p-2 border-2 border-custom-gray-light dark:border-custom-gray-darker"
              />
            </div>
            
            <div>
              {children}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default FormLayout
