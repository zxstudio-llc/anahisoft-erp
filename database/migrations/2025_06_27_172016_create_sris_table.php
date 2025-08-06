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
        Schema::create('sris', function (Blueprint $table) {
            $table->string('identification', 13)->primary();
            $table->string('business_name')->nullable();
            $table->string('legal_name')->nullable();
            $table->string('commercial_name')->nullable();
            $table->string('status')->nullable();
            $table->string('taxpayer_type')->nullable();
            $table->string('taxpayer_status')->nullable();
            $table->string('taxpayer_class')->nullable();
            $table->string('regime')->nullable()->default('GENERAL');
            $table->text('main_activity')->nullable();
            $table->string('start_date')->nullable();
            $table->string('cessation_date')->nullable();
            $table->string('restart_date')->nullable();
            $table->string('update_date')->nullable();
            $table->string('accounting_required')->nullable()->default('NO');
            $table->string('withholding_agent')->nullable()->default('NO');
            $table->string('special_taxpayer')->nullable()->default('NO');
            $table->string('ghost_taxpayer')->nullable()->default('NO');
            $table->string('nonexistent_transactions')->nullable()->default('NO');
            $table->json('legal_representatives')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->text('head_office_address')->nullable();
            $table->decimal('debt_amount', 10, 2)->nullable();
            $table->string('debt_description')->nullable();
            $table->json('establishments')->nullable();
            $table->json('challenge')->nullable();
            $table->json('remission')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('taxpayer_type');
            $table->index('regime');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sris');
    }
};