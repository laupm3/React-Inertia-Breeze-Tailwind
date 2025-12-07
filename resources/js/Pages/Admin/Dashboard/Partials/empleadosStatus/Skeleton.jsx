import { Skeleton as SkeletonBlock } from "@/Components/ui/skeleton";

function Skeleton() {
  return (
    <section className='grid grid-cols-3 gap-11'>
      <SkeletonBlock className="h-28 w-full" />

      <SkeletonBlock className="h-28 w-full" />

      <SkeletonBlock className="h-28 w-full" />

      <SkeletonBlock className="h-28 w-full" />

      <SkeletonBlock className="h-28 w-full" />

      <SkeletonBlock className="h-28 w-full" />
    </section>
  )
}

export default Skeleton