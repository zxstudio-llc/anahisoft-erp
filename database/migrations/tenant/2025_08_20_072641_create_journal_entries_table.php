<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('entry_number', 20)->unique();
            $table->date('entry_date');
            $table->string('reference')->nullable();
            $table->string('reference_type', 50)->nullable(); // invoice, purchase, manual
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('module')->nullable(); // sales, purchases, manual
            $table->unsignedBigInteger('module_id')->nullable();
            $table->text('description')->nullable();
            $table->decimal('total_debit', 14, 2)->default(0);
            $table->decimal('total_credit', 14, 2)->default(0);
            $table->string('status', 20)->default('draft'); // draft, posted
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('journal_entries');
    }
};
