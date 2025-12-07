import BlockCard from '@/Components/OwnUi/BlockCard';
import Icon from '@/imports/LucideIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Components/ui/tooltip";

function SheetTableContent({ data }) {

  /**
   * Section component to display a title and value pair
   * 
   * @param {string} title - The title of the section
   * @param {string} value - The value of the section
   * @returns {JSX.Element}
   */
  function Section({ title, value }) {
    return (
      <section className="flex -my-1 justify-between items-center gap-4 border-y-2 border-custom-gray-default dark:border-custom-blackSemi overflow-hidden">
        <div className='flex items-center justify-start py-3 pl-4 w-48 bg-custom-gray-default dark:bg-custom-blackSemi'>
          <span className="text-sm text-custom-black dark:text-custom-white font-semibold">{title}</span>
        </div>

        <div className="w-1/2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-custom-black dark:text-custom-white opacity-70 text-nowrap">{value}</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-96">
                <span className="text-sm text-custom-black dark:text-custom-white">{value}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </section>
    )
  }

  /**
   * Department component to display department information
   * 
   * @param {Object} param0 - Props for the component
   * @returns {JSX.Element}
   */
  function Users({ user }) {
    return (
      <section className="flex items-center justify-between gap-3">
        <div className="flex flex-row items-center gap-2">
          <img src={user.profile_photo_url} alt={user.name} className="w-8 h-8 rounded-full" />
        </div>
        <div className="flex flex-col gap-2 mr-auto">
          <span className="text-sm text-custom-black dark:text-custom-white opacity-70">{user.name}</span>
          <span className="text-sm text-custom-black dark:text-custom-white opacity-70">{user.role?.name}</span>
        </div>

      </section>
    )
  }

  return (
    <>
      <BlockCard title='Información'>
        <div className='rounded-3xl overflow-auto border-4 border-custom-gray-default dark:border-custom-blackSemi'>
          <Section title="Nombre" value={data.name} />
          <Section title="Creador" value={data.owner.name} />
          <Section title="Descripción" value={data.description} />
        </div>
      </BlockCard>

      <BlockCard title='Miembros'>
        <div className="flex flex-col gap-4 px-2">
          {data.users.length > 0 ? (
            data.users.map((user, index) => (
              <Users key={index} user={user} />
            ))
          ) : (
            <span className="flex gap-4 text-sm text-custom-black dark:text-custom-white opacity-70">
              <Icon name='AlertTriangle' size='16' />
              No hay Miembros
            </span>
          )}
        </div>
      </BlockCard>
    </>
  )
}

export default SheetTableContent