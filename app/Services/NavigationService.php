<?php

namespace App\Services;

use App\Models\Link;
use Illuminate\Support\Collection;

class NavigationService
{
    /**
     * Obtiene un árbol completo de navegación
     * 
     * This method retrieves all links and organizes them into a hierarchical structure.
     * 
     * It first orders the links by importance, recency, weight, creation date and name.
     *
     * @return Collection<int, Link>
     */
    public function getNavigationTree()
    {
        $links = Link::with(['permission'])
            ->orderBy('is_important', 'desc')
            ->orderBy('is_recent', 'desc')
            ->orderBy('weight', 'desc')
            ->orderBy('created_at', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return $this->buildLinkTree($links);
    }

    /**
     * Construye una rama de navegación a partir de un enlace
     * 
     * This method builds a branch of navigation starting from a given link.
     * 
     * It creates a hierarchical structure with the link and recursively loads its children.
     * 
     * @param Link $link
     * @return Link
     */
    public function buildBranchFromLink(Link $link)
    {
        // Cargar los hijos directos si no están ya cargados
        if (!$link->relationLoaded('children')) {
            $link->load(['children', 'permission'])
                ->orderBy('is_important', 'desc')
                ->orderBy('is_recent', 'desc')
                ->orderBy('weight', 'desc')
                ->orderBy('created_at', 'asc')
                ->orderBy('name', 'asc')
            ;
        }

        // Si el enlace tiene hijos, construir sus ramas recursivamente
        if ($link->children->isNotEmpty()) {
            $processedChildren = $link->children->map(function ($child) {
                return $this->buildBranchFromLink($child);
            });

            // Establecer la relación children con los hijos procesados
            $link->setRelation('children', $processedChildren);
        } else {
            // Asegurar que la relación children existe como colección vacía
            $link->setRelation('children', collect());
        }

        return $link;
    }

    /**
     * Construye un árbol a partir de una colección plana de enlaces
     *
     * @param Collection<Link> $links
     * @param int|null $parentId
     * 
     * @return Collection<int, Link>
     */
    public function buildLinkTree($links, $parentId = null)
    {
        $branch = collect();

        // Filtrar enlaces que pertenecen a este nivel
        $children = $links->where('parent_id', $parentId);

        // Para cada enlace en este nivel, agregar sus hijos recursivamente
        foreach ($children as $child) {
            // Encontrar y agregar todos los hijos de este enlace
            $childrenBranch = $this->buildLinkTree($links, $child->id);

            // Si hay hijos, establecer la relación
            if ($childrenBranch->isNotEmpty()) {
                $child->setRelation('children', $childrenBranch);
            } else {
                // Si no hay hijos, asegurar que la relación 'children' exista como colección vacía
                $child->setRelation('children', collect());
            }

            $branch->push($child);
        }

        return $branch;
    }

    /**
     * Obtiene navegación específica para un usuario
     * 
     * @param \App\Models\User $user
     * @return Collection
     */
    public function getUserNavigationTree($user): Collection
    {
        // Obtener permisos del usuario
        $permissionIds = $user->getAllPermissions()->pluck('id');

        // Verificar si el usuario tiene empleado asignado
        $hasEmployee = !is_null($user->empleado_id);

        $query = Link::with(['permission'])
            ->where(function ($query) use ($permissionIds) {
                $query->whereIn('permission_id', $permissionIds)
                      ->orWhereNull('permission_id');
            });

        // Filtrar por requerimiento de empleado
        if (!$hasEmployee) {
            // Si el usuario no tiene empleado, excluir enlaces que lo requieren
            $query->where('requires_employee', false);
        }
        // Si tiene empleado, mostrar todos los enlaces (tanto los que requieren como los que no)

        $links = $query->orderBy('is_important', 'desc')
            ->orderBy('is_recent', 'desc')
            ->orderBy('weight', 'desc')
            ->orderBy('created_at', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return $this->buildLinkTree($links);
    }
}
