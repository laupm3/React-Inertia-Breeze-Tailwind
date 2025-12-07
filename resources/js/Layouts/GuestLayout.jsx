import ApplicationLogo from '@/Components/ApplicationLogo';
import LanguageSelector from '@/Components/Legacy/LanguageSelector';
import ThemeSelector from '@/Components/Legacy/ThemeSelector';
import LoginImgLight from '@/../images/login/loginimage.png';
import LoginImgDark from '@/../images/login/loginimagedark.png';
import ShowNotificationFromJetstream from '@/Components/App/JetStream/ShowNotificactionFromJestream';
import { Toaster } from "@/Components/ui/sonner";
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from "sonner";

export default function Guest({ children }) {
    const { flash } = usePage().props;

    useEffect(() => {
        // Mostrar mensaje de usuario baneado
        if (flash?.banned_message) {
            toast.error(flash.banned_message, {
                duration: 10000,
                important: true,
            });
        }
        
        // Mostrar otros mensajes de estado
        if (flash?.status) {
            toast.info(flash.status, {
                duration: 5000,
            });
        }
    }, [flash]);

    return (
        <div className="flex justify-center items-center h-screen bg-custom-white dark:bg-custom-blackLight">
            <div className="w-1/2 h-screen hidden lg:block">
                <img src={LoginImgLight} alt="ImagenLogo" className="object-cover w-full h-full rounded-r-3xl shadow-xl block dark:hidden" />
                <img src={LoginImgDark} alt="ImagenLogo" className="object-cover w-full h-full rounded-r-3xl shadow-xl hidden dark:block" />
            </div>

            <div className="w-full h-screen lg:w-1/2 xs:p-24 SM:P-12 p-0 lg:p-12 bg-LoginImage dark:bg-LoginImageDark bg-cover bg-center sm:block lg:bg-none dark:lg:bg-none lg:rounded-none sm:place-content-center place-content-end">
                <div className='bg-custom-white dark:bg-custom-blackLight lg:bg-none sm:rounded-3xl rounded-t-3xl p-12 md:h-1/2'>
                    <div className='mb-4'>
                        <ApplicationLogo />
                    </div>

                    <div className="absolute flex right-5 top-3 gap-3">
                        <LanguageSelector />
                        <ThemeSelector />
                    </div>

                    {/* Mostrar mensaje de usuario baneado de forma prominente */}
                    {flash?.banned_message && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{flash.banned_message}</span>
                            </div>
                        </div>
                    )}

                    {children}
                    <ShowNotificationFromJetstream />
                    {/* <Toaster
                        richColors
                        expand={true}
                        theme={() => document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                    /> */}
                </div>
            </div>
        </div>
    );
}