import React from 'react'
import { Skeleton } from "@/Components/ui/skeleton";

function SheetTableSkeleton() {
  return (
    <div className="flex flex-col w-full space-y-8">
      <div className="w-full flex items-center space-x-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        
        <div className="flex flex-col justify-center space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>

      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default SheetTableSkeleton