import Icon from "@/imports/LucideIcon";

/**
 * Get the icon based on the type of modality
 * 
 * @param {Object} props
 * @param {String} props.modalidad the type of modality
 *  
 * @returns {JSX.Element} Icon component
 */
export default function GetModalidadIcon({ modalidad, className }) {
    
    const MODALIDAD_ICONS = {
        'Presencial': <Icon name="Building" size={16} className={className} />,
        'Remoto': <Icon name="Laptop" size={16} className={className} />,
        'Híbrido': <Icon name="HousePlug" size={16} className={className} />
    }

    return MODALIDAD_ICONS[modalidad] || MODALIDAD_ICONS.Presencial;
}