import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Icon from "@/imports/LucideIcon";

const FileDropZone = () => {
  const onDrop = useCallback((acceptedFiles) => {
    console.log(acceptedFiles);
    // Aquí puedes manejar los archivos subidos
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      {/* input dropzone */}
      <div
        {...getRootProps()}
        className={`hidden md:flex flex-col items-center justify-center border-dashed border-2 h-40 p-6 rounded-xl cursor-pointer transition ${
          isDragActive ? 'border-custom-orange/50 bg-custom-orange/20' : 'border-custom-gray-dark'
        }`}
      >
        <input {...getInputProps()} id='file-input' />
        <Icon
          name='Upload'
          className={`mb-2 h-5 w-5 ${isDragActive ? 'text-custom-orange/50' : 'text-custom-gray-dark'}`}
        />
        {isDragActive ? (
          <p className="text-custom-orange/50">¡Suelta los archivos aquí!</p>
        ) : (
          <p className="text-custom-gray-dark">Haga clic aquí o arrastre el documento</p>
        )}
      </div>

      {/* input manual */}
      <div className="mt-4">
        <div className="relative">
          <label
            htmlFor="file-input"
            className="flex items-center w-60 md:w-96 gap-2 rounded-full cursor-pointer border-2 border-custom-gray-semiLight dark:border-custom-gray-darker overflow-hidden"
          >
            <span className="flex flex-row items-center justify-center px-4 py-2 bg-custom-gray-semiLight hover:bg-custom-gray-semiLight/50 dark:bg-custom-gray-darker hover:bg-custom-gray-darker/50 text-xs text-custom-gray-darker dark:text-custom-gray-light rounded-l-full transition">
              <Icon name="Upload" className="w-4 h-4 mr-2" />
              Choose File
            </span>
            <span className="text-xs text-custom-gray-dark dark:text-custom-gray-light">
              No file chosen
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FileDropZone;
