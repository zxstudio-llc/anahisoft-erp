<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('withholdings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->morphs('withholdable'); // Can be purchase or invoice
            $table->string('document_type', 2)->default('07'); // 07=Withholding
            $table->string('establishment_code', 3);
            $table->string('emission_point', 3);
            $table->string('sequential', 9);
            $table->string('access_key', 49)->nullable();
            $table->date('issue_date');
            $table->string('period', 7); // MM/YYYY
            $table->decimal('withheld_vat', 12, 2)->default(0);
            $table->decimal('withheld_income_tax', 12, 2)->default(0);
            $table->string('status', 20)->default('draft');
            $table->text('xml_content')->nullable();
            $table->string('authorization_number', 49)->nullable();
            $table->timestamp('authorization_date')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('withholdings');
    }
};
