<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Tenant\Category;
use App\Models\Tenant\Product;
use App\Models\Tenant\Client;
use App\Models\Tenant\Settings;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class TenantDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear permisos
        $permissions = [
            'view-dashboard',
            'manage-users',
            'manage-clients',
            'manage-products',
            'manage-categories',
            'manage-invoices',
            'manage-sales',
            'manage-settings',
            'manage-api-keys',
            'view-reports',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Crear roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $managerRole = Role::firstOrCreate(['name' => 'manager']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee']);

        // Asignar permisos a roles
        $adminRole->givePermissionTo(Permission::all());
        $managerRole->givePermissionTo([
            'view-dashboard', 
            'manage-clients', 
            'manage-products', 
            'manage-categories',
            'manage-invoices', 
            'manage-sales', 
            'view-reports'
        ]);
        $employeeRole->givePermissionTo([
            'view-dashboard', 
            'manage-clients', 
            'manage-products', 
            'manage-invoices', 
            'manage-sales'
        ]);

        // Crear usuario administrador del tenant
        $admin = User::firstOrCreate(
            ['email' => 'admin@' . tenant('id') . '.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // Crear usuario manager
        $manager = User::firstOrCreate(
            ['email' => 'manager@' . tenant('id') . '.com'],
            [
                'name' => 'Gerente',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $manager->assignRole('manager');

        // Crear categorías de ejemplo
        $categories = [
            ['name' => 'Productos', 'description' => 'Categoría para productos físicos'],
            ['name' => 'Servicios', 'description' => 'Categoría para servicios profesionales'],
            ['name' => 'Consultoría', 'description' => 'Servicios de consultoría especializada'],
            ['name' => 'Software', 'description' => 'Productos y servicios de software'],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['name' => $categoryData['name']],
                $categoryData
            );
        }

        // Crear productos de ejemplo
        $productsCategory = Category::where('name', 'Productos')->first();
        $servicesCategory = Category::where('name', 'Servicios')->first();
        $softwareCategory = Category::where('name', 'Software')->first();

        $products = [
            [
                'code' => 'DELL-INS-001',
                'name' => 'Laptop Dell Inspiron',
                'description' => 'Laptop Dell Inspiron 15 3000',
                'item_type' => 'product',
                'unit_price' => 2118.64,
                'price' => 2500.00,
                'cost' => 2000.00,
                'stock' => 10,
                'unit_type' => 'NIU',
                'currency' => 'PEN',
                'igv_type' => '10',
                'igv_percentage' => 18.00,
                'has_igv' => true,
                'category_id' => $productsCategory->id,
                'brand' => 'Dell',
                'model' => 'Inspiron 15 3000',
                'is_active' => true,
            ],
            [
                'code' => 'CONS-IT-001',
                'name' => 'Consultoría IT',
                'description' => 'Servicio de consultoría en tecnologías de información',
                'item_type' => 'service',
                'unit_price' => 127.12,
                'price' => 150.00,
                'cost' => null,
                'stock' => 0,
                'unit_type' => 'NIU',
                'currency' => 'PEN',
                'igv_type' => '10',
                'igv_percentage' => 18.00,
                'has_igv' => true,
                'category_id' => $servicesCategory->id,
                'is_active' => true,
            ],
            [
                'code' => 'OFF365-001',
                'name' => 'Licencia Office 365',
                'description' => 'Licencia anual de Microsoft Office 365',
                'item_type' => 'service',
                'unit_price' => 101.69,
                'price' => 120.00,
                'cost' => 80.00,
                'stock' => 50,
                'unit_type' => 'NIU',
                'currency' => 'PEN',
                'igv_type' => '10',
                'igv_percentage' => 18.00,
                'has_igv' => true,
                'category_id' => $softwareCategory->id,
                'brand' => 'Microsoft',
                'model' => 'Office 365 Business',
                'is_active' => true,
            ],
        ];

        foreach ($products as $productData) {
            Product::firstOrCreate(
                ['code' => $productData['code']],
                $productData
            );
        }

        // Crear clientes de ejemplo
        $clients = [
            [
                'name' => 'Juan Pérez García',
                'email' => 'juan.perez@email.com',
                'phone' => '999123456',
                'address' => 'Av. Javier Prado 123, San Isidro',
                'document_type' => '1', // DNI según catálogo SUNAT
                'document_number' => '12345678',
                'district' => 'San Isidro',
                'province' => 'Lima',
                'department' => 'Lima',
                'is_active' => true,
            ],
            [
                'name' => 'Empresa ABC SAC',
                'email' => 'contacto@empresaabc.com',
                'phone' => '014567890',
                'address' => 'Jr. Lampa 456, Cercado de Lima',
                'document_type' => '6', // RUC según catálogo SUNAT
                'document_number' => '20123456789',
                'district' => 'Cercado de Lima',
                'province' => 'Lima',
                'department' => 'Lima',
                'is_active' => true,
            ],
            [
                'name' => 'María González López',
                'email' => 'maria.gonzalez@email.com',
                'phone' => '987654321',
                'address' => 'Calle Los Olivos 789, Miraflores',
                'document_type' => '1', // DNI según catálogo SUNAT
                'document_number' => '87654321',
                'district' => 'Miraflores',
                'province' => 'Lima',
                'department' => 'Lima',
                'is_active' => true,
            ],
        ];

        foreach ($clients as $clientData) {
            Client::firstOrCreate(
                ['document_number' => $clientData['document_number']],
                $clientData
            );
        }

        // Crear configuraciones iniciales del tenant
        Settings::firstOrCreate(
            ['ruc' => '20000000000'],
            [
                'company_name' => 'Mi Empresa ' . tenant('id'),
                'ruc' => '20000000000',
                'business_name' => 'Mi Empresa ' . tenant('id') . ' S.A.C.',
                'trade_name' => 'Mi Empresa ' . tenant('id'),
                'company_address' => 'Av. Principal 123, Lima, Perú',
                'company_phone' => '01-1234567',
                'company_email' => 'contacto@' . tenant('id') . '.com',
                'company_tax_id' => '20000000000',
                'currency' => 'PEN',
                'timezone' => 'America/Lima',
                'status' => 'ACTIVO',
                'condition' => 'HABIDO',
                'address' => 'Av. Principal 123',
                'department' => 'LIMA',
                'province' => 'LIMA',
                'district' => 'LIMA',
                'sunat_mode' => 'demo',
                'invoice_series' => 'F001',
                'receipt_series' => 'B001',
                'credit_note_series' => 'FC01',
                'debit_note_series' => 'FD01',
                'invoice_footer' => 'Gracias por su preferencia',
                'receipt_footer' => 'Gracias por su compra',
                'note_footer' => 'Nota emitida electrónicamente',
            ]
        );

        $this->command->info('Datos iniciales del tenant creados exitosamente!');
        $this->command->info('Usuario admin: admin@' . tenant('id') . '.com');
        $this->command->info('Usuario manager: manager@' . tenant('id') . '.com');
        $this->command->info('Contraseña para ambos: password');
    }
}
