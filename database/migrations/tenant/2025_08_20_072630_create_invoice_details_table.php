<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('invoice_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 12, 4);
            $table->decimal('unit_price', 12, 4);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2);
            $table->string('vat_rate', 2);
            $table->decimal('vat_value', 12, 2);
            $table->decimal('ice_rate', 10, 6)->nullable();
            $table->decimal('ice_value', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('invoice_details');
    }
};