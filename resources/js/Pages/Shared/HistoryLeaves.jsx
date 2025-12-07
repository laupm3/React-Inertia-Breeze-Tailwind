import { Head } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import HistoricLayout from '@/Components/App/LeavesManagement/HistoricLayout'
function HistoryLeaves() {

  return (
    <>
      <Head title='' />
      <HistoricLayout data={data} />
    </>
  )
}

export default HistoryLeaves

HistoryLeaves.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;