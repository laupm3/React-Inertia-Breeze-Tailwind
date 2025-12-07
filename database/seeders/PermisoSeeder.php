<?php

namespace Database\Seeders;

use App\Models\Permiso;
use App\Models\PermisoCategoria;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PermisoSeeder extends Seeder
{
    // Constantes para conversiones
    const DIA_MS = 86400000; // 24h * 60m * 60s * 1000ms
    const SEMANA_MS = 604800000; // 7d * 24h * 60m * 60s * 1000ms
    const HORA_MS = 3600000; // 60m * 60s * 1000ms

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categorias = PermisoCategoria::all();

        $otros_permisos_id = $categorias->firstWhere('name', 'Otros permisos')->id;
        $permisos_medicos_id = $categorias->firstWhere('name', 'Permisos médicos')->id;

        // Permisos de Otros permisos
        Permiso::factory()->create([
            'nombre' => 'Vacaciones',
            'nombre_oficial' => 'Permiso de vacaciones anuales',
            'descripcion' => 'Días de vacaciones anuales a disfrutar por el trabajador.',
            'descripcion_oficial' => 'El trabajador tiene derecho a un período de vacaciones anuales retribuidas. El período o períodos de su disfrute se fijarán de común acuerdo entre el empresario y el trabajador.',
            'duracion' => null, // La duración es variable y se define en la solicitud
            'retribuido' => true,
            'categoria_id' => $otros_permisos_id
        ]);

        Permiso::factory()->create([
            'nombre' => 'Boda o pareja registrada',
            'nombre_oficial' => 'Licencia matrimonio o parejas de hecho inscritas',
            'descripcion' => '15 días naturales desde el enlace.',
            'descripcion_oficial' => 'Debe de ser disfrutado inmediatamente después del hecho causante, salvo con el empresario. Se debe preavisar con 15 días naturales.',
            'duracion' => 15 * static::DIA_MS, // 15 días en ms
            'retribuido' => true,
            'categoria_id' => $otros_permisos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Permiso sin sueldo',
            'nombre_oficial' => 'Permisos no retribuidos',
            'descripcion' => 'Máx. 15 días al año con acuerdo empresa.',
            'descripcion_oficial' => 'Se deben solicitar con al menos 20 días de antelación. La empresa debe concederlo a menos que coincida con otro trabajador, que decidirá entonces en función de las necesidades de la empresa.',
            'duracion' => 15 * static::DIA_MS, // 15 días en ms
            'retribuido' => false,
            'categoria_id' => $otros_permisos_id,
            'yearly_limited' => true,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Mudanza de familiar cercano',
            'nombre_oficial' => 'Traslado de domicilio',
            'descripcion' => '1 día.',
            'descripcion_oficial' => '',
            'duracion' => static::DIA_MS, // 1 día en ms
            'retribuido' => true,
            'categoria_id' => $otros_permisos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Boda de familiar cercano',
            'nombre_oficial' => 'Boda de parientes (2º grado)',
            'descripcion' => 'El día del evento si es laborable.',
            'descripcion_oficial' => 'Debe coincidir con el día de la ceremonia, siempre que sea laboral.',
            'duracion' => static::DIA_MS, // 1 día en ms
            'retribuido' => true,
            'categoria_id' => $otros_permisos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Permiso por adopción o acogida',
            'nombre_oficial' => 'Adopción o acogimiento',
            'descripcion' => '16 semanas (más si hay más de un hijo).',
            'descripcion_oficial' => 'Puede disfrutar el permiso el padre o la madre. Si el permiso coincide con el periodo de vacaciones el tramo de coincidencia, se disfrutará a continuación del mismo.',
            'duracion' => 16 * static::SEMANA_MS, // 16 semanas en ms
            'retribuido' => true,
            'categoria_id' => $otros_permisos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Permiso para cuidar hijos menores de 8 años',
            'nombre_oficial' => 'Permiso parental por cuidado de menores de 8 años -RD 5/2023',
            'descripcion' => 'Hasta 8 semanas al año, sin sueldo.',
            'descripcion_oficial' => '',
            'duracion' => 8 * static::SEMANA_MS, // 8 semanas en ms
            'retribuido' => false,
            'categoria_id' => $otros_permisos_id,
            'yearly_limited' => true,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Ausencia por urgencia familiar',
            'nombre_oficial' => 'Permisos para ausentarse por motivos familiares urgentes o por fuerza mayor de familiares y convivientes -RD 5/2023',
            'descripcion' => '4 días al año. Puede ser por horas. Justificación necesaria.',
            'descripcion_oficial' => 'Este permiso se puede utilizar por horas o días. Se puede solicitar para cónyuge, pareja de hecho, parientes hasta segundo grado de afinidad o consanguinidad, familiares consanguíneos de la pareja de hecho, o cualquier persona que conviva con la persona trabajadora en el mismo domicilio. Debe motivarse por una situación de urgencia y fuerza mayor imprevisible, que haga indispensable la presencia de la persona trabajadora en un lugar distinto al lugar de trabajo. Se requiere justificación del permiso y del grado de parentesco o convivencia y de la urgencia.',
            'duracion' => 4 * static::DIA_MS, // 4 días en ms
            'retribuido' => true,
            'categoria_id' => $otros_permisos_id,
            'yearly_limited' => true,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Obligación legal o personal',
            'nombre_oficial' => 'Deber inexcusable, público o personal',
            'descripcion' => 'Tiempo necesario con justificante.',
            'descripcion_oficial' => 'Citaciones de organismos judiciales y órganos de la administración. Otros cuyo incumplimiento puede generar responsabilidades de índole civil, penal, social o administrativa: mesas electorales, jurados... Precisa justificación.',
            'duracion' => null, // Tiempo variable, usamos -1 para indicar indeterminado
            'retribuido' => true,
            'categoria_id' => $otros_permisos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Permiso por violencia de género',
            'nombre_oficial' => 'Víctima de violencia de género',
            'descripcion' => 'Reducción o reorganización de jornada.',
            'descripcion_oficial' => 'Adaptando el horario o flexibilizándolo. Se considerarán justificadas cuando los servicios sociales o de salud lo determinen.',
            'duracion' => null, // Tiempo variable, usamos -1 para indicar indeterminado
            'retribuido' => true,
            'categoria_id' => $otros_permisos_id,
            'yearly_limited' => false,
        ]);

        // Permisos médicos
        Permiso::factory()->create([
            'nombre' => 'Nacimiento, accidente o fallecimiento familiar',
            'nombre_oficial' => 'Nacimiento de un hijo, accidente o enfermedad graves u hospitalización, fallecimiento del conyuge o un familiar (hasta 2º grado de afinidad o consanguinidad)',
            'descripcion' => '5 días. Requiere justificante médico o defunción.',
            'descripcion_oficial' => 'Siempre es necesario justificación de la baja y alta médica.',
            'duracion' => 5 * static::DIA_MS, // 5 días en ms
            'retribuido' => true,
            'categoria_id' => $permisos_medicos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Cirugía con reposo de familiar',
            'nombre_oficial' => 'Intervención quirúrgica sin hospitalización que precise de reposo domiciliado hasta parientes hasta 2º grado',
            'descripcion' => '5 días. Justificante médico necesario.',
            'descripcion_oficial' => 'Siempre es necesario justificación de la baja y alta médica.',
            'duracion' => 5 * static::DIA_MS, // 5 días en ms
            'retribuido' => true,
            'categoria_id' => $permisos_medicos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Pruebas médicas de embarazo o adopción',
            'nombre_oficial' => 'Realización exámenes prenatales, técnicas de preparación al parto y en los casos de adopción',
            'descripcion' => 'Solo durante jornada laboral.',
            'descripcion_oficial' => 'Siempre que deban realizarse durante la jornada de trabajo. Precisa justificación.',
            'duracion' => null, // Tiempo indeterminado
            'retribuido' => true,
            'categoria_id' => $permisos_medicos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Baja por maternidad',
            'nombre_oficial' => 'Suspensión de contrato por maternidad - Permiso por nacimiento y cuidado de menor',
            'descripcion' => '16 semanas. Puede ampliarse en casos especiales.',
            'descripcion_oficial' => 'Las 6 primeras semanas posteriores al parto, obligatorias e ininterrumpidas. Las 10 semanas restantes se podrán disfrutar en períodos semanales, de forma acumulada o interrumpida, dentro de los doce meses siguientes. Podrán ser disfrutadas estas 10 semanas a jornada completa o parcial, previo acuerdo entre la empresa y la persona trabajadora. No se puede ceder nada al otro progenitor. La madre podrá adelantar el disfrute de 4 semanas antes de la fecha prevista para el parto.',
            'duracion' => 16 * static::SEMANA_MS, // 16 semanas en ms
            'retribuido' => true,
            'categoria_id' => $permisos_medicos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Baja por paternidad',
            'nombre_oficial' => 'Suspensión de contrato por paternidad - Permiso por nacimiento y cuidado de menor',
            'descripcion' => '16 semanas. Puede ampliarse si hay más de un hijo o el bebé está hospitalizado.',
            'descripcion_oficial' => '',
            'duracion' => 16 * static::SEMANA_MS, // 16 semanas en ms
            'retribuido' => true,
            'categoria_id' => $permisos_medicos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Hospitalización tras parto',
            'nombre_oficial' => 'Nacimiento de prematuros u hospitalización del bebé después del parto',
            'descripcion' => 'Hasta 13 semanas extra si el bebé está hospitalizado.',
            'descripcion_oficial' => 'Podrán ser disfrutadas estas 10 semanas a jornada completa o parcial, previo acuerdo entre la empresa y la persona trabajadora. No se puede ceder nada al otro progenitor.',
            'duracion' => static::HORA_MS, // 1 hora en ms
            'retribuido' => true,
            'categoria_id' => $permisos_medicos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Permiso por lactancia',
            'nombre_oficial' => 'Lactancia',
            'descripcion' => '1 hora diaria o 2 fracciones hasta los 9 meses del bebé.',
            'descripcion_oficial' => '1 hora de ausencia que podrán dividir en dos fracciones. A petición del trabajador se podrá acumular en jornadas completas. La madre podrá adelantar el disfrute de 4 semanas antes de la fecha prevista para el parto.',
            'duracion' => static::HORA_MS, // 1 hora en ms
            'retribuido' => true,
            'categoria_id' => $permisos_medicos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Reducción de jornada por cuidado',
            'nombre_oficial' => 'Reducción de Jornada por guarda legal o cuidado de familiar (hasta 2º grado)',
            'descripcion' => 'Reducción entre 1/8 y 1/2 de la jornada.',
            'descripcion_oficial' => 'Menor de 12 años, anciano que requiere especial dedicación o disminuido físico o psíquico sin actividad retribuida. Deberá avisar con 15 días de antelación.',
            'duracion' => null,
            'retribuido' => true,
            'categoria_id' => $permisos_medicos_id,
            'yearly_limited' => false,
        ]);

        Permiso::factory()->create([
            'nombre' => 'Citas médicas justificadas',
            'nombre_oficial' => 'Permiso por asistencia a medico especialista',
            'descripcion' => 'Hasta 15h anuales. Para hijos menores de 2 años, dependientes o con discapacidad.',
            'descripcion_oficial' => 'Los trabajadores dispondrán de un máximo de 15 horas anuales retribuidas para asistir a consultas de médicos especialistas (coincidiendo con el horario laboral) tanto del propio trabajador como de los hijos menores de 2 años, discapacitados y familiares hasta el primer grado de consanguinidad a cargo en situación de dependencia. Este permiso deberá ser comunicado y justificado posteriormente a la empresa.',
            'duracion' => 15 * static::HORA_MS, // 15 horas en ms
            'retribuido' => true,
            'categoria_id' => $permisos_medicos_id,
            'yearly_limited' => true,
        ]);
    }
}
