<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('business_name', 300);
            $table->string('trade_name', 300)->nullable();
            $table->string('ruc', 13)->unique(); // Ecuador RUC format
            $table->string('email', 100);
            $table->string('phone', 20)->nullable();
            $table->string('address', 300);
            $table->string('establishment_code', 3)->default('001'); // SRI establishment code
            $table->string('emission_point', 3)->default('001'); // SRI emission point
            $table->string('sri_environment', 1)->default('1'); // 1=Test, 2=Production
            $table->text('digital_signature')->nullable(); // P12 certificate
            $table->string('signature_password')->nullable();
            $table->boolean('special_taxpayer')->default(false);
            $table->boolean('accounting_required')->default(false);
            $table->json('sri_certificates')->nullable(); // Store certificate info
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('companies');
    }
};