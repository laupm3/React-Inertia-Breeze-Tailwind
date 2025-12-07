import { useState, useEffect } from 'react';
import { usePage, router, useForm } from '@inertiajs/react';
import ConfirmsPassword from '@/Components/Legacy/ConfirmsPassword';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import axios from 'axios';
import { Button } from '@/Components/App/Buttons/Button';

export default function TwoFactorAuthenticationForm({ requiresConfirmation }) {
    const user = usePage().props.auth.user;

    const [enabling, setEnabling] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [setupKey, setSetupKey] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [confirming, setConfirming] = useState(false);
    const confirmationForm = useForm({ code: '' });

    const twoFactorEnabled = !enabling && user?.two_factor_enabled;

    useEffect(() => {
        if (!twoFactorEnabled) {
            confirmationForm.reset();
        }
    }, [twoFactorEnabled]);

    const enableTwoFactorAuthentication = () => {
        setEnabling(true);

        router.post(route('two-factor.enable'), {}, {
            preserveScroll: true,
            onSuccess: () => Promise.all([
                showQrCode(),
                showSetupKey(),
                showRecoveryCodes(),
            ]),
            onFinish: () => {
                setEnabling(false);
                setConfirming(requiresConfirmation);
            },
        });
    };

    const showQrCode = async () => {
        const response = await axios.get(route('two-factor.qr-code'));
        setQrCode(response.data.svg);
    };

    const showSetupKey = async () => {
        const response = await axios.get(route('two-factor.secret-key'));
        setSetupKey(response.data.secretKey);
    };

    const showRecoveryCodes = async () => {
        const response = await axios.get(route('two-factor.recovery-codes'));
        setRecoveryCodes(response.data);
    };

    const confirmTwoFactorAuthentication = () => {
        confirmationForm.post(route('two-factor.confirm'), {
            errorBag: "confirmTwoFactorAuthentication",
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setConfirming(false);
                setQrCode(null);
                setSetupKey(null);
            }
        });
    };

    const regenerateRecoveryCodes = () => {
        axios.post(route('two-factor.recovery-codes')).then(() => showRecoveryCodes());
    };

    const disableTwoFactorAuthentication = () => {
        setDisabling(true);

        router.delete(route('two-factor.disable'), {
            preserveScroll: true,
            onSuccess: () => {
                setDisabling(false);
                setConfirming(false);
            },
        });
    };

    const twoFactorAuthenticationStatus = (twoFactorEnabled && !confirming)
        ? 'Has habilitado la autenticación de dos factores.'
        : (twoFactorEnabled && confirming)
            ? 'Termina de habilitar la autenticación de dos factores.'
            : 'No has habilitado la autenticación de dos factores.';

    return (
        <div className="md:max-h-[800px] md:overflow-y-auto md:pr-2 md:[scrollbar-width:thin] md:[scrollbar-color:rgba(156,163,175,0.3)_transparent] md:[&::-webkit-scrollbar]:w-[6px] md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar-thumb]:bg-[rgba(156,163,175,0.3)] md:[&::-webkit-scrollbar-thumb]:rounded-[20px]">
            <div>
                <>
                    <h2 className='text-lg font-bold text-custom-blue dark:text-white'>Verificación en Dos Pasos</h2>
                    <div className=" max-w-xl text-sm text-gray-600 dark:text-gray-400">
                        <p>Agrega seguridad adicional a tu cuenta usando la autenticación de dos factores.</p>
                    </div>

                    {twoFactorEnabled && (
                        <>
                            {qrCode && (
                                <>
                                    <div className="mt-4 max-w-xl text-sm text-gray-600 dark:text-gray-400">
                                        {confirming ? (
                                            <p className="font-semibold">
                                                Para finalizar la activación de la autenticación de dos factores, escanea el siguiente código QR usando tu teléfono o aplicación de autenticación, o ingresa la clave de configuración y proporciona el código OTP generado.
                                            </p>
                                        ) : (
                                            <p>Escanea este código QR con tu aplicación de autenticación.</p>
                                        )}
                                    </div>

                                    <div className="mt-4 p-2 inline-block bg-white" dangerouslySetInnerHTML={{ __html: qrCode }} />

                                    {setupKey && (
                                        <div className="mt-4 max-w-xl text-sm text-gray-600 dark:text-gray-400">
                                            <p className="font-semibold">
                                                Clave de configuración: <span dangerouslySetInnerHTML={{ __html: setupKey }} />
                                            </p>
                                        </div>
                                    )}

                                    {confirming && (
                                        <div className="mt-4">
                                            <InputLabel htmlFor="code" value="Código" />

                                            <TextInput
                                                id="code"
                                                value={confirmationForm.code}
                                                onChange={(e) => confirmationForm.setData('code', e.target.value)}
                                                type="text"
                                                name="code"
                                                className="block mt-1 w-1/2"
                                                inputMode="numeric"
                                                autoFocus
                                                autoComplete="one-time-code"
                                                onKeyUp={(e) => e.key === 'Enter' && confirmTwoFactorAuthentication()}
                                            />

                                            <InputError message={confirmationForm.errors.code} className="mt-2" />
                                        </div>
                                    )}
                                </>
                            )}

                            {(recoveryCodes.length > 0 && !confirming) && (
                                <>
                                    <div className="mt-4 max-w-xl text-sm text-gray-600 dark:text-gray-400">
                                        <p className="font-semibold">Códigos de Recuperación</p>
                                    </div>

                                    <div className="grid gap-1 max-w-xl mt-4 px-4 py-4 font-mono text-sm bg-gray-100 dark:bg-gray-900 dark:text-gray-100 rounded-lg">
                                        {recoveryCodes.map((code) => (
                                            <div key={code}>{code}</div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <div className="mt-5">
                        {!twoFactorEnabled ? (
                            <ConfirmsPassword onConfirmed={enableTwoFactorAuthentication}>
                                <Button
                                    variant={"primary"}
                                    className='w-fit px-6'
                                    disabled={enabling}
                                >
                                    Habilitar
                                </Button>
                            </ConfirmsPassword>
                        ) : (
                            <>
                                {confirming && (
                                    <ConfirmsPassword onConfirmed={confirmTwoFactorAuthentication}>
                                        <Button
                                            variant={"primary"}
                                            className={`me-3 ${enabling ? 'opacity-25' : ''}`}
                                            disabled={enabling}
                                        >
                                            Confirmar
                                        </Button>
                                    </ConfirmsPassword>
                                )}

                                <ConfirmsPassword onConfirmed={regenerateRecoveryCodes}>
                                    {(recoveryCodes.length === 0 && !confirming) && (
                                        <Button
                                            variant={"secondary"}
                                            className={'me-3'}>
                                            Regenerar
                                        </Button>
                                    )}
                                </ConfirmsPassword>

                                <ConfirmsPassword onConfirmed={showRecoveryCodes}>
                                    {(recoveryCodes.length === 0 && !confirming) && (
                                        <Button
                                            variant={"secondary"}
                                            className={'me-3'}>
                                            Mostrar Códigos
                                        </Button>
                                    )}
                                </ConfirmsPassword>

                                <ConfirmsPassword onConfirmed={disableTwoFactorAuthentication}>
                                    {confirming && (
                                        <Button
                                            variant={"secondary"}
                                            disabled={disabling}
                                            className={disabling ? 'opacity-25' : ''}
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                </ConfirmsPassword>

                                <ConfirmsPassword onConfirmed={disableTwoFactorAuthentication}>
                                    {!confirming && (
                                        <div className="py-4">
                                            <Button
                                                variant={"destructive"}
                                                className={`${disabling ? 'opacity-25' : ''}`}
                                                disabled={disabling}
                                            >
                                                Deshabilitar
                                            </Button>
                                        </div>
                                    )}
                                </ConfirmsPassword>
                            </>
                        )}
                    </div>

                    <h3 className="text-xs font-medium mt-6 text-custom-gray-dark">
                        ({twoFactorAuthenticationStatus})
                    </h3>
                </>
            </div>
        </div>
    );
}
