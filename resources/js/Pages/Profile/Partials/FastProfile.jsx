import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';

import Icon from '@/imports/LucideIcon';
import { Button } from '@/Components/App/Buttons/Button';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";


export default function FastProfile({ user, activeTab, setActiveTab, jetstream }) {

    // Photo-related logic
    const [photoPreview, setPhotoPreview] = useState(null);
    const photoInput = useRef(null);

    const { data, setData, post, delete: destroy, errors } = useForm({
        _method: 'PUT',
        name: user.name,
        email: user.email,
        photo: null,
    });

    const selectNewPhoto = () => {
        photoInput.current.click();
    };

    const updatePhotoPreview = () => {
        const photo = photoInput.current.files[0];

        if (!photo) {
            return;
        }

        // Validate file size (max 5MB)
        if (photo.size > 5 * 1024 * 1024) {
            toast.error('El archivo es demasiado grande. Máximo 5MB.');
            return;
        }

        // Validate file type
        if (!photo.type.startsWith('image/')) {
            toast.error('Tipo de archivo inválido. Solo se permiten imágenes.');
            return;
        }

        const reader = new FileReader();
        setData('photo', photo);

        reader.onload = (e) => {
            setPhotoPreview(e.target.result);
            toast.success('Foto seleccionada correctamente.');
        };

        reader.readAsDataURL(photo);
    };

    const updateProfilePhoto = () => {
        if (data.photo) {
            post(route('user-profile-information.update'), {
                errorBag: 'updateProfileInformation',
                preserveScroll: true,
                onSuccess: (response) => {
                    setPhotoPreview(null);
                    clearPhotoFileInput();
                    toast.success('Foto de perfil actualizada correctamente.');
                },
                onError: (errors) => {
                    toast.error('Error al actualizar la foto de perfil.');
                }
            });
        }
    };

    const deletePhoto = () => {
        destroy(route('current-user-photo.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setPhotoPreview(null);
                clearPhotoFileInput();
                toast.success('Foto de perfil eliminada correctamente.');
            },
            onError: () => {
                toast.error('Error al eliminar la foto de perfil.');
            }
        });
    };

    const clearPhotoFileInput = () => {
        if (photoInput.current) {
            photoInput.current.value = null;
        }
        setData('photo', null);
    };

    // Navigation items configuration - simplificado
    const navigationItems = [
        {
            key: 'profile',
            icon: 'User',
            label: 'Perfil y datos personales',
            condition: jetstream.canUpdateProfileInformation
        },
        {
            key: 'WorkData',
            icon: 'Briefcase',
            label: 'Datos laborales',
            condition: true
        },
        {
            key: '2fa',
            icon: 'Shield',
            label: 'Seguridad y privacidad',
            condition: true
        },
        {
            key: 'appearance',
            icon: 'Palette',
            label: 'Apariencia y presentación',
            condition: true
        },
        {
            key: 'notifications',
            icon: 'Bell',
            label: 'Notificaciones',
            condition: true
        }
    ];

    return (
        <div className="w-full overflow-hidden">
            {/* Header simplificado */}
            <div className="p-6">
                {/* Profile Photo Section - simplificado */}
                <div className="flex flex-col items-center">
                    <input
                        id="photo"
                        ref={photoInput}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={updatePhotoPreview}
                    />

                    <div className="relative group">
                        {photoPreview ? (
                            <span
                                className="block rounded-full w-40 h-40 bg-cover bg-no-repeat bg-center border border-gray-200 dark:border-gray-600"
                                style={{ backgroundImage: `url('${photoPreview}')` }}
                            />
                        ) : (
                            <img
                                src={user.profile_photo_url}
                                alt={user.name}
                                className="rounded-full h-40 w-40 object-cover border border-gray-200 dark:border-gray-600"
                            />
                        )}

                        {/* Dropdown Menu para acciones de foto */}
                        {!photoPreview && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute top-1 right-3"
                                        aria-label="Opciones de foto"
                                    >
                                        <Icon name="Camera" className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="dark:bg-custom-blackSemi">
                                    <DropdownMenuItem onSelect={selectNewPhoto}>
                                        <Icon name="SquarePen" className="w-4 mr-2" /> Cambiar foto
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className={`font-bold ${user.profile_photo_url ? "text-red-500 hover:!bg-red-500/40 hover:!text-red-500" : "text-gray-400 cursor-not-allowed"}`}
                                        onSelect={user.profile_photo_url ? deletePhoto : undefined}
                                        disabled={!user.profile_photo_url}
                                    >
                                        <Icon name="Trash2" className="w-4 mr-2" />
                                        Eliminar foto
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Botones de acción para la foto */}
                    {photoPreview && (
                        <div className="flex gap-2 mt-3">
                            <Button
                                variant={"secondary"}
                                onClick={() => {
                                    setPhotoPreview(null);
                                    clearPhotoFileInput();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant={"primary"}
                                onClick={updateProfilePhoto}
                                disabled={!data.photo}
                            >
                                Guardar
                            </Button>
                        </div>
                    )}

                    {/* Información básica */}
                    <div className="text-center mt-3">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {user.name}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {user.descripcion || user.empleado?.puesto || 'No disponible'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="p-4">
                <nav>
                    {navigationItems.filter(item => item.condition).map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-full transition-colors duration-200 mb-1 ${activeTab === item.key
                                ? "bg-custom-gray-default dark:bg-custom-blackSemi text-custom-gray-darker dark:text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-custom-blackSemi"
                                }`}
                        >
                            <Icon
                                name={item.icon}
                                className={`w-4 h-4 mr-3 ${activeTab === item.key
                                    ? "dark:text-white text-custom-gray-darker"
                                    : "dark:text-white text-custom-gray-darker"
                                    }`}
                            />
                            <span className="flex-1 text-left">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
