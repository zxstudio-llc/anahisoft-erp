<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('identification_type', 2); // 04=RUC, 05=Cédula, 06=Pasaporte, 07=Final Consumer
            $table->string('identification', 20)->nullable();
            $table->string('business_name', 300);
            $table->string('trade_name', 300)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('address', 300)->nullable();
            $table->boolean('special_taxpayer')->default(false);
            $table->boolean('accounting_required')->default(false);
            $table->decimal('credit_limit', 12, 2)->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            
            $table->unique(['company_id', 'identification']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('customers');
    }
};