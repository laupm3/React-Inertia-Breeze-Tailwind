import { Head, usePage } from '@inertiajs/react';

import { useState, useEffect } from "react";

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import TwoFactorAuthenticationForm from '@/Pages/Profile/Partials/TwoFactorAuthenticationForm';
import LogoutOtherBrowserSessionsForm from '@/Pages/Profile/Partials/LogoutOtherBrowserSessionsForm';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import FastProfile from '@/Pages/Profile/Partials/FastProfile';

import BlockCard from '@/Components/OwnUi/BlockCard';

import Appearance from './Partials/Appearance';
import WorkData from './Partials/WorkData';

export default function Show({ confirmsTwoFactorAuthentication, sessions }) {
    const user = usePage().props.auth.user;
    const jetstream = usePage().props.jetstream;
    const [activeTab, setActiveTab] = useState("profile" || "appearance");

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, []);

    return (
        <>
            <Head title="Perfil de Usuario" />
            <div className=" mx-auto h-full w-full py-7 xl:px-8 ">
                <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 lg:gap-8">

                    {jetstream.managesProfilePhotos && (
                        <FastProfile
                            user={user}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            jetstream={jetstream}
                        />
                    )}

                    <div className="w-full overflow-hidden md:col-span-2 lg:col-span-3 md:pl-4 lg:pl-8">

                        {/* Información del perfil*/}
                        {activeTab === "profile" && jetstream.canUpdateProfileInformation && (
                            <div className="h-full md:min-h-[calc(100vh-200px)]">
                                <UpdateProfileInformationForm user={user} hidePhotoSection={true} />
                            </div>
                        )}

                        {/* Datos Laborales */}
                        {activeTab === "WorkData" && (
                            <div className="h-full md:min-h-[calc(100vh-200px)]">
                                <WorkData user={user} />
                            </div>
                        )}

                        {/* Seguridad y privacidad */}
                        {activeTab === "2fa" && (
                            <div className="h-full md:min-h-[calc(100vh-200px)]">
                                <BlockCard title="Seguridad">
                                    <div className="space-y-6 ">
                                        {/* Two Factor Authentication and Session Management */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                                            {/* Two Factor Authentication Section */}
                                            {jetstream.canManageTwoFactorAuthentication && (
                                                <div className="p-6">
                                                    <TwoFactorAuthenticationForm
                                                        requiresConfirmation={confirmsTwoFactorAuthentication}
                                                    />
                                                </div>
                                            )}

                                            {/* Session Management Section */}
                                            <div className="p-6">
                                                <LogoutOtherBrowserSessionsForm
                                                    sessions={sessions}
                                                    compactLayout={true}
                                                />
                                            </div>
                                        </div>

                                        {/* Password Management Section */}
                                        {jetstream.canUpdatePassword && (
                                            <div className="p-6">
                                                <UpdatePasswordForm />
                                            </div>
                                        )}
                                    </div>
                                </BlockCard>
                            </div>
                        )}

                        {/* Apariencia y presentación */}
                        {activeTab === "appearance" && (
                            <div className="h-full md:min-h-[calc(100vh-200px)]">
                                <Appearance />
                            </div>
                        )}

                        {/* Eliminar account */}
                        {activeTab === "delete-account" && jetstream.hasAccountDeletionFeatures && (
                            <div className="h-full md:min-h-[calc(100vh-200px)]">
                                <BlockCard title="Eliminar Cuenta">
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Una vez que elimines tu cuenta, todos sus recursos y datos serán eliminados permanentemente.
                                        </p>
                                        <DeleteUserForm />
                                    </div>
                                </BlockCard>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;