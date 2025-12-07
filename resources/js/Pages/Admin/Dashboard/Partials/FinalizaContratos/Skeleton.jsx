import { Skeleton as SkeletonBlock } from "@/Components/ui/skeleton";

function Skeleton() {
  return (
    <section className='flex flex-row h-full justify-between gap-8'>
      <div className='flex flex-col w-1/3 h-full justify-between gap-4'>
        <SkeletonBlock className="h-6 w-[250px]" />

        <div className='flex flex-col w-full gap-10'>
          <div className='flex flex-row w-full items-center gap-4'>
            <SkeletonBlock className="h-4 w-14" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
          <div className='flex flex-row w-full items-center gap-4'>
            <SkeletonBlock className="h-4 w-14" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
          <div className='flex flex-row w-full items-center gap-4'>
            <SkeletonBlock className="h-4 w-14" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        </div>
      </div>

      <div className='flex flex-col w-2/3 h-full justify-between gap-4 max-h-[400px] overflow-auto'>
        <SkeletonBlock className="h-28 w-full" />
        <SkeletonBlock className="h-28 w-full" />
        <SkeletonBlock className="h-28 w-full" />
      </div>
    </section>
  )
}

export default Skeleton