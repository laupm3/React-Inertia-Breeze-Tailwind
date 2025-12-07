<?php

namespace App\Console\Commands;

use App\Models\Link;
use Illuminate\Console\Command;

class UpdateLinksEmployeeRequirement extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'links:employee-requirement
                            {action : Acción a realizar (list|set|unset)}
                            {--route=* : Nombres de rutas específicas}
                            {--name=* : Nombres de enlaces específicos}
                            {--all : Aplicar a todos los enlaces}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gestiona qué enlaces requieren que el usuario tenga empleado asignado';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'list':
                $this->listLinks();
                break;
            case 'set':
                $this->setEmployeeRequirement(true);
                break;
            case 'unset':
                $this->setEmployeeRequirement(false);
                break;
            default:
                $this->error('Acción no válida. Use: list, set, unset');
                return 1;
        }

        return 0;
    }

    /**
     * Lista todos los enlaces y su estado actual
     */
    private function listLinks()
    {
        $links = Link::orderBy('name')->get();

        if ($links->isEmpty()) {
            $this->info('No hay enlaces en la base de datos.');
            return;
        }

        $headers = ['ID', 'Nombre', 'Ruta', 'Requiere Empleado'];
        $rows = [];

        foreach ($links as $link) {
            $rows[] = [
                $link->id,
                $link->name,
                $link->route_name ?? 'N/A',
                $link->requires_employee ? '✓' : '✗'
            ];
        }

        $this->table($headers, $rows);
    }

    /**
     * Establece o remueve el requerimiento de empleado
     */
    private function setEmployeeRequirement(bool $requires)
    {
        $routes = $this->option('route');
        $names = $this->option('name');
        $all = $this->option('all');

        if (!$routes && !$names && !$all) {
            $this->error('Debe especificar --route, --name o --all');
            return;
        }

        $query = Link::query();

        if ($all) {
            // Aplicar a todos los enlaces
            $links = $query->get();
        } else {
            // Filtrar por rutas o nombres específicos
            $query->where(function ($q) use ($routes, $names) {
                if ($routes) {
                    $q->whereIn('route_name', $routes);
                }
                if ($names) {
                    $q->orWhereIn('name', $names);
                }
            });
            $links = $query->get();
        }

        if ($links->isEmpty()) {
            $this->warn('No se encontraron enlaces que coincidan con los criterios.');
            return;
        }

        $action = $requires ? 'requerir' : 'no requerir';
        $this->info("Enlaces que se configurarán para {$action} empleado:");
        
        foreach ($links as $link) {
            $this->line("- {$link->name} ({$link->route_name})");
        }

        if ($this->confirm('¿Continuar con la actualización?')) {
            $updated = Link::whereIn('id', $links->pluck('id'))
                ->update(['requires_employee' => $requires]);

            $action = $requires ? 'requieren' : 'no requieren';
            $this->info("✓ {$updated} enlaces actualizados para que {$action} empleado.");
        } else {
            $this->info('Operación cancelada.');
        }
    }
}
