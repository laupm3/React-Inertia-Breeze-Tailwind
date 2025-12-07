import { router } from "@inertiajs/react";
import { Button } from "../App/Buttons/Button";
import Icon from "@/imports/LucideIcon";

const Breadcrumbs = ({ folderStack, currentFolder, onBreadcrumbClick }) => {
  
  return (
    <nav className="text-sm text-gray-700">
      <ul className="flex">
        {/* Muestra las carpetas en el stack */}
        {folderStack.map((folder, index) => (

          <li key={index} className="flex items-center">
            {index > 0 && (
             <Icon name="ChevronRight" className="text-custom-gray-darker dark:text-custom-gray-dark"/>
            )}

            {index == 0 ? (
              <div className="flex items-center">
                <Button 
                  variant="ghost"
                  onClick={() => router.visit(route('user.files.index'))} 
                  className="text-custom-gray-darker dark:text-custom-gray-dark font-bold text-xl">
                  <Icon name="House" className={"mr-2"}/> Principal
                </Button>
              </div>
            ) : (
              <>
                {index == folderStack.length - 1 ? (
                  <Button 
                    variant="ghost"
                    onClick={() => onBreadcrumbClick(folder)} 
                    className="text-custom-orange font-bold text-xl">
                    {folder.nombre}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => onBreadcrumbClick(folder)}
                    className="text-custom-gray-darker dark:text-custom-gray-dark font-bold text-xl">
                  {folder.nombre}
                  </Button>
                )}
              </>
            )}
          </li>

        ))}
        
      </ul>
    </nav>
  );
};

export default Breadcrumbs;