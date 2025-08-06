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
        Schema::create('invoice_usage', function (Blueprint $table) {
            $table->id();
            $table->integer('total_invoices')->default(0);
            $table->integer('monthly_invoices')->default(0);
            $table->integer('limit')->default(0);
            $table->timestamp('last_reset')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_usage');
    }
}; 