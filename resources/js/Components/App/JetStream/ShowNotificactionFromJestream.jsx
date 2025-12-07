import { usePage } from "@inertiajs/react";
import { toast } from "sonner";

/**
 * Show a toast notification based on the banner received from jetstream
 * 
 * @returns {JSX.Element} ShowNotificationFromJetstream
 */
const ShowNotificationFromJetstream = () => {
    const page = usePage();
    const flash = page.props.jetstream.flash;
    const { banner, bannerStyle } = flash;

    /**
     * Map the type of toast to show based on the type of bannerStyle received from jetstream
     */
    const TYPE_TOAST_MAP = {
        "success": "success",
        "warning": "warning",
        "danger": "error"
    }

    /**
     * Get the type of toast to show based on the type of bannerStyle received from jetstream
     * 
     * @param {String} type Type of bannerStyle received from jetstream
     * @returns {STRING} Type of toast to show
     */
    const getTypeToast = (type) => TYPE_TOAST_MAP[type] || "success";

    return <>
        {flash.banner &&
            <>
                {toast[getTypeToast(bannerStyle)](banner)}
            </>
        }
    </>

}

export default ShowNotificationFromJetstream;