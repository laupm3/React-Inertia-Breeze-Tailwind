function ProgressPoints({ data = [], horizontal = false }) {

  const containerClass = horizontal ? 'flex-row' : 'flex-col';
  const lineClass = (finished) => finished ? 'bg-custom-orange' : 'bg-custom-gray-semiLight dark:bg-custom-gray-semiDark';
  const textClass = (finished) => finished ? 'text-custom-orange' : 'text-custom-gray-dark';

  return (
    <div className={`flex ${containerClass} p-0 m-0 ${horizontal && 'mt-10 mb-32'}`}>
      {data.map((item, index) => (
        <div key={index} className={`flex ${horizontal ? 'flex-row ml-[-8px]' : 'flex-col'} items-start`}>
          {index !== 0 && (
            <div className={`${horizontal ? 'w-24 md:w-32 h-2 ml-2' : 'w-2 h-16 ml-2 my-[-7px]'} ${lineClass(item.finished)}`} />
          )}
          <div className={`relative flex ${horizontal ? 'flex-col mt-[-8px]' : 'items-center'} gap-4`}>
            <div className={`w-6 h-6 rounded-full ${lineClass(item.finished)}`} />
            <div className={`${horizontal ? 'absolute rotate-[30deg] mt-20 w-24 md:w-48' : ''}`}>
              <p className={`text-sm ${textClass(item.finished)}`}>{item.title}</p>
              <p className='text-xs font-bold text-custom-gray-semiLight dark:text-custom-gray-semiDark'>{item.finishedDate}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProgressPoints;

