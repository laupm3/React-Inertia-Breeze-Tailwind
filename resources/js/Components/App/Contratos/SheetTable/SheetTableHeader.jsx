import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import Icon from "@/imports/LucideIcon";

function SheetTableHeader({ data }) {

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 w-full">
      <Avatar className="h-24 w-24 rounded-full">
        {data?.profile_photo_url ? (
          <AvatarImage
            src={data?.profile_photo_url}
            alt={data?.name}
          />
        ) : (
          <AvatarFallback className="rounded-full">
            {data?.name[0]}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="space-y-1 text-center sm:text-left w-full">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="text-xl font-semibold text-custom-gray-semiDark dark:text-white">
            {data?.name}
          </span>
        </div>
        <div className="text-base text-custom-gray-semiDark dark:text-gray-300">
          {data?.role?.name && data?.role?.name}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Icon name="Mail" size="16" className="text-custom-orange" />
            <span className="text-sm text-custom-gray-semiDark dark:text-gray-300 break-all">
              {data?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SheetTableHeader