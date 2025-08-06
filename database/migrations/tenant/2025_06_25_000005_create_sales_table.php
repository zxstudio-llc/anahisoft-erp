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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('igv', 10, 2);
            $table->decimal('total', 10, 2);
            $table->string('status')->default('PENDIENTE'); // PENDIENTE, COMPLETADO, ANULADO
            $table->text('notes')->nullable();
            
            // Campos de facturación electrónica
            $table->string('document_type')->nullable(); // 01: Factura, 03: Boleta
            $table->string('series')->nullable();
            $table->integer('number')->nullable();
            $table->string('sunat_response')->nullable();
            $table->string('sunat_ticket')->nullable();
            $table->string('xml_path')->nullable();
            $table->string('pdf_path')->nullable();
            $table->string('cdr_path')->nullable();
            $table->string('sunat_state')->nullable();
            $table->boolean('is_electronic')->default(false);
            $table->string('environment')->default('demo'); // demo, test, prod
            
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabla pivote para productos en la venta
        Schema::create('product_sale', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained();
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('igv', 10, 2);
            $table->decimal('total', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_sale');
        Schema::dropIfExists('sales');
    }
}; 