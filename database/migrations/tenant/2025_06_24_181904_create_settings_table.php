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
            $table->string('tax_identification_number', 13); // RUC ecuatoriano (13 dígitos)
            $table->string('legal_name'); // Razón Social
            $table->string('commercial_name')->nullable(); // Nombre Comercial
            $table->string('company_status')->nullable()->default('ACTIVE'); // ACTIVE, INACTIVE
            $table->string('company_type')->nullable(); // NATURAL, JURIDICA
            $table->string('main_address')->nullable(); // Dirección Matriz
            $table->string('branch_address')->nullable(); // Dirección Sucursal
            $table->string('province')->nullable();
            $table->string('canton')->nullable();
            $table->string('parish')->nullable();
            $table->string('establishment_code', 3)->default('001'); // Código de establecimiento (3 dígitos)
            $table->string('emission_point_code', 3)->default('001'); // Punto de emisión (3 dígitos)
            $table->date('registration_date')->nullable(); // Fecha de registro en SRI
            $table->string('accounting_system')->nullable();
            $table->string('economic_activity_code')->nullable(); // Código de actividad económica principal
            $table->json('secondary_economic_activities')->nullable(); // Actividades económicas secundarias
            $table->string('tax_responsibility_code')->nullable(); // Código de obligación tributaria
            $table->json('tax_responsibilities')->nullable(); // Obligaciones tributarias
            $table->string('special_taxpayer_number')->nullable(); // Número de contribuyente especial
            $table->date('special_taxpayer_date')->nullable();
            $table->string('withholding_agent_number')->nullable(); // Número de agente de retención
            $table->date('withholding_agent_date')->nullable();
            $table->string('electronic_document_system')->nullable();
            
            // Electronic Invoicing Configuration (SRI)
            $table->string('sri_mode')->default('test'); // test, production
            $table->string('certificate_path')->nullable(); // Ruta del certificado digital (.p12)
            $table->string('certificate_password')->nullable(); // Contraseña del certificado
            $table->string('electronic_signature')->nullable(); // Firma electrónica
            
            // Endpoints SRI Ecuador
            $table->string('endpoint_recepcion')->default('https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl');
            $table->string('endpoint_autorizacion')->default('https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl');
            $table->string('endpoint_consultas')->default('https://celcer.sri.gob.ec/comprobantes-electronicos-ws/ConsultaLote?wsdl');
            
            // Document Series Configuration (Formato SRI: 001-001-000000001)
            $table->string('invoice_series')->default('001-001-000000001'); // Factura
            $table->string('receipt_series')->default('001-001-000000001'); // Recibo
            $table->string('credit_note_series')->default('001-001-000000001'); // Nota de crédito
            $table->string('debit_note_series')->default('001-001-000000001'); // Nota de débito
            $table->string('withholding_receipt_series')->default('001-001-000000001'); // Comprobante de retención
            $table->string('liquidation_series')->default('001-001-000000001'); // Liquidación de compras
            
            // Reporting Configuration
            $table->string('logo_path')->nullable();
            $table->text('report_header')->nullable();
            $table->text('report_footer')->nullable();
            $table->text('invoice_footer')->nullable();
            $table->text('receipt_footer')->nullable();
            $table->text('note_footer')->nullable();
            $table->boolean('print_legal_text')->default(true);
            $table->boolean('print_tax_info')->default(true);
            
            // Campos adicionales para SRI
            $table->string('environment_type')->default('test'); // test, production
            $table->string('emission_type')->default('normal'); // normal, contingency
            $table->boolean('requires_electronic_signature')->default(true);
            
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