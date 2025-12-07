function BlockCard({children, title, className, className2, marginLeft = 'ml-10', }) {
  return (
    <div className={`flex flex-col w-full ${className2}`}>
      <div className={`flex flex-row items-center justify-start w-fit ${marginLeft} mb-[-15px] px-2 bg-custom-white dark:bg-custom-blackLight z-0`}>
        <span className='flex text-xl text-custom-blue dark:text-custom-white font-bold'>{title}</span>  
      </div>
      <div className={`rounded-3xl p-4 md:p-6 w-full h-full mb-4 border-4 md:border-4 border-custom-gray-default dark:border-custom-blackSemi space-y-4 md:space-y-6 overflow-auto ${className}`}>
        {children}
      </div>
    </div>
  )
}

export default BlockCard
