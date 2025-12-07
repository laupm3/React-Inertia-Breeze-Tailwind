import ConfirmFooter from "@/Components/App/Modals/Footers/ConfirmFooter";
import DestructiveFooter from "@/Components/App/Modals/Footers/DestructiveFooter";
import DefaultFooter from "@/Components/App/Modals/Footers/DefaultFooter";

/**
 * Returns a footer component based on the type
 * 
 * @param {Object} props
 * @param {String} props.type Variant of the footer
 *  
 * @returns {JSX.Element} Footer component
 */
export default function GetTypeFooter({ type, onClose, actionText, isLoading, ...props }) {

    const FOOTER_TYPES_INTERFACE = {
        confirm: <ConfirmFooter onClose={onClose} actionText={actionText} isLoading={isLoading} {...props} />,
        destructive: <DestructiveFooter onClose={onClose} actionText={actionText} isLoading={isLoading} {...props} />,
        default: <DefaultFooter onClose={onClose} actionText={actionText} isLoading={isLoading} {...props} />
    };

    return FOOTER_TYPES_INTERFACE[type] || FOOTER_TYPES_INTERFACE.default;
}