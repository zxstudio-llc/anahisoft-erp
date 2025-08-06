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
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name');
            $table->string('logo_path')->nullable();
            $table->string('favicon_path')->nullable();
            $table->string('primary_color')->default('#3b82f6');
            $table->string('secondary_color')->default('#10b981');
            $table->json('social_links')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('support_email')->nullable();
            $table->string('support_phone')->nullable();
            $table->text('address')->nullable();
            $table->text('site_description')->nullable();
            $table->string('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->json('analytics_data')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_keywords')->nullable();
            $table->string('seo_description')->nullable();
            $table->json('seo_metadata')->nullable();
            $table->json('social_network')->nullable();
            $table->timestamps();
        });
        
        // Migración para temas
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['web', 'dashboard']);
            $table->json('colors');
            $table->json('styles');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
        
        // Migración para footers
        Schema::create('footers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('template');
            $table->json('content');
            $table->boolean('is_active')->default(false);
            $table->string('logo_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('themes');
        Schema::dropIfExists('footers');
    }
};
