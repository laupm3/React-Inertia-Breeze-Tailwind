import { useState } from 'react';
import { useSidebar } from "@/Components/ui/sidebar";
import {  Menu  } from 'lucide-react';
import Icon from "@/imports/LucideIcon";

export function CustomTriggerMovile() {
  const { toggleSidebar } = useSidebar();
  const [isRight, setIsRight] = useState(true); 

  const handleToggle = () => {
    toggleSidebar();    
    setIsRight(!isRight); 
  };

  return (
    <button 
      onClick={handleToggle} 
       className="md:hidden w-8 h-8 flex items-center justify-center p-1 bg-custom-gray-light dark:bg-custom-gray-darker hover:bg-custom-gray-dark rounded-full focus:outline-none"
    >
      
        <Icon name='Menu' className="m-auto h-4 w-4" />
      
    </button>
  );
}
