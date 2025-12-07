import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Button } from '@/Components/App/Buttons/Button';
import { Input } from '@/Components/ui/input';
import Icon from '@/imports/LucideIcon';



export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Estados para mostrar/ocultar contraseñas
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const updatePassword = () => {
        put(route('user-password.update'), {
            errorBag: 'updatePassword',
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success("Contraseña actualizada correctamente");
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
                toast.error("Error al actualizar la contraseña. Vuelva a intentarlo.");
            },
        });
    };

    /* Nivel de seguridad de la contraseña */
    const passwordStrength = (password) => {
        let strength = 0;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            numbers: /[0-9]/.test(password)
        };

        if (requirements.length) strength += 1;
        if (requirements.uppercase) strength += 1;
        if (requirements.lowercase) strength += 1;
        if (requirements.special || requirements.numbers) strength += 1;

        return { strength, requirements };
    };

    const getPasswordStrengthInfo = (password) => {
        const { strength } = passwordStrength(password);

        switch (strength) {
            case 0:
                return {
                    level: 'Muy débil',
                    color: 'bg-red-500',
                    textColor: 'text-red-600',
                    description: 'La contraseña es muy insegura'
                };
            case 1:
                return {
                    level: 'Débil',
                    color: 'bg-red-400',
                    textColor: 'text-red-500',
                    description: 'Necesita más requisitos de seguridad'
                };
            case 2:
                return {
                    level: 'Regular',
                    color: 'bg-yellow-500',
                    textColor: 'text-yellow-600',
                    description: 'Contraseña moderadamente segura'
                };
            case 3:
                return {
                    level: 'Fuerte',
                    color: 'bg-green-500',
                    textColor: 'text-green-600',
                    description: 'Buena seguridad de contraseña'
                };
            case 4:
                return {
                    level: 'Muy fuerte',
                    color: 'bg-green-600',
                    textColor: 'text-green-700',
                    description: 'Excelente seguridad de contraseña'
                };
            default:
                return {
                    level: '',
                    color: 'bg-gray-300',
                    textColor: 'text-gray-500',
                    description: ''
                };
        }
    };

    return (
        <div className={`flex flex-col`}>
            {/* Formulario */}
            <form onSubmit={updatePassword} className="flex flex-col">
                <p className='mt-8 lg:mt-0 text-lg font-bold text-custom-blue dark:text-white'>Actualizar Contraseña</p>
                <p className='text-xs w-3/4 text-custom-gray-semiDark dark:text-custom-gray-semiLight'>
                    Asegúrate de que tu cuenta esté usando una contraseña larga y aleatoria para mantenerte seguro.
                </p>

                <div className='space-y-5'>
                    <div className="flex flex-col mt-6 lg:flex-row items-center">
                        <InputLabel
                            htmlFor="current_password"
                            value="Contraseña Actual"
                            className='w-full font-bold lg:w-1/3 text-custom-blue dark:text-white'
                        />
                        <div className="relative w-full">
                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type={showCurrent ? "text" : "password"}
                                className="block w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi pr-10"
                                autoComplete="current-password"
                            />
                            <Button
                                type="button"
                                variant={"secondary"}
                                size={"icon"}
                                tabIndex={-1}
                                className="absolute inset-y-0 right-0 flex items-center text-custom-gray-darker  dark:text-custom-white"
                                onClick={() => setShowCurrent((v) => !v)}
                            >
                                {showCurrent ? (
                                    <Icon name="Eye" className="w-5 h-5" />
                                ) : (
                                    <Icon name="EyeOff" className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                        <InputError message={errors.current_password} className="mt-2" />
                    </div>

                    <div className="flex flex-col lg:flex-row items-center">
                        <InputLabel
                            htmlFor="password"
                            value="Nueva contraseña"
                            className='w-full font-bold lg:w-1/3 text-custom-blue dark:text-white '
                        />
                        <div className="flex flex-col w-full">
                            <div className="relative w-full">
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type={showNew ? "text" : "password"}
                                    className="block w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi pr-10"
                                    autoComplete="new-password"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    tabIndex={-1}
                                    className="absolute inset-y-0 right-0 flex items-center text-custom-gray-darker dark:text-custom-white"
                                    onClick={() => setShowNew((v) => !v)}
                                >
                                    {showNew ? (
                                        <Icon name="Eye" className="w-5 h-5" />
                                    ) : (
                                        <Icon name="EyeOff" className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                            {/* Indicador de seguridad y requisitos solo si hay contraseña */}
                            {data.password && (
                                <div className="mt-2">
                                    {/* Barras de progreso */}
                                    <div className="flex flex-row justify-between gap-2 mb-3">
                                        {[1, 2, 3, 4].map((level) => {
                                            const { strength } = passwordStrength(data.password);
                                            const { color } = getPasswordStrengthInfo(data.password);
                                            return (
                                                <div
                                                    key={level}
                                                    className={`h-2 w-1/4 rounded-full transition-all duration-300 ${strength >= level ? color : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Mensaje de nivel y descripción */}
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-medium ${getPasswordStrengthInfo(data.password).textColor}`}>
                                                Seguridad: {getPasswordStrengthInfo(data.password).level}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {getPasswordStrengthInfo(data.password).description}
                                            </span>
                                        </div>

                                        {/* Requisitos de contraseña */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {(() => {
                                                const { requirements } = passwordStrength(data.password);
                                                return [
                                                    { key: 'length', text: 'Mínimo 8 caracteres', met: requirements.length },
                                                    { key: 'uppercase', text: 'Una mayúscula', met: requirements.uppercase },
                                                    { key: 'lowercase', text: 'Una minúscula', met: requirements.lowercase },
                                                    { key: 'special', text: 'Carácter especial o número', met: requirements.special || requirements.numbers },
                                                ].map((req) => (
                                                    <div key={req.key} className="flex items-center space-x-2">
                                                        <div className={`w-2 h-2 rounded-full ${req.met ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                        <span className={`${req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            {req.text}
                                                        </span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex flex-col lg:flex-row items-center">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirmar contraseña"
                            className='w-full font-bold lg:w-1/3 text-custom-blue dark:text-white'
                        />
                        <div className="relative w-full">
                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type={showConfirm ? "text" : "password"}
                                className="block w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi pr-10"
                                autoComplete="new-password"
                            />
                            <Button
                                type='button'
                                variant={"secondary"}
                                size={"icon"}
                                tabIndex={-1}
                                className="absolute inset-y-0 right-0 flex items-center text-custom-gray-darker dark:text-custom-white"
                                onClick={() => setShowConfirm((v) => !v)}
                            >
                                {showConfirm ? (
                                    <Icon name="Eye" className="w-5 h-5" />
                                ) : (
                                    <Icon name="EyeOff" className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    {/* Save */}
                    <div className='flex col-span-full justify-end items-center gap-2 mt-8'>
                        <Button type="submit" className='w-fit px-6'>
                            Guardar cambios
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
