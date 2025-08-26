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
        Schema::create('providers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('document_type', 2)->nullable();
            $table->string('document_number', 20)->unique();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('province')->nullable();
            $table->string('canton')->nullable();
            $table->string('parish')->nullable();
            $table->string('country')->default('EC');
            $table->string('payment_terms')->nullable();
            $table->decimal('credit_limit', 12, 2)->default(0);
            $table->decimal('current_balance', 12, 2)->default(0);
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index('name');
            $table->index('document_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('providers');
    }
};