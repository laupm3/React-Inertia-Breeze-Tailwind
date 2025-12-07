<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

/**
 * Script para asignar permisos correctos de Import/Export a usuarios
 * Usa los nombres de permisos actualizados del permissions.json
 */

use App\Models\User;
use App\Models\Permission;

echo "🔐 ASIGNACIÓN DE PERMISOS IMPORT/EXPORT (VERSIÓN ACTUALIZADA) 🔐\n";
echo str_repeat("=", 60) . "\n\n";

// ⭐ CONFIGURACIÓN - EDITAR SEGÚN NECESIDADES
$userEmail = 'christhian@admin.com';  // 👈 CAMBIAR ESTE EMAIL

// Permisos correctos según permissions.json
$permissions_to_assign = [
    'importAssignments',
    'exportAssignments',
    'importEmployees',
    'exportEmployees',
    'importUsers',
    'exportUsers',
    'importCompanies',
    'exportCompanies',
    'importCenters',
    'exportCenters',
    'importDepartments',
    'exportDepartments',
    'importContracts',
    'exportContracts',
];

// Buscar usuario
$user = User::where('email', $userEmail)->first();

if (!$user) {
    echo "❌ Usuario con email '{$userEmail}' no encontrado\n";
    echo "📋 Usuarios disponibles:\n";
    User::limit(10)->get()->each(function($u) {
        echo "   - {$u->email} (ID: {$u->id})\n";
    });
    exit;
}

echo "👤 Usuario encontrado: {$user->email} (ID: {$user->id})\n";
echo "📋 Roles actuales: " . $user->roles->pluck('name')->join(', ') . "\n\n";

$permissions = Permission::whereIn('name', $permissions_to_assign)->get();

$assigned = 0;
$already_had = 0;
$not_found = [];

foreach ($permissions_to_assign as $permissionName) {
    $permission = $permissions->firstWhere('name', $permissionName);
    
    if (!$permission) {
        $not_found[] = $permissionName;
        echo "⚠️  No encontrado: {$permissionName}\n";
        continue;
    }
    
    if (!$user->hasPermissionTo($permission)) {
        $user->givePermissionTo($permission);
        echo "✅ Asignado: {$permission->name}\n";
        $assigned++;
    } else {
        echo "⚡ Ya tenía: {$permission->name}\n";
        $already_had++;
    }
}

echo "\n" . str_repeat("-", 50) . "\n";
echo "📊 RESUMEN:\n";
echo "   - Nuevos permisos asignados: {$assigned}\n";
echo "   - Permisos que ya tenía: {$already_had}\n";
echo "   - Permisos no encontrados: " . count($not_found) . "\n";
echo "   - Total permisos procesados: " . ($assigned + $already_had) . "\n";

if (count($not_found) > 0) {
    echo "\n⚠️  PERMISOS NO ENCONTRADOS:\n";
    foreach ($not_found as $perm) {
        echo "   - {$perm}\n";
    }
    echo "\n💡 Asegúrate de que estos permisos existen en la base de datos.\n";
}

echo "\n🧪 VERIFICACIÓN FINAL:\n";
$testPermissions = ['importAssignments', 'exportAssignments', 'importEmployees', 'exportEmployees'];
foreach ($testPermissions as $permissionName) {
    $hasPermission = $user->can($permissionName);
    $status = $hasPermission ? '✅ SÍ' : '❌ NO';
    echo "   {$permissionName}: {$status}\n";
}

echo "\n🎉 ¡Proceso completado!\n";
echo "💡 El usuario {$user->email} ahora debería poder usar las funciones de import/export.\n\n";

echo "📝 PRÓXIMOS PASOS:\n";
echo "1. Refrescar la página en el navegador\n";
echo "2. Intentar usar el botón 'Importar' en cualquier entidad\n";
echo "3. Verificar que no aparezca el error 403 Forbidden\n\n";
