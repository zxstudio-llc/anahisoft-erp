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
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('document_type', 2)->default('01'); // 01=Invoice
            $table->string('establishment_code', 3);
            $table->string('emission_point', 3);
            $table->string('sequential', 9);
            $table->string('access_key', 49)->nullable(); // SRI access key
            $table->date('issue_date');
            $table->string('payment_method', 2)->default('01'); // 01=No system, 15=Other payment
            $table->decimal('subtotal_0', 12, 2)->default(0); // Subtotal VAT 0%
            $table->decimal('subtotal_12', 12, 2)->default(0); // Subtotal VAT 12%
            $table->decimal('subtotal_14', 12, 2)->default(0); // Subtotal VAT 14%
            $table->decimal('subtotal_exempt', 12, 2)->default(0);
            $table->decimal('subtotal_no_subject', 12, 2)->default(0);
            $table->decimal('ice_value', 12, 2)->default(0);
            $table->decimal('vat_value', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('currency', 10)->default('DOLAR');
            $table->text('additional_info')->nullable();
            $table->string('status', 20)->default('draft'); // draft, authorized, rejected, canceled
            $table->text('xml_content')->nullable();
            $table->string('authorization_number', 49)->nullable();
            $table->timestamp('authorization_date')->nullable();
            $table->timestamps();
            
            $table->unique(['establishment_code', 'emission_point', 'sequential']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('invoices');
    }
}; 