/**
 * Componente BaseScheduleCell: estructura base para las celdas de horarios.
 * 
 * @param {props} param - Props del componente
 * @param {string} param.className - Clase CSS adicional para el componente
 * @param {ReactNode} param.children - Contenido del componente
 * @returns 
 */
export default function BaseScheduleCell({ children, className }) {
    return (
        <div
            className={ `flex flex-col gap-1 max-w-[calc(12rem+10px)] min-w-[calc(12rem+10px)] ${className}` }
        >
            {children}
        </div>
    );
}