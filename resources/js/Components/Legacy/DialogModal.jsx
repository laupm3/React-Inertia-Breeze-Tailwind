import Modal from "@/Components/Modal";

export default function DialogModal({ show = false, maxWidth = 'xl', closeable = true, onClose, title, children, footer }) {

    const close = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <Modal
            show={show}
            maxWidth={maxWidth}
            closeable={closeable}
            onClose={close}
        >
            <div className="px-6 py-4  border-custom-gray-dark bg-custom-white dark:bg-custom-gray-sidebar">
                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {title}
                </div>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    {children}
                </div>
            </div>
            <div className="flex flex-row justify-end px-6 pb-4 bg-custom-white dark:bg-custom-gray-sidebar text-end">
                {footer}
            </div>
        </Modal>
    );
}