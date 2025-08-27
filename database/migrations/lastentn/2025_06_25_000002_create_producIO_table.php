<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('producio', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('Código interno del producto');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('item_type')->default('product')->comment('Tipo: producto o servicio')->after('description');
            $table->decimal('unit_price', 12, 2)->default(0)->comment('Valor unitario (precio sin IGV)')->after('item_type');
            $table->decimal('price', 12, 2)->comment('Precio de venta (incluye impuestos)');
            $table->decimal('cost', 12, 2)->nullable()->comment('Costo del producto');
            $table->integer('stock')->default(0);
            $table->string('unit_type', 4)->default('NIU')->comment('Código de unidad de medida (catálogo SUNAT)');
            $table->string('currency', 3)->default('PEN')->comment('Moneda (PEN: Soles, USD: Dólares)');
            $table->string('igv_type', 2)->default('10')->comment('Tipo de IGV (catálogo SUNAT)');
            $table->decimal('igv_percentage', 5, 2)->default(18.00)->comment('Porcentaje de IGV');
            $table->boolean('has_igv')->default(true)->comment('¿El precio incluye IGV?');
            $table->string('category')->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('barcode')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Índices para búsqueda rápida
            $table->index('code');
            $table->index('category');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
}; 