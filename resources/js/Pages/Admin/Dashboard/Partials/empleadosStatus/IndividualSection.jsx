import react from 'react'
import BlockCard from '@/Components/OwnUi/BlockCard';
import Icon from '@/imports/LucideIcon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

function IndividualSection({ title, data, onOpenDialog, maxUsers }) {

  return (
    <BlockCard
      title={title}
      className='min-h-28 h-fit'
    >
      {data.length > 0 ? (
        <section
          className='flex flex-wrap w-full h-full gap-4 cursor-pointer items-start justify-center'
          onClick={() => {
            onOpenDialog(data, title);
          }}
        >
          {data.slice(0, maxUsers).map((user) => (
            <TooltipProvider key={user.id} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger as="div">
                  <img
                    src={user.profile_photo_url}
                    alt={user.full_name}
                    className='w-10 h-10 rounded-full cursor-pointer'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {user.full_name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {data.length > maxUsers && (
            <div
              className="w-10 h-10 rounded-full bg-custom-gray bg-custom-gray-light dark:bg-custom-gray-darker text-muted-foreground flex items-center justify-center text-sm font-semibold"
            >
              +{data.length - maxUsers}
            </div>
          )}
        </section>
      ) : (
        <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
          <Icon name='Info' size='16' />
          <span className='text-center'>Sin empleados activos</span>
        </div>
      )}
    </BlockCard>
  )
}

export default IndividualSection