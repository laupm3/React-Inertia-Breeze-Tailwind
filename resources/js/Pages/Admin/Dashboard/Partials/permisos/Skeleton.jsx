import { Skeleton as SkeletonBlock } from "@/Components/ui/skeleton";

function Skeleton() {
  return (
    <section className='flex flex-col gap-11'>
      <div className='flex flex-row justify-between items-center'>
        <SkeletonBlock className="h-6 w-[250px]" />
        <SkeletonBlock className="h-6 w-[150px]" />
      </div>

      <div className='flex w-full items-center justify-center'>
        <SkeletonBlock className="h-48 w-48 rounded-full" />
      </div>
    </section>
  )
}

export default Skeleton