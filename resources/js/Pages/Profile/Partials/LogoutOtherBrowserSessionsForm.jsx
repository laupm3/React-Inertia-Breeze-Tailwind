import { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import DialogModal from '@/Components/Legacy/DialogModal';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/OwnUi/TextInput';
import Icon from '@/imports/LucideIcon';
import { Button } from '@/Components/App/Buttons/Button';

export default function LogoutOtherBrowserSessionsForm({ sessions }) {
    const [confirmingLogout, setConfirmingLogout] = useState(false);
    const passwordInput = useRef(null);
    const form = useForm({
        password: '',
    });

    const confirmLogout = () => {
        setConfirmingLogout(true);
        setTimeout(() => passwordInput.current.focus(), 250);
    };

    const logoutOtherBrowserSessions = () => {
        form.delete(route('other-browser-sessions.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success("Sesiones cerradas correctamente");
            },
            onError: () => {
                passwordInput.current.focus();
                toast.error("Error al cerrar las sesiones. Vuelva a intentarlo.");
            },
            onFinish: () => form.reset(),
        });
    };

    const closeModal = () => {
        setConfirmingLogout(false);
        form.reset();
    };

    return (
        <form>
            <h2 className='text-lg font-bold text-custom-blue dark:text-white'>Tus dispositivos</h2>
            <div className="max-w-xl text-sm text-gray-600 dark:text-gray-400">
                Has iniciado sesión en estos navegadores y dispositivos. Si no reconoces alguno de estos dispositivos, cierra la sesión en ellos.
            </div>

            {/* Other Browser Sessions */}
            {sessions.length > 0 && (
                <div className="mt-5 space-y-3">
                    {sessions.map((session, i) => (
                        <div
                            key={i}
                            className="flex items-center bg-custom-gray-default dark:bg-custom-blackSemi rounded-full p-2"
                        >
                            <div>
                                {session.agent.is_desktop ? (
                                    <Icon name="TvMinimal" className="w-7 h-7 text-custom-gray-semiDark dark:text-white ml-4" />
                                ) : (
                                    <Icon name="Smartphone" className="w-7 h-7 text-custom-gray-semiDark dark:text-white ml-4" />
                                )}
                            </div>
                            <div className="ms-3 flex-1">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    {session.agent.platform || 'Unknown'} - {session.agent.browser || 'Unknown'}
                                </div>
                                <div className="flex items-center gap-2">
                                    {session.is_current_device ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-custom-orange/10 text-custom-orange">
                                            <span className='bg-custom-orange w-1.5 h-1.5 rounded-full mr-1.5' />
                                            Este dispositivo
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-500">
                                            Última actividad {session.last_active}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">{session.ip_address}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col items-end mt-5">
                <Button
                    type="button"
                    onClick={confirmLogout}
                    className='w-fit'
                >
                    Cerrar sesión en otros dispositivos
                </Button>
            </div>

            {/* Log Out Other Devices Confirmation Modal */}
            <DialogModal
                show={confirmingLogout}
                onClose={closeModal}
                title="Cerrar sesión en otros navegadores"
            >
                <p>Por favor, ingresa tu contraseña para confirmar que deseas cerrar sesión en todos tus otros navegadores.</p>
                <div className="mt-4">
                    <TextInput
                        ref={passwordInput}
                        value={form.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        type="password"
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        onKeyUp={(e) => e.key === 'Enter' && logoutOtherBrowserSessions()}
                        className='rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi w-full'
                    />
                    <InputError
                        message={form.errors.password}
                        className="mt-2"
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <Button
                        variant={"secondary"}
                        onClick={closeModal}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant={"destructive"}
                        className="ms-3 w-fit"
                        disabled={form.processing}
                        onClick={logoutOtherBrowserSessions}
                    >
                        Cerrar sesión en otros navegadores
                    </Button>
                </div>
            </DialogModal>
        </form>
    );
}
