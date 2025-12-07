import { useState } from 'react';

/**
 * Componente que muestra el avatar y nombre de un usuario
 * 
 * @component
 * @param {Object} props - Las propiedades del componente
 * @param {Object} props.user - Objeto que contiene la información del usuario
 * @param {string} props.user.name - Nombre del usuario a mostrar
 * @param {string} props.user.profile_photo_url - URL de la foto de perfil del usuario
 * @param {string} [props.className=''] - Clases CSS adicionales para el contenedor
 * @param {boolean} [props.showName=true] - Si mostrar el nombre del usuario
 * @param {string} [props.size='w-8 h-8'] - Tamaño del avatar
 * 
 * @returns {JSX.Element} Elemento JSX que renderiza el avatar del usuario
 * 
 * @example
 * // Uso básico
 * <UserAvatar user={{name: "Juan Pérez", profile_photo_url: "/images/user.jpg"}} />
 * 
 * @example
 * // Solo avatar sin nombre
 * <UserAvatar 
 *   user={{name: "María García", profile_photo_url: "/images/maria.jpg"}} 
 *   showName={false}
 * />
 * 
 * @since 1.0.0
 * @author @laupm3 @TeDeLimon
 */
export default function UserAvatar({ user, className = '', showName = true, size = 'w-8 h-8' }) {
    const [imageError, setImageError] = useState(false);

    // Función para obtener las iniciales del nombre
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    // Función para generar un color de fondo basado en el nombre
    const getBackgroundColor = (name) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
            'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500'
        ];
        const hash = name?.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0) || 0;
        return colors[hash % colors.length];
    };

    // Función para obtener el tamaño de texto apropiado según el tamaño del avatar
    const getTextSize = (size) => {
        if (size.includes('w-4') || size.includes('h-4')) return 'text-xs';
        if (size.includes('w-5') || size.includes('h-5')) return 'text-xs';
        if (size.includes('w-6') || size.includes('h-6')) return 'text-xs';
        if (size.includes('w-8') || size.includes('h-8')) return 'text-sm';
        if (size.includes('w-10') || size.includes('h-10')) return 'text-base';
        if (size.includes('w-12') || size.includes('h-12')) return 'text-lg';
        return 'text-sm'; // default
    };

    const hasValidImage = user?.profile_photo_url && !imageError;

    return (
        <div className={`flex items-center gap-2 ${showName ? 'max-w-[12rem]' : ''} ${className}`}>
            {hasValidImage ? (
                <img
                    className={`${size} rounded-full object-cover flex-shrink-0`}
                    src={user.profile_photo_url}
                    alt={user.name}
                    onError={() => setImageError(true)}
                />
            ) : (
                <div 
                    className={`${size} rounded-full flex items-center justify-center text-white font-semibold ${getTextSize(size)} ${getBackgroundColor(user?.name)} flex-shrink-0`}
                    style={{ minWidth: 'fit-content' }}
                >
                    {getInitials(user?.name)}
                </div>
            )}
            {showName && (
                <span className="text-nowrap text-ellipsis overflow-hidden">
                    {user?.name}
                </span>
            )}
        </div>
    );
}