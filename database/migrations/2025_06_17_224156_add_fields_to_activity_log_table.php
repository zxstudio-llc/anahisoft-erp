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
        Schema::table('activity_log', function (Blueprint $table) {
            $table->string('ip_address')->nullable()->after('properties');
            $table->string('user_agent')->nullable()->after('ip_address');
            $table->string('url')->nullable()->after('user_agent');
            $table->string('method')->nullable()->after('url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            $table->dropColumn('ip_address');
            $table->dropColumn('user_agent');
            $table->dropColumn('url');
            $table->dropColumn('method');
        });
    }
};
