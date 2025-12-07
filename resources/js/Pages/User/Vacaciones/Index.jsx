import { Head } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import HistoricLayout from '@/Pages/User/Vacaciones/Partials/HistoricLayout'

function Index() {

  return (
    <>
      <Head title='Mis Vacaciones' />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-semibold text-xl text-custom-blue dark:text-custom-orange leading-tight mb-4">
            Mis Vacaciones
          </h2>
          <HistoricLayout />
        </div>
      </div>
    </>
  )
}

export default Index

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;