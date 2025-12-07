import Modal from "@/Components/Modal";
import Icon from "@/imports/LucideIcon";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function CustomModal ({ show = false, maxWidth = 'lg', closeable = true, onClose, title, children, footer, iconName, iconClass}) {
    const { t } = useTranslation('forgotPassword'); // Usar traducción para el modal
    const [isModalOpen, setModalOpen] = useState(show);

    const handleClose = () => {
        setModalOpen(false);
        if (onClose) {
            onClose();
        }
    };

    return (
        <Modal
            show={isModalOpen}
            maxWidth={maxWidth}
            closeable={closeable}
            onClose={handleClose}
        >
            <div className="bg-white dark:bg-custom-blackSemi rounded-xl shadow-lg px-5 py-5">
                <button 
                    className="absolute top-3 right-3 h-6 w-6 text-gray-500 hover:text-gray-700" 
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <Icon name="X"/>
                </button>
                <div >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {iconName && <Icon name={iconName} className={iconClass}/> }{/* Cambiado para usar iconName */}
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {title}
                            </h3>
                            <p className="mt-1 text-md text-custom-gray-semiDark dark:text-custom-gray-light">
                                {children}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
