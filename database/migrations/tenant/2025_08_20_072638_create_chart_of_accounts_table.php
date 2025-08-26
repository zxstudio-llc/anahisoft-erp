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
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('code', 20)->unique();
            $table->string('name', 300);
            $table->string('account_type', 20); // asset, liability, equity, income, expense
            $table->string('account_subtype', 50)->nullable();
            $table->string('parent_code', 20)->nullable();
            $table->integer('level');
            $table->boolean('is_detail')->default(false);
            $table->decimal('initial_balance', 12, 2)->default(0);
            $table->decimal('debit_balance', 12, 2)->default(0);
            $table->decimal('credit_balance', 12, 2)->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::table('chart_of_accounts', function (Blueprint $table) {
            $table->foreign('parent_code')
                  ->references('code')
                  ->on('chart_of_accounts');
        });
    }

    public function down()
    {
        Schema::dropIfExists('chart_of_accounts');
    }
};