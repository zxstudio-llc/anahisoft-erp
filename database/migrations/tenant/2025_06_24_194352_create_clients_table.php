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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('document_type', 2)->comment('01: DNI, 06: RUC, etc.');
            $table->string('document_number', 20)->unique();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('district')->nullable();
            $table->string('province')->nullable();
            $table->string('department')->nullable();
            $table->string('country')->default('PE');
            $table->string('ubigeo', 10)->nullable()->comment('Código de ubicación geográfica');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Índices para búsqueda rápida
            $table->index('document_type');
            $table->index('document_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
