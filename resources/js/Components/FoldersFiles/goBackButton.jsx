import { router } from "@inertiajs/react";

const GoBackButton = ({ folderStack, setFolderStack, currentFolder, setCurrentFolder, homeHash }) => {
  const goBack = (e) => {
    e.preventDefault();
    if (currentFolder.parent.hash == homeHash) {
      router.visit(route('user.files.index'));
    } else {
      router.visit(route('user.files.navigate', { hash: currentFolder.parent.hash }), { preserveState: true });
    }
  };

  return (
    <>
      {currentFolder.hash != homeHash && (
        <div
          onClick={goBack}
          //className={`flex items-center ml-2 text-gray-700 hover:text-custom-orange dark:text-custom-white dark:hover:text-custom-orange ${folderStack.length > 1 ? 'visible' : 'invisible'}`}
          className={`flex items-center ml-2 text-gray-700 hover:text-custom-orange dark:text-custom-white dark:hover:text-custom-orange`}
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <button className="font-semibold">Volver</button>

        </div>

      )}
    </>
  );
}

export default GoBackButton;
