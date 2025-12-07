import { Skeleton } from "@/Components/ui/skeleton";

function SkeletonHorario() {
  return (
    <div className="space-y-4">
      {/* <div className='flex gap-4 items-center'>
        <Skeleton className="h-24 min-w-24 rounded-full" />
        <Skeleton className="h-24 w-full" />

        <Skeleton className="h-24 w-full ml-8" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div> */}

      <div className='flex justify-between gap-2 pt-8'>
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-12 w-32" />
      </div>

      <Skeleton className="h-20 w-full rounded-t-3xl" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export default SkeletonHorario