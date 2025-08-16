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
        Schema::create('settings', function (Blueprint $table) {
            // Company Information
            $table->id();
            $table->string('company_name');
            $table->string('company_logo')->nullable();
            $table->string('company_address')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('company_email')->nullable();
            $table->string('company_tax_id')->nullable();
            $table->string('currency', 3)->default('USD');
            $table->string('timezone')->default('America/Guayaquil');
            
            // Tax Information (SRI Ecuador)
            $table->string('tax_identification_number'); // RUC
            $table->string('legal_name'); // Business Name (Razón Social)
            $table->string('commercial_name')->nullable(); // Trade Name (Nombre Comercial)
            $table->string('company_status')->nullable(); // ACTIVE, INACTIVE
            $table->string('company_type')->nullable(); // NATURAL, LEGAL_ENTITY
            $table->string('main_address')->nullable(); // Head Office Address
            $table->string('branch_address')->nullable(); // Branch Address
            $table->string('province')->nullable();
            $table->string('canton')->nullable();
            $table->string('parish')->nullable();
            $table->string('establishment_code')->nullable();
            $table->string('emission_point_code')->nullable();
            $table->date('registration_date')->nullable();
            $table->string('accounting_system')->nullable();
            $table->string('economic_activity_code')->nullable();
            $table->json('secondary_economic_activities')->nullable();
            $table->string('tax_responsibility_code')->nullable();
            $table->json('tax_responsibilities')->nullable();
            $table->string('special_taxpayer_number')->nullable();
            $table->date('special_taxpayer_date')->nullable();
            $table->string('withholding_agent_number')->nullable();
            $table->date('withholding_agent_date')->nullable();
            $table->string('electronic_document_system')->nullable();
            
            // Electronic Invoicing Configuration
            $table->string('sri_mode')->default('test'); // test, production
            $table->string('certificate')->nullable(); // Original certificate field
            $table->string('certificate_path')->nullable(); // Path to digital certificate
            $table->string('certificate_password')->nullable(); // Certificate password
            $table->string('electronic_signature')->nullable();
            
            // Endpoints Configuration
            $table->string('endpoint_recepcion')->default('https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl');
            $table->string('endpoint_autorizacion')->default('https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl');
            
            // Document Series Configuration
            $table->json('document_series')->nullable(); // Flexible JSON configuration
            $table->string('invoice_series')->default('001-001-000000000');
            $table->string('receipt_series')->default('001-001-000000000');
            $table->string('credit_note_series')->default('001-001-000000000');
            $table->string('debit_note_series')->default('001-001-000000000');
            $table->string('withholding_receipt_series')->default('001-001-000000000');
            $table->string('liquidation_series')->default('001-001-000000000');
            
            // Reporting Configuration
            $table->string('logo_path')->nullable();
            $table->text('report_header')->nullable();
            $table->text('report_footer')->nullable();
            $table->text('invoice_footer')->nullable();
            $table->text('receipt_footer')->nullable();
            $table->text('note_footer')->nullable();
            $table->boolean('print_legal_text')->default(true);
            $table->boolean('print_tax_info')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};