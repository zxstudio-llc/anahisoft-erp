<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();

            // Información básica
            $table->string('name'); // Nombre o razón social
            $table->string('trade_name')->nullable(); // Nombre comercial
            $table->enum('identification_type', ['04', '05', '06', '07']); // 04=RUC, 05=Cédula, 06=Pasaporte, 07=Final Consumer
            $table->string('identification', 20)->unique();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            
            // Ubicación
            $table->string('province')->nullable();
            $table->string('canton')->nullable();
            $table->string('parish')->nullable();
            $table->string('country')->default('EC');

            // Información fiscal
            $table->boolean('special_taxpayer')->default(false);
            $table->boolean('accounting_required')->default(false);
            $table->boolean('withhold_income_tax')->default(true);
            $table->boolean('withhold_vat')->default(true);

            // Información financiera
            $table->string('payment_terms')->nullable();
            $table->decimal('credit_limit', 12, 2)->default(0);
            $table->decimal('current_balance', 12, 2)->default(0);

            // Control de estado
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->boolean('active')->default(true); // redundante pero puede usarse para lógica de negocio
            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('name');
            $table->index('identification');
        });
    }

    public function down()
    {
        Schema::dropIfExists('suppliers');
    }
};
