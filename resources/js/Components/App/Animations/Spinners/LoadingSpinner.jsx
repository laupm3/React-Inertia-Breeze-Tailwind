import { useTranslation } from 'react-i18next';

export default function LoadingSpinner() {
    const { t } = useTranslation(['common']);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-custom-gray-darker/50">
            <div className="hidden h-full w-1/2 lg:block" />

            <div className="flex h-full w-full items-center justify-center p-4 lg:w-1/2">
                <div className="flex items-center space-x-3 rounded-full bg-custom-white p-7 shadow-xl dark:bg-custom-blackSemi">
                    <div
                        role="status"
                        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-custom-orange border-t-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    />
                    <span className="text-custom-blackSemi dark:text-custom-gray-default">
                        {t("loading", { ns: "common" })}...
                    </span>
                </div>
            </div>
        </div>
    );
}
