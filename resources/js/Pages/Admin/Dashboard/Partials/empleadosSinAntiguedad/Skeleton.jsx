import { Skeleton as SkeletonBlock } from "@/Components/ui/skeleton";

function Skeleton() {
  return (
    <section className='flex flex-col gap-11'>
      <div className='flex w-full items-center justify-center'>
        <SkeletonBlock className="h-48 w-48 rounded-full" />
      </div>

      <SkeletonBlock className="h-4 w-[350px]" />

      <div className='flex gap-4'>
        <SkeletonBlock className="h-10 w-14" />
        <SkeletonBlock className="h-10 w-full" />
      </div>

      <div className='flex flex-col gap-2'>
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
      </div>
    </section>
  )
}

export default Skeleton