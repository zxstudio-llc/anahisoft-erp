<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 255);
            $table->string('financial_statement_type', 50);
            $table->string('financial_statement_type_original', 300);
            $table->enum('nature', ['debit', 'credit', 'neutral']);
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('chart_of_accounts')
                  ->onDelete('cascade');
            $table->integer('level')->default(1);
            $table->boolean('has_children')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('chart_of_accounts');
    }
};
