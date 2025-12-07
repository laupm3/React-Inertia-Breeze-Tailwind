import { Head } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import HistoricLayout from '@/Components/App/LeavesManagement/HistoricLayout'
import { useTranslation } from 'react-i18next';

function HistoryVacations() {
    const { t } = useTranslation('vacationRequest');

    /* Datos de ejemplo */
    const data = [
        {
            id: 1,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 2,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 1,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 2,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 1,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 2,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 1,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 2,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 1,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 2,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 1,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 2,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 1,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 2,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 1,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
        {
            id: 2,
            initialDate: '2024-04-26',
            finalDate: '2024-05-14',
            finalPartial: '',
            data: [
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
            ],
            type: 'Permiso de maternidad',
            description: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua dolor sit amet'
        },
    ]

    return (
        <>
            <Head title='' />

            <HistoricLayout data={data} />
        </>
    )
}

export default HistoryVacations

HistoryVacations.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;