<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('withholding_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('withholding_id')->constrained()->onDelete('cascade');
            $table->string('tax_type', 1); // 1=Income Tax, 2=VAT
            $table->string('tax_code', 5);
            $table->decimal('taxable_base', 12, 2);
            $table->decimal('rate', 5, 2);
            $table->decimal('withheld_value', 12, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('withholding_details');
    }
};