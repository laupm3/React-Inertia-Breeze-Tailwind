import { useState } from 'react'
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Editor } from '@/Components/App/Notifications/Yoopta';

function NotificationEditor() {
    const [value, setValue] = useState(prevValue);
    const viewer = useMemo(() => createYooptaEditor(), []);
  
    const onChangeValue = (value) => {
      setValue(value);
    };

  return (
    <>
        <Head title="Yoopta" />

        <div className='flex flex-col lg:flex-row justify-start w-full gap-4 lg:gap-16 p-4 lg:p-8'>
          <Editor value={value} onChange={onChangeValue} />
        </div>
    </>
  )
}

export default NotificationEditor

NotificationEditor.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
