<?php

namespace Database\Seeders;

use App\Models\TipoContrato;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TipoContratoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contratos = [
            [
                'nombre' => 'Indefinido Tiempo Completo',
                'clave' => 100,
                'nombre_completo' => 'INDEFINIDO TIEMPO COMPLETO – ORDINARIO',
                'descripcion' => 'Contrato de trabajo de duración indefinida para actividades ordinarias, sin limitación temporal en el empleo.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Completo Fomento',
                'clave' => 109,
                'nombre_completo' => 'INDEFINIDO TIEMPO COMPLETO – FOMENTO CONTRATACIÓN INDEFINIDA/EMPLEO ESTABLE TRANSFORMACIÓN CONTRATO TEMPORAL',
                'descripcion' => 'Contrato que permite convertir un contrato temporal en indefinido, con incentivos para fomentar la estabilidad en el empleo.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Completo Discapacitados',
                'clave' => 130,
                'nombre_completo' => 'INDEFINIDO TIEMPO COMPLETO - DISCAPACITADOS',
                'descripcion' => 'Contrato a tiempo completo e indefinido destinado a personas con discapacidad, con un periodo de prueba de un año.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Completo Discapacitados Transformación',
                'clave' => 139,
                'nombre_completo' => 'INDEFINIDO TIEMPO COMPLETO – DISCAPACITADOS TRANSFORMACIÓN CONTRATO TEMPORAL',
                'descripcion' => 'Contrato para personas con discapacidad transformando un contrato temporal en uno indefinido.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Completo Fomento Inicial',
                'clave' => 150,
                'nombre_completo' => 'INDEFINIDO TIEMPO COMPLETO – FOMENTO CONTRATACIÓN INDEFINIDA/EMPLEO ESTABLE INICIAL',
                'descripcion' => 'Contrato a tiempo completo e indefinido para atender necesidades temporales de la empresa, como aumento de la carga de trabajo.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Completo Transformación',
                'clave' => 189,
                'nombre_completo' => 'INDEFINIDO TIEMPO COMPLETO – TRANSFORMACIÓN CONTRATO TEMPORAL',
                'descripcion' => 'Contrato a tiempo completo que sustituye a un trabajador con derecho a reserva del puesto de trabajo.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Parcial',
                'clave' => 200,
                'nombre_completo' => 'INDEFINIDO TIEMPO PARCIAL – ORDINARIO',
                'descripcion' => 'Contrato a tiempo parcial que tiene como objetivo proporcionar cualificación profesional y formación al trabajador.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Parcial Fomento',
                'clave' => 209,
                'nombre_completo' => 'INDEFINIDO TIEMPO PARCIAL – FOMENTO CONTRATACIÓN INDEFINIDA/EMPLEO ESTABLE TRANSFORMACIÓN CONTRATO TEMPORAL',
                'descripcion' => 'Contrato para personas con titulación oficial que necesitan experiencia laboral práctica.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Parcial Discapacitados',
                'clave' => 230,
                'nombre_completo' => 'INDEFINIDO TIEMPO PARCIAL - DISCAPACITADOS',
                'descripcion' => 'Contrato a tiempo parcial e indefinido destinado a personas con discapacidad.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Parcial Discapacitados Transformación',
                'clave' => 239,
                'nombre_completo' => 'INDEFINIDO TIEMPO PARCIAL – DISCAPACITADOS TRANSFORMACIÓN CONTRATO TEMPORAL',
                'descripcion' => 'Transformación de un contrato temporal en uno indefinido para personas con discapacidad.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Parcial Fomento Inicial',
                'clave' => 250,
                'nombre_completo' => 'INDEFINIDO TIEMPO PARCIAL – FOMENTO CONTRATACIÓN INDEFINIDA/EMPLEO ESTABLE INICIAL',
                'descripcion' => 'Contrato a tiempo parcial destinado a necesidades temporales de la empresa relacionadas con exceso de trabajo.',
            ],
            [
                'nombre' => 'Indefinido Tiempo Parcial Transformación',
                'clave' => 289,
                'nombre_completo' => 'INDEFINIDO TIEMPO PARCIAL – TRANSFORMACIÓN CONTRATO TEMPORAL',
                'descripcion' => 'Contrato a tiempo parcial que reemplaza a un trabajador con derecho a reserva de puesto de trabajo.',
            ],
            [
                'nombre' => 'Indefinido Fijo Discontinuo',
                'clave' => 300,
                'nombre_completo' => 'INDEFINIDO FIJO/DISCONTINUO',
                'descripcion' => 'Contrato indefinido que no requiere un trabajo continuo, con interrupciones en la actividad laboral.',
            ],
            [
                'nombre' => 'Indefinido Fijo Discontinuo Fomento',
                'clave' => 309,
                'nombre_completo' => 'INDEFINIDO FIJO/DISCONTINUO – FOMENTO CONTRATACIÓN INDEFINIDA/EMPLEO ESTABLE TRANSFORMACIÓN CONTRATO TEMPORAL',
                'descripcion' => 'Contrato fijo/discontinuo transformado de un contrato temporal con incentivos para la estabilidad laboral.',
            ],
            [
                'nombre' => 'Indefinido Fijo Discontinuo Discapacitados',
                'clave' => 330,
                'nombre_completo' => 'INDEFINIDO FIJO/DISCONTINUO - DISCAPACITADOS',
                'descripcion' => 'Contrato fijo/discontinuo destinado a personas con discapacidad, con un periodo de prueba.',
            ],
            [
                'nombre' => 'Indefinido Fijo Discontinuo Discapacitados Transformación',
                'clave' => 339,
                'nombre_completo' => 'INDEFINIDO FIJO/DISCONTINUO – DISCAPACITADO. TRANSFORMACION',
                'descripcion' => 'Transformación de un contrato fijo/discontinuo temporal en uno definitivo para personas con discapacidad.',
            ],
            [
                'nombre' => 'Indefinido Fijo Discontinuo Fomento Inicial',
                'clave' => 350,
                'nombre_completo' => 'INDEFINIDO FIJO/DISCONTINUO – FOMENTO CONTRATACIÓN INDEFINIDA/EMPLEO ESTABLE INICIAL',
                'descripcion' => 'Contrato fijo/discontinuo a tiempo parcial destinado a necesidades excepcionales de la empresa.',
            ],
            [
                'nombre' => 'Indefinido Fijo Discontinuo Transformación',
                'clave' => 389,
                'nombre_completo' => 'INDEFINIDO FIJO/DISCONTINUO – TRANSFORMACIÓN CONTRATO TEMPORAL',
                'descripcion' => 'Transformación de un contrato temporal a uno fijo/discontinuo cuando la actividad laboral es estable pero no continua.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Obra/Servicio',
                'clave' => 401,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – OBRA O SERVICIO DETERMINADO',
                'descripcion' => 'Contrato por un tiempo determinado para realizar una obra o servicio específico.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Eventual',
                'clave' => 402,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – EVENTUAL POR CIRCUNSTANCIAS DE LA PRODUCCIÓN',
                'descripcion' => 'Contrato para cubrir necesidades temporales de la empresa debido a circunstancias excepcionales.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Inserción',
                'clave' => 403,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – INSERCIÓN',
                'descripcion' => 'Contrato temporal para facilitar la integración laboral de personas en situación de vulnerabilidad o desempleo.',
            ],
            [
                'nombre' => 'Contrato Predoctoral',
                'clave' => 404,
                'nombre_completo' => 'CONTRATO PREDOCTORAL',
                'descripcion' => 'Contrato para personas en formación que están realizando estudios de postgrado o investigación.',
            ],
            [
                'nombre' => 'Administraciones Públicas Tiempo Completo',
                'clave' => 406,
                'nombre_completo' => 'ADMINISTRACIONES PÚBLICAS. PLAN RECUPERACIÓN, TRANSFORMACIÓN Y RESILIENCIA, Y FONDOS UNIÓN EUROPEA. TIEMPO COMPLETO.',
                'descripcion' => 'Contrato financiado con fondos públicos destinados a la recuperación económica y resiliencia.',
            ],
            [
                'nombre' => 'Duración Determinada Artistas Tiempo Completo',
                'clave' => 407,
                'nombre_completo' => 'DURACIÓN DETERMINADA. ARTISTAS, TÉCNICOS Y AUXILIARES. TIEMPO COMPLETO.',
                'descripcion' => 'Contrato temporal para trabajos relacionados con el arte, cultura y eventos especiales.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Administrativo',
                'clave' => 408,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – CARÁCTER ADMINISTRATIVO',
                'descripcion' => 'Contrato temporal para cubrir puestos administrativos de carácter específico o eventual.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Interinidad',
                'clave' => 410,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – INTERINIDAD',
                'descripcion' => 'Contrato temporal para cubrir la ausencia de un trabajador con derecho a reserva de puesto.',
            ],
            [
                'nombre' => 'Duración Determinada Docente Investigador',
                'clave' => 411,
                'nombre_completo' => 'DURACIÓN DETERMINADA.TIEMPO COMPLETO. PERSONAL DOCENTE INVESTIGADOR UNIVERSITARIO. ACCESO PERSONAL INVESTIGADOR DOCTOR',
                'descripcion' => 'Contrato temporal para docentes e investigadores universitarios, con requisitos de doctorado.',
            ],
            [
                'nombre' => 'Duración Determinada Deportistas Profesionales',
                'clave' => 412,
                'nombre_completo' => 'DURACIÓN DETERMINADA. TIEMPO COMPLETO. DEPORTISTAS PROFESIONALES',
                'descripcion' => 'Contrato para deportistas profesionales, que varía dependiendo de las temporadas.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Interinidad Administrativo',
                'clave' => 418,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – INTERINIDAD CARÁCTER ADMINISTRATIVO',
                'descripcion' => 'Contrato temporal en el ámbito administrativo para cubrir ausencias de personal fijo.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Prácticas',
                'clave' => 420,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – PRÁCTICAS',
                'descripcion' => 'Contrato para estudiantes en prácticas o formación, donde se aprenden habilidades laborales.',
            ],
            [
                'nombre' => 'Temporal Tiempo Completo Formación Alternancia',
                'clave' => 421,
                'nombre_completo' => 'TEMPORAL TIEMPO COMPLETO. FORMACIÓN EN ALTERNANCIA',
                'descripcion' => 'Contrato donde se alterna la formación teórica y práctica en el puesto de trabajo.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Discapacitados',
                'clave' => 430,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – DISCAPACITADOS',
                'descripcion' => 'Contrato temporal dirigido a personas con discapacidad, con requisitos especiales de integración laboral.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Relevo',
                'clave' => 441,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – RELEVO',
                'descripcion' => 'Contrato temporal para cubrir un puesto laboral ocupado por un trabajador en situación de jubilación parcial.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Fomento',
                'clave' => 450,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – FOMENTO CONTRATACIÓN INDEFINIDA/EMPLEO ESTABLE',
                'descripcion' => 'Contrato temporal que facilita la transición a un empleo estable e indefinido.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Completo Empresas Inserción',
                'clave' => 452,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO COMPLETO – TRABAJADORES DESEMPLEADOS CONTRATADOS POR EMPRESAS DE INSERCIÓN',
                'descripcion' => 'Contrato temporal para trabajadores en situación de desempleo que se incorporan a empresas de inserción.',
            ],
            [
                'nombre' => 'Temporal Tiempo Parcial Ordinario',
                'clave' => 500,
                'nombre_completo' => 'TEMPORAL. TIEMPO PARCIAL ORDINARIO',
                'descripcion' => 'Contrato temporal a tiempo parcial con las mismas características que un contrato ordinario, pero por un tiempo limitado.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Obra/Servicio',
                'clave' => 501,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – OBRA O SERVICIO DETERMINADO',
                'descripcion' => 'Contrato temporal a tiempo parcial para realizar una obra o servicio específico de duración limitada.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Eventual',
                'clave' => 502,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – EVENTUAL POR CIRCUNSTANCIAS DE LA PRODUCCIÓN',
                'descripcion' => 'Contrato temporal a tiempo parcial para necesidades excepcionales de la producción o actividad empresarial.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Inserción',
                'clave' => 503,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – INSERCIÓN',
                'descripcion' => 'Contrato temporal a tiempo parcial destinado a facilitar la inserción laboral de personas en situación de vulnerabilidad.',
            ],
            [
                'nombre' => 'Administraciones Públicas Tiempo Parcial',
                'clave' => 506,
                'nombre_completo' => 'ADMINISTRACIONES PÚBLICAS. PLAN RECUPERACIÓN, TRANSFORMACIÓN Y RESILIENCIA, Y FONDOS UNIÓN EUROPEA. TIEMPO PARCIAL.',
                'descripcion' => 'Contrato temporal financiado por fondos públicos para proyectos relacionados con la recuperación económica.',
            ],
            [
                'nombre' => 'Duración Determinada Artistas Tiempo Parcial',
                'clave' => 507,
                'nombre_completo' => 'DURACIÓN DETERMINADA. ARTISTAS, TÉCNICOS Y AUXILIARES. TIEMPO PARCIAL.',
                'descripcion' => 'Contrato temporal a tiempo parcial para artistas, técnicos y auxiliares en el ámbito cultural y artístico.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Administrativo',
                'clave' => 508,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – CARÁCTER ADMINISTRATIVO',
                'descripcion' => 'Contrato temporal a tiempo parcial para puestos administrativos con tareas específicas.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Interinidad',
                'clave' => 510,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – INTERINIDAD',
                'descripcion' => 'Contrato temporal a tiempo parcial para cubrir ausencias de personal fijo con derecho a reserva de puesto.',
            ],
            [
                'nombre' => 'Duración Determinada Docente Investigador Tiempo Parcial',
                'clave' => 511,
                'nombre_completo' => 'DURACIÓN DETERMINADA.TIEMPO PARCIAL. PERSONAL DOCENTE INVESTIGADOR UNIVERSITARIO.',
                'descripcion' => 'Contrato temporal a tiempo parcial para docentes e investigadores en universidades.',
            ],
            [
                'nombre' => 'Duración Determinada Deportistas Profesionales Tiempo Parcial',
                'clave' => 513,
                'nombre_completo' => 'DURACIÓN DETERMINADA. TIEMPO PARCIAL. DEPORTISTAS PROFESIONALES',
                'descripcion' => 'Contrato temporal a tiempo parcial para deportistas profesionales.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Interinidad Administrativo',
                'clave' => 518,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – INTERINIDAD CARÁCTER ADMINISTRATIVO',
                'descripcion' => 'Contrato temporal a tiempo parcial en el ámbito administrativo, para cubrir puestos vacantes de forma temporal.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Prácticas',
                'clave' => 520,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – PRÁCTICAS',
                'descripcion' => 'Contrato temporal a tiempo parcial para estudiantes que realizan prácticas profesionales.',
            ],
            [
                'nombre' => 'Temporal Tiempo Parcial Formación Alternancia',
                'clave' => 521,
                'nombre_completo' => 'TEMPORAL TIEMPO PARCIAL. FORMACIÓN EN ALTERNANCIA',
                'descripcion' => 'Contrato temporal a tiempo parcial donde se alterna formación y trabajo práctico.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Discapacitados',
                'clave' => 530,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – DISCAPACITADOS',
                'descripcion' => 'Contrato temporal a tiempo parcial para personas con discapacidad.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Jubilación Parcial',
                'clave' => 540,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – JUBILACIÓN PARCIAL',
                'descripcion' => 'Contrato temporal a tiempo parcial para trabajadores en proceso de jubilación parcial.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Relevo',
                'clave' => 541,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – RELEVO',
                'descripcion' => 'Contrato temporal a tiempo parcial para relevar a trabajadores en jubilación parcial.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Fomento',
                'clave' => 550,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – FOMENTO CONTRATACIÓN INDEFINIDA/EMPLEO ESTABLE',
                'descripcion' => 'Contrato temporal a tiempo parcial con posibilidad de transición a empleo indefinido.',
            ],
            [
                'nombre' => 'Duración Determinada Tiempo Parcial Empresas Inserción',
                'clave' => 552,
                'nombre_completo' => 'DURACIÓN DETERMINADA TIEMPO PARCIAL – TRABAJADORES DESEMPLEADOS CONTRATADOS POR EMPRESAS DE INSERCIÓN',
                'descripcion' => 'Contrato temporal a tiempo parcial para desempleados que ingresan en empresas de inserción.',
            ],
        ];

        foreach ($contratos as $contrato) {
            TipoContrato::create($contrato);
        }
    }
}