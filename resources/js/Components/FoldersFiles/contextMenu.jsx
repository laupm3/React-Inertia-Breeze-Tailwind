import { useEffect } from "react";
import Icon from "@/imports/LucideIcon";

const ContextMenu = ({ x, y, options, onClose }) => {
  // Cierra el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = () => onClose();
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="w-[200px] absolute bg-custom-gray-light text-black shadow-md rounded-md border z-50"
      style={{ top: y, left: x}}
      onContextMenu={(e) => {e.stopPropagation(); e.preventDefault();}}
    >
      {options.map((option, index) => (
        <div
          key={index}
          onClick={option.action}
          className="w-full px-4 py-1.5 text-left bg-gray-100 hover:bg-orange-500/80 dark:text-black dark:hover:bg-custom-gray-semiLight cursor-pointer rounded-md "
        >
          <span className={`inline-flex gap-2 items-center ${option.iconLabel == "Trash2" ? 'text-red-600 font-bold' : ''} `}>
            <Icon name={option.iconLabel} className="h-5" />
            {option.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
