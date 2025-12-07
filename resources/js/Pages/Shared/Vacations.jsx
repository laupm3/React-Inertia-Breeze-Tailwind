import react, { useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react'
import FormLayout from '@/Components/App/LeavesManagement/FormLayout'
import PrimaryButton from '@/Components/OwnUi/PrimaryButton';
import ProgressPoints from '@/Components/App/LeavesManagement/ProgressPoints';
import HalfMoonProgressBar from '@/Components/HalfMoonProgressBar';
import { router } from '@inertiajs/react';
import Pill from '@/Components/App/Pills/Pill';
import STATUS_PERMISO_COLOR_MAP from '@/Components/App/Pills/constants/StatusPermisoMapColor';

export default function Vacations() {
  const { t } = useTranslation('vacationRequest');

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

  const titleProgress = '18/30';
  const phase = 4;

  return (
    <>
      <Head title="Vacations" />

      <FormLayout>
        <div className='w-full flex flex-col gap-4 mb-8'>
          <PrimaryButton type="submit" className="w-fit self-end">
            {t('VacationRequest.confirmRequest')}
          </PrimaryButton>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-4">
          <div className="w-full lg:w-1/2">
            <ProgressPoints data={data} />
          </div>
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-6">
            <HalfMoonProgressBar
              progress={70}
              title={titleProgress}
              subtitle={t('Vacation.daysRemaining')}
            />
            <Pill
              children='En revisión'
              identifier='En revisión'
              mapColor={STATUS_PERMISO_COLOR_MAP}
              className='text-sm'
            />
            <PrimaryButton
              className="w-full sm:w-2/3 lg:w-full bg-custom-orange hover:bg-custom-orange/90"
              onClick={() => router.get(route('history-vacations'))}
            >
              {t('VacationRequest.viewHistory')}
            </PrimaryButton>
          </div>
        </div>
      </FormLayout>
    </>
  )
}

Vacations.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;