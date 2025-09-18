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
        Schema::create('sri_documents', function (Blueprint $table) {
            $table->id();
            $table->morphs('documentable'); // Can be invoice, purchase, withholding
            $table->string('document_type', 2);
            $table->string('access_key', 49)->unique();
            $table->string('authorization_number', 49)->nullable();
            $table->string('status', 20)->default('pending'); // pending, authorized, rejected, canceled
            $table->text('xml_signed')->nullable();
            $table->text('sri_response')->nullable();
            $table->json('validation_errors')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('authorized_at')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sri_documents');
    }
};
