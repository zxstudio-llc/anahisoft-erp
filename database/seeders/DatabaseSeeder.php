<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear planes de suscripción
        $this->call(SubscriptionPlanSeeder::class);

        // User::factory(10)->create();

        // Crear usuario admin central
        $admin = User::factory()->create([
            'name' => 'Admin Central',
            'email' => 'admin@example.com',
        ]);

        // Crear permisos básicos del sistema central
        $permissions = [
            'dashboard.view',
            'user.view',
            'user.create',
            'user.edit',
            'user.delete',
            'role.view',
            'role.create',
            'role.edit',
            'role.delete',
            'tenant.manage',
            'sales.view',
            'sales.create',
            'sales.edit',
            'sales.delete',
            'inventory.view',
            'inventory.manage',
            'cash.manage',
            'cash.view',
            'accounting.view',
            'accounting.manage',
            'reports.view',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Crear roles
        $adminRole = Role::findOrCreate('admin', 'web');
        $userRole = Role::findOrCreate('user', 'web');
        $sellerRole = Role::findOrCreate('vendedor', 'web');
        $cashierRole = Role::findOrCreate('cajero', 'web');
        $accountantRole = Role::findOrCreate('contador', 'web');

        // Asignar todos los permisos al rol admin
        $adminRole->givePermissionTo($permissions);

        // Asignar permisos básicos al rol user
        $userRole->givePermissionTo([
            'dashboard.view',
            'user.view'
        ]);
        
        // Asignar permisos al rol vendedor
        $sellerRole->givePermissionTo([
            'dashboard.view',
            'sales.view',
            'sales.create',
            'inventory.view',
        ]);
        
        // Asignar permisos al rol cajero
        $cashierRole->givePermissionTo([
            'dashboard.view',
            'cash.view',
            'cash.manage',
            'sales.view',
        ]);
        
        // Asignar permisos al rol contador
        $accountantRole->givePermissionTo([
            'dashboard.view',
            'accounting.view',
            'accounting.manage',
            'reports.view',
        ]);

        // Asignar rol admin al usuario admin central
        $admin->assignRole('admin');
    }
}
