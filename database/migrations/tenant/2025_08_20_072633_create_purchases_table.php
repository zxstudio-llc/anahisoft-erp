<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('providers');
            $table->string('document_type', 2)->default('01'); // 01=Invoice, 03=Liquidation
            $table->string('establishment_code', 3);
            $table->string('emission_point', 3);
            $table->string('sequential', 9);
            $table->string('authorization', 49)->nullable();
            $table->date('issue_date');
            $table->date('receipt_date')->default(now());
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('subtotal_0', 12, 2)->default(0);
            $table->decimal('subtotal_12', 12, 2)->default(0);
            $table->decimal('subtotal_14', 12, 2)->default(0);
            $table->decimal('subtotal_exempt', 12, 2)->default(0);
            $table->decimal('subtotal_no_subject', 12, 2)->default(0);
            $table->decimal('ice_value', 12, 2)->default(0);
            $table->decimal('vat_value', 12, 2)->default(0);
            $table->decimal('withheld_vat', 12, 2)->default(0);
            $table->decimal('withheld_income_tax', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('series')->nullable();
            $table->string('number')->nullable();
            $table->string('currency', 3)->default('USD');
            $table->enum('status', ['PENDING', 'APPROVED', 'CANCELLED', 'RECEIVED'])->default('RECEIVED');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['series', 'number']);
        });

        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('purchases');
    }
};