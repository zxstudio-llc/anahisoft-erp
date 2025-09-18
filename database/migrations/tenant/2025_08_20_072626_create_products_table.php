<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('item_type')->default('product')->comment('Tipo: producto o servicio')->after('description');
            $table->decimal('price', 12, 2)->comment('Precio de venta (incluye impuestos)');
            $table->string('unit_type', 10)->default('UNI'); // Unidad
            $table->decimal('unit_price', 12, 4);
            $table->decimal('cost', 12, 4)->nullable()->comment('Costo del producto')->default(0);
            $table->string('vat_rate', 2)->default('1'); 
            $table->string('ice_rate', 2)->nullable(); // Special tax rate
            $table->string('irbpnr_rate', 2)->nullable(); // Tax on plastic bottles
            $table->boolean('has_igv')->default(true); // Campo que la migración de categorías espera
            $table->unsignedBigInteger('category_id')->nullable(); // Campo de categoría
            $table->string('category')->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('barcode')->nullable();
            $table->string('sku')->nullable();
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->boolean('track_inventory')->default(true);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Agregar índice para category_id
            $table->index('category_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
};