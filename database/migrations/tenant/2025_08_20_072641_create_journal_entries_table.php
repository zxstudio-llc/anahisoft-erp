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
            $table->string('reference_type', 50)->nullable(); // invoice, purchase, manual
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('description');
            $table->decimal('total_debit', 12, 2);
            $table->decimal('total_credit', 12, 2);
            $table->string('status', 20)->default('draft'); // draft, posted
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('journal_entries');
    }
};
