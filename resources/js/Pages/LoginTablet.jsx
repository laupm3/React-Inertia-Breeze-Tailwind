import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '@/Components/OwnUi/PrimaryButton';
import InputError from '@/Components/InputError';
import LoginImg from '../../images/login/frontpage.jpg';
import ApplicationLogo from '@/Components/ApplicationLogo';
import TextInput from '@/Components/OwnUi/TextInput';

export default function LoginTablet() {
    const { t } = useTranslation('welcome');

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onSuccess: () => {
                window.location = route('clock-in');
            },
        });
    };

    return (
        <>
            <Head title="Login" />


            <div className="flex flex-row justify-center items-center bg-custom-gray-default dark:bg-custom-blackLight">

                <div className="w-1/2 h-screen hidden lg:block">
                    <img src={LoginImg} alt="ImagenLogo" className="object-cover w-full h-full" />
                </div>

                <div className="w-full h-screen lg:w-1/2 p-7 sm:p-24 bg-LoginImage bg-cover bg-center sm:block lg:bg-none lg:rounded-none place-content-center">
                    <form onSubmit={submit} className="flex flex-col m-auto lg:w-[80%] lg:min-w-96 space-y-6 bg-custom-blackLight p-6 rounded-3xl">
                        {/* Logo o título */}
                        <div className="text-center">
                          <ApplicationLogo/>
                        </div>

                        {/* Email */}
                        <div>
                            <TextInput
                                type="email"
                                value={data.email}
                                placeholder="Email"
                                onChange={e => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <TextInput
                                type="password"
                                value={data.password}
                                placeholder="Contraseña"
                                onChange={e => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Botón de acceso */}
                        <PrimaryButton 
                            type="submit"
                            className="w-full justify-center py-3 text-lg"
                            disabled={processing}
                        >
                            {t('login.email')}
                        </PrimaryButton>

                        {/* boton para inicio de administradores */}
                        <button 
                            onClick={() => window.location = route('clock-in-admin')}
                            type="button"
                            className='px-4 py-2 w-fit text-xs bg-custom-gray-semiLight dark:bg-custom-gray-darker rounded-xl
                            hover:bg-custom-gray-light/50 dark:hover:bg-custom-gray-darker/50 duration-300'
                        >
                          {t('login.admin')}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}