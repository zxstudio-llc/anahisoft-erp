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
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('code', 50)->unique();
            $table->string('name', 300);
            $table->text('description')->nullable();
            $table->string('unit_measure', 10)->default('UNI'); // Unidad
            $table->decimal('unit_price', 12, 4);
            $table->decimal('cost', 12, 4)->default(0);
            $table->string('vat_rate', 2)->default('2'); // 0=0%, 2=12%, 3=14%, 6=No subject, 7=Exempt
            $table->string('ice_rate', 2)->nullable(); // Special tax rate
            $table->string('irbpnr_rate', 2)->nullable(); // Tax on plastic bottles
            $table->boolean('has_igv')->default(true); // Campo que la migración de categorías espera
            $table->unsignedBigInteger('category_id')->nullable(); // Campo de categoría
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