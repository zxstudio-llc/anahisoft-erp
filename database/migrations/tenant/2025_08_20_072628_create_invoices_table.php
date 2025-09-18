<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();

            // Diferenciar si es venta o compra
            $table->enum('type', ['sale', 'purchase'])->default('sale');

            // Relaciones
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->nullable()->constrained()->onDelete('cascade');

            // Datos principales SRI
            $table->string('document_type', 2)->default('01'); // 01 = Factura
            $table->string('establishment_code', 3);
            $table->string('emission_point', 3);
            $table->string('sequential', 9);
            $table->string('access_key', 49)->nullable()->unique();

            // Fechas
            $table->date('issue_date');
            $table->string('period', 7); // MM/YYYY

            // Totales
            $table->decimal('subtotal_12', 12, 2)->default(0);
            $table->decimal('subtotal_0', 12, 2)->default(0);
            $table->decimal('subtotal_no_tax', 12, 2)->default(0);
            $table->decimal('subtotal_exempt', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('ice', 12, 2)->default(0);
            $table->decimal('iva', 12, 2)->default(0);
            $table->decimal('tip', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);

            // Control SRI
            $table->enum('status', ['draft', 'issued', 'authorized', 'rejected', 'canceled'])->default('draft');
            $table->text('xml_content')->nullable();
            $table->string('authorization_number', 49)->nullable();
            $table->timestamp('authorization_date')->nullable();

            $table->timestamps();
            $table->softDeletes(); 

            // Unicidad del número de factura
            $table->unique(['establishment_code', 'emission_point', 'sequential'], 'uniq_invoice_number');
        });

        Schema::create('invoice_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');

            // Relación opcional con productos
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');

            // Campos requeridos por SRI
            $table->string('main_code', 50);      // Código principal
            $table->string('auxiliary_code', 50)->nullable(); // Código auxiliar
            $table->string('description');

            // Cantidades y valores
            $table->decimal('quantity', 12, 2);
            $table->decimal('unit_price', 12, 6);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('iva', 12, 2)->default(0);
            $table->decimal('ice', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);

            $table->timestamps();
            $table->softDeletes(); 
        });
    }

    public function down()
    {
        Schema::dropIfExists('invoice_details');
        Schema::dropIfExists('invoices');
    }
};
