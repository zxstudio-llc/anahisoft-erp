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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->date('due_date')->nullable();
            $table->string('number');
            $table->string('series')->nullable();
            $table->string('currency', 3)->default('PEN');
            $table->decimal('exchange_rate', 10, 3)->default(1.000);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax', 12, 2);
            $table->decimal('total', 12, 2);
            $table->enum('status', ['draft', 'pending', 'paid', 'cancelled'])->default('draft');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index('date');
            $table->index('status');
            $table->unique(['series', 'number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
}; 