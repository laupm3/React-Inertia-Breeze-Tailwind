import ClockIn from '@/Blocks/ClockIn'
import Events from '@/Blocks/Events/Events'
import Vacation from '@/Blocks/Vacation'
import AccesosRapidos from '@/Blocks/AccesosRapidos'

export default function BlocksLayout({ bloques }) {
    
    return (
        <>
            <div className='flex flex-col lg:flex-row justify-center w-full  p-6'>
                <div className=' lg:w-1/3 flex flex-col  lg:mb-0 lg:pr-2'>
                    <ClockIn />
                </div>
                <div className=' lg:w-1/3 flex flex-col lg:mb-0 lg:px-2'>
                    <Events />
                    
                </div>
                <div className=' lg:w-1/3 flex flex-col lg:pl-2'>
                    <AccesosRapidos />
                    <Vacation />
                </div>
            </div>

            {
                // Cuando se realice la siguiente versión de los bloques, el objetivo es cargar dinámicamente bloques y ejecutar cierta lógica para darle estilo al grid
                /* <div className='grid flex-col lg:flex-row justify-center w-full p-6 grid-cols-3'>
                {blocks.map((Block, index) => (
                    <div key={index} className='flex flex-col lg:mb-0 lg:pr-2'>
                        <Block />
                    </div>
                ))}
                </div> */
            }
        </>
    )
}