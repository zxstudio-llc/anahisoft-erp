<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('model_id')->nullable();
            $table->string('model_type')->nullable();
            $table->index(['model_id', 'model_type']);
            $table->longText('description')->nullable();
            $table->string('route')->unique();
            $table->string('title')->nullable();
            $table->string('image')->nullable();
            $table->string('author')->nullable();
            $table->string('robots')->nullable();
            $table->string('keywords')->nullable();
            $table->string('canonical_url')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo');
    }
};
