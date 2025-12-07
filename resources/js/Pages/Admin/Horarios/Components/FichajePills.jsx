import { format, differenceInMinutes } from 'date-fns';

export default function FichajePills({ horario }) {
    const {
        fichaje_entrada,
        fichaje_salida,
        fichajeEntrada,
        fichajeSalida,
    } = horario;

    const estadoFichajeInicio = determinarEstadoFichajeInicio(horario);
    const estadoFichajeFin = determinarEstadoFichajeFin(horario);

    return (
        <div className="flex flex-1 gap-2 items-center justify-center">
            <Pill
                mapColor={estadoFichajeInicio}
            >
                {fichaje_entrada ? fichajeEntrada : '--'}
            </Pill>
            <Pill
                mapColor={estadoFichajeFin}
            >
                {fichaje_salida
                    ? fichajeSalida
                    : estadoFichajeFin === EN_CURSO
                        ? <span className="text-nowrap text-ellipsis overflow-hidden">En curso</span>
                        : '--'
                }
            </Pill>
        </div>
    )
}

const NEUTRO = {
    point: 'bg-trasparent dark:bg-transparent',
    bg: 'bg-transparent dark:bg-transparent',
    text: 'text-custom-gray-semiDark dark:text-gray-300',
    border: 'border-transparent dark:border-transparent'
}

const NEGATIVO = {
    point: 'bg-red-500 dark:bg-red-600',
    bg: 'bg-red-500/30 dark:bg-red-600/30',
    text: 'text-red-500 dark:text-red-400',
    border: 'border-red-500 dark:border-red-600'
}

const EN_CURSO = {
    point: 'bg-yellow-500 dark:bg-yellow-600',
    bg: 'bg-yellow-500/30 dark:bg-yellow-600/30',
    text: 'text-yellow-500 dark:text-yellow-400',
    border: 'border-yellow-500 dark:border-yellow-600'
};

const POSITIVO = {
    point: 'bg-green-500 dark:bg-green-600',
    bg: 'bg-green-500/30 dark:bg-green-600/30',
    text: 'text-green-500 dark:text-green-400',
    border: 'border-green-500 dark:border-green-600'
}

/**
 * Crea un componente de tipo Pill en base a un identificador el cual busca en uu mapa de colores el atributo que le corresponde, sino encuentra el identificador, se le asigna un color por defecto
 * 
 * @param {Object} props Las propiedades del componente
 * @param {String} props.identifier El identificador del color - Hace referencia a la clave del objeto mapColor
 * @param {Object} props.mapColor El objeto que contiene el diccionario de colores
 * @param {String} props.size El tamaño del texto de la pill
 * @param {String} props.textClassName Clase adicional para el texto de la pill
 * 
 * @returns {JSX.Element} El componente de React
 */
function Pill({ mapColor, children, className = '', size = 'text-s', textClassName = 'font-bold w-full text-center' }) {

    const { point, bg, text, border } = mapColor;

    return (
        <div
            className={`
                flex flex-row items-center w-fit gap-2
                ${bg} ${text} 
                ${size} rounded-full px-3 py-1.5 ${className}`
            }
            style={{ minWidth: '60px' }}
        >
            <p className={textClassName}>
                {children}
            </p>
        </div>
    )
}

const determinarEstadoFichajeInicio = (horario) => {
    const {
        horario_inicio,
        fichaje_entrada
    } = horario;

    const currentDate = new Date();
    const horarioInicioDate = new Date(horario_inicio);
    const fichajeEntradaDate = new Date(fichaje_entrada);

    // Determina si un horario ya ha empezado
    const horarioEnCurso = (currentDate >= horarioInicioDate);
    // Determina si el fichaje de entrada ha sido registrado antes de la hora de inicio del horario
    const inicioAnticipado = fichaje_entrada && differenceInMinutes(fichajeEntradaDate, horarioInicioDate) < 0;
    // Determina si el horario no ha empezado y el fichaje de entrada no ha sido registrado
    const sinIniciarHorario = !horarioEnCurso && !fichaje_entrada;

    // Determina si el horario ya ha empezado por más de 15 minutos y si el fichaje de entrada no ha sido registrado o si ha sido registrado pero con más de 15 minutos de retraso
    const inicioConRetraso = (
        (differenceInMinutes(currentDate, horarioInicioDate) > 15 || fichaje_entrada)
        &&
        (!fichaje_entrada || (differenceInMinutes(fichajeEntradaDate, horarioInicioDate) > 15))
    );

    if (inicioAnticipado) return POSITIVO;
    if (sinIniciarHorario) return NEUTRO;
    if (inicioConRetraso) return NEGATIVO;
    return NEUTRO;
}

const determinarEstadoFichajeFin = (horario) => {
    const {
        fichaje_entrada,
        fichaje_salida,
        horario_inicio,
        horario_fin
    } = horario;

    const currentDate = new Date();
    const fichajeSalidaDate = new Date(fichaje_salida);
    const horarioInicioDate = new Date(horario_inicio);
    const horarioFinDate = new Date(horario_fin);

    // Determina si un horario ya ha empezado
    const horarioEnCurso = (currentDate >= horarioInicioDate);

    // Determina si el fichaje de salida ha sido registrado antes de la hora de fin del horario
    const finAnticipado = (
        fichaje_salida
        &&
        (differenceInMinutes(fichajeSalidaDate, horarioFinDate) < 0)
    );

    // Determina si el fichaje de salida se ha registrado entre los 15 minutos después de la hora de fin del horario
    const finEnTiempo = (
        (!finAnticipado && fichaje_salida)
        &&
        (differenceInMinutes(fichajeSalidaDate, horarioFinDate) <= 15)
        &&
        (differenceInMinutes(fichajeSalidaDate, horarioFinDate) >= 0)
    );

    if (finAnticipado) return NEGATIVO;
    if (!horarioEnCurso && !fichaje_salida) return NEUTRO;
    if (!fichaje_salida && fichaje_entrada && horarioEnCurso && currentDate < horarioFinDate) return EN_CURSO;
    if (finEnTiempo) return NEUTRO;
    if (!fichaje_salida) return NEGATIVO;
    return POSITIVO;
}



