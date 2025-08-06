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
        // Crear tabla page_views
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->string('url');
            $table->string('referer')->nullable();
            $table->string('user_agent')->nullable();
            
            // Campos SEO importantes
            $table->string('title')->nullable(); // Título de la página
            $table->text('meta_description')->nullable(); // Meta description
            $table->json('meta_keywords')->nullable(); // Keywords
            
            // Métricas de comportamiento
            $table->integer('time_on_page')->default(0); // Tiempo en segundos
            $table->boolean('is_bounce')->default(false); // Si fue rebote
            $table->string('exit_page')->nullable(); // Página de salida
            
            // Información del dispositivo y navegador
            $table->string('device_type')->nullable(); // mobile, desktop, tablet
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->string('screen_resolution')->nullable();
            
            // Información de ubicación
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            
            // Fuente de tráfico
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('utm_content')->nullable();
            
            // Campos para conversiones
            $table->boolean('is_conversion')->default(false);
            $table->string('conversion_type')->nullable();
            $table->decimal('conversion_value', 10, 2)->nullable();
            
            // Hash de sesión para tracking
            $table->string('session_id')->nullable();
            $table->boolean('is_new_visitor')->default(true);
            
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index(['url', 'created_at']);
            $table->index(['utm_source', 'utm_medium']);
            $table->index(['device_type']);
            $table->index(['is_bounce']);
            $table->index(['session_id']);
        });

        // Tabla para keywords y posiciones SEO
        Schema::create('seo_keywords', function (Blueprint $table) {
            $table->id();
            $table->string('keyword');
            $table->string('url');
            $table->integer('position')->nullable();
            $table->integer('clicks')->default(0);
            $table->integer('impressions')->default(0);
            $table->decimal('ctr', 5, 2)->default(0);
            $table->decimal('avg_position', 5, 2)->nullable();
            $table->date('date');
            $table->timestamps();
            
            $table->unique(['keyword', 'url', 'date']);
            $table->index(['keyword', 'date']);
            $table->index(['url', 'date']);
        });

        // Tabla para errores 404 y problemas SEO
        Schema::create('seo_errors', function (Blueprint $table) {
            $table->id();
            $table->string('url');
            $table->integer('status_code');
            $table->string('error_type'); // 404, 500, redirect_chain, etc.
            $table->text('error_message')->nullable();
            $table->string('referer')->nullable();
            $table->string('user_agent')->nullable();
            $table->integer('count')->default(1);
            $table->timestamp('first_seen');
            $table->timestamp('last_seen');
            $table->timestamps();
            
            $table->index(['url', 'status_code']);
            $table->index(['error_type']);
        });

        // Tabla para Core Web Vitals
        Schema::create('core_web_vitals', function (Blueprint $table) {
            $table->id();
            $table->string('url');
            $table->decimal('lcp', 8, 2)->nullable(); // Largest Contentful Paint
            $table->decimal('fid', 8, 2)->nullable(); // First Input Delay
            $table->decimal('cls', 8, 4)->nullable(); // Cumulative Layout Shift
            $table->decimal('fcp', 8, 2)->nullable(); // First Contentful Paint
            $table->decimal('ttfb', 8, 2)->nullable(); // Time to First Byte
            $table->string('device_type');
            $table->timestamps();
            
            $table->index(['url', 'created_at']);
            $table->index(['device_type']);
        });

        // Tabla para backlinks
        Schema::create('backlinks', function (Blueprint $table) {
            $table->id();
            $table->string('source_url');
            $table->string('target_url');
            $table->string('anchor_text')->nullable();
            $table->string('link_type'); // dofollow, nofollow
            $table->integer('domain_authority')->nullable();
            $table->integer('page_authority')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('first_detected');
            $table->timestamp('last_checked');
            $table->timestamps();
            
            $table->unique(['source_url', 'target_url']);
            $table->index(['target_url']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backlinks');
        Schema::dropIfExists('core_web_vitals');
        Schema::dropIfExists('seo_errors');
        Schema::dropIfExists('seo_keywords');
        
        Schema::dropIfExists('page_views');
    }
};