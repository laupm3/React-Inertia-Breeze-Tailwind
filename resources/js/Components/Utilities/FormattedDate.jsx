import { formatDateDMY, formatDateSpanish, getDayOfWeekSpanish } from '@/utils/eventDateUtils';

/**
 * Componente para mostrar fechas formateadas
 * @param {Object} props - Props del componente
 * @param {string|Date} props.date - Fecha a formatear
 * @param {string} props.format - Formato: 'dmy', 'spanish', 'dayWeek'
 * @param {string} props.className - Clases CSS adicionales
 */
const FormattedDate = ({ date, format = 'dmy', className = '' }) => {
    if (!date) return null;

    const getFormattedDate = () => {
        switch (format) {
            case 'spanish':
                return formatDateSpanish(date);
            case 'dayWeek':
                return getDayOfWeekSpanish(date);
            case 'dmy':
            default:
                return formatDateDMY(date);
        }
    };

    return (
        <span className={className}>
            {getFormattedDate()}
        </span>
    );
};

export default FormattedDate;
