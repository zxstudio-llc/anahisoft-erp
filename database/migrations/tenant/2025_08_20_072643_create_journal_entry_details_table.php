<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('journal_entry_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_entry_id')->constrained()->onDelete('cascade');
            $table->string('account_code', 20);
            $table->text('description');
            $table->decimal('debit', 12, 2)->default(0);
            $table->decimal('credit', 12, 2)->default(0);
            $table->timestamps();
            
            $table->foreign('account_code')->references('code')->on('chart_of_accounts');
        });
    }

    public function down()
    {
        Schema::dropIfExists('journal_entry_details');
    }
};
