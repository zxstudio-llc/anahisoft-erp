<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            // ✅ ELIMINADO: company_id
            $table->date('entry_date');
            $table->string('reference')->nullable();
            $table->string('module')->nullable(); // sales, purchases, manual
            $table->unsignedBigInteger('module_id')->nullable();
            $table->text('description')->nullable();
            $table->decimal('total_debit', 14, 2)->default(0);
            $table->decimal('total_credit', 14, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};