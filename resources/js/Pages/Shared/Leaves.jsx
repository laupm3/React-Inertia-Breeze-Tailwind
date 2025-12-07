import { useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import { useTranslation } from 'react-i18next';
import FormLayout from '@/Components/App/LeavesManagement/FormLayout'
import PrimaryButton from '@/Components/OwnUi/PrimaryButton';
import ProgressPoints from '@/Components/App/LeavesManagement/ProgressPoints';

const maxLength = 250

function Leaves() {
  const { t } = useTranslation('vacationRequest');
  const [note, setNote] = useState('')

  const data = [
    {
      id: 1,
      title: t('VacationRequest.requestedVacations'),
      finished: true,
      finishedDate: '2023-05-01',
    },
    {
      id: 2,
      title: t('VacationRequest.aprovedByBoss'),
      finished: true,
      finishedDate: '2023-05-01',
    },
    {
      id: 3,
      title: t('VacationRequest.aprovedByHR'),
      finished: false,
      finishedDate: '',
    }
  ]

  return (
    <>
      <Head title="Vacations" />

      <FormLayout>
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-custom-blackLight dark:text-custom-white">
            {t('Leaves.information')}
          </h2>
          
          <div className='flex flex-col sm:flex-row gap-4 sm:gap-8'>
            <div className='flex flex-col gap-2 w-1/2'>
              <p className='font-semibold'>
                {t('Leaves.typeOfLeave')}
              </p>

              <select name="justify" className='bg-custom-gray-default dark:bg-custom-blackSemi border-none rounded-full'>
                <option value="left">{t('Leaves.left')}</option>
                <option value="center">{t('Leaves.center')}</option>
                <option value="right">{t('Leaves.right')}</option>
              </select>
            </div>

            <div className='flex flex-col gap-2 w-1/2 relative'>
              <p className='font-semibold'>
                {t('Leaves.note')}
              </p>
              <textarea
                placeholder={`${t('Leaves.placeholder')}...`}
                className="bg-custom-gray-default dark:bg-custom-blackSemi border-none h-28 max-h-64 rounded-xl dark:dark-scrollbar"
                maxLength={maxLength}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <p className='absolute bottom-2 right-2 text-xs text-custom-blackLight dark:text-custom-white'>
                {note.length}/{maxLength}
              </p>
            </div>
          </div>
        </div>
        
        <div className='w-full flex flex-col gap-4 mt-4'>
          <PrimaryButton type="submit" className="w-fit self-end">
            {t('Leaves.confirmRequest')}
          </PrimaryButton>
        </div>

        <div className='mt-12'>
          <ProgressPoints horizontal data={data} />
        </div>
      </FormLayout>
    </>
  )
}

export default Leaves

Leaves.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
