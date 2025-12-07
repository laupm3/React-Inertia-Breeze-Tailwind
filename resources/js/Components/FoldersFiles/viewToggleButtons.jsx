const ViewToggleButtons = ({ view, setView, currentFolder, homeHash }) => {
    return (
        <>
            {currentFolder.hash != homeHash && (
                <div className="flex space-x-4 mr-2">
                    <button className={`p-2 rounded relative ${view === 'list'}`} onClick={() => setView('list')}>
                        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 6.75H23.625M9 13.5H23.625M9 20.25H23.625M3.375 6.75H3.38625M3.375 13.5H3.38625M3.375 20.25H3.38625" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {view === 'list' && (
                            <div className="w-4 h-4 bg-custom-orange rounded-full absolute top-5 right-1 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>

                    <button className={`p-2 rounded relative ${view === 'grid'}`} onClick={() => setView('grid')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
                        </svg>
                        {view === 'grid' && (
                            <div className="w-4 h-4 bg-custom-orange rounded-full absolute top-5 right-1 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                </div>

            )}
        </>

    );
};

export default ViewToggleButtons;
