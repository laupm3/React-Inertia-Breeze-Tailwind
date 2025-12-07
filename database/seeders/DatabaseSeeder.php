<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run()
    {
        $this->call([
            AuthSystemSeeder::class,
            UserSeeder::class,
            /* PaisSeeder::class,
            ComunidadSeeder::class,
            ProvinciaSeeder::class,
            MunicipioSeeder::class, */
            TipoIncidenciaSeeder::class, // Añadido aquí
            TipoEmpleadoSeeder::class,
            GeneroSeeder::class,
            TipoDocumentoSeeder::class,
            EstadoEmpleadoSeeder::class,
            EmpleadoSeeder::class,
            UserRoleSeeder::class,
            TeamSeeder::class,
            PermissionUserSeeder::class,
            EmpresaSeeder::class,
            EstadoCentroSeeder::class,
            CentroSeeder::class,
            DepartamentoSeeder::class,
            TurnoSeeder::class,
            ModalidadSeeder::class,
            JornadaSeeder::class,
            JornadaTurnoSeeder::class,
            AsignacionSeeder::class,
            TipoContratoSeeder::class,
            ContratoSeeder::class,
            PermisoCategoriaSeeder::class,
            PermisoSeeder::class,
            EstadoSolicitudPermisoSeeder::class,
            SolicitudPermisoSeeder::class,
            TipoEventoSeeder::class,
            EventoSeeder::class,
            EventoUserSeeder::class,
            //TipoNotificationSeeder::class,
            NotificationSeeder::class,
            NivelSeguridadSeeder::class,
            TipoFicheroSeeder::class,
            NivelAccesoSeeder::class,
            //FileSeeder::class,
            //FolderSeeder::class,
            EstadoHorarioSeeder::class,
            HorarioSeeder::class,
            LinkSeeder::class,
            TipoIncidenciaSeeder::class,
        ]);
    }
}
