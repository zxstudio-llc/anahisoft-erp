<?php

namespace App\Http\Services\Tenant;

use App\Models\Tenant\Invoices;
use App\Models\Tenant\SriDocument;
use App\Models\Tenant\Company;

class SrisLastService
{
    public const WSDL = [
        'test' => [
            'recepcion' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
            'autorizacion' => 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl',
        ],
        'prod' => [
            'recepcion' => 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
            'autorizacion' => 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl',
        ],
    ];

    public function authorizeInvoice(Invoice $invoice): void
    {
        $xml = $this->generateInvoiceXml($invoice);
        $signedXml = $this->signXml($xml, $invoice->company);
        $respRecep = $this->sendReception($signedXml, $invoice->company);
        $respAuto = $this->requestAuthorization($invoice->access_key, $invoice->company);
        $this->storeSriDocument($invoice, $signedXml, $respRecep, $respAuto);
    }

    public function resend(SriDocument $doc): void
    {
        $company = $doc->company; /** @var Company $company */
        $this->sendReception($doc->signed_xml, $company);
        $this->requestAuthorization($doc->access_key, $company);
    }

    protected function sendReception(string $signedXml, Company $company): array
    {
        $wsdl = $company->sri_environment == '2' ? self::WSDL['prod']['recepcion'] : self::WSDL['test']['recepcion'];
        $client = new SoapClient($wsdl, [ 'trace' => true, 'exceptions' => true ]);
        $params = [ 'xml' => base64_encode($signedXml) ];
        $result = $client->__soapCall('validarComprobante', [$params]);
        return json_decode(json_encode($result), true);
    }

    protected function requestAuthorization(string $accessKey, Company $company): array
    {
        $wsdl = $company->sri_environment == '2' ? self::WSDL['prod']['autorizacion'] : self::WSDL['test']['autorizacion'];
        $client = new SoapClient($wsdl, [ 'trace' => true, 'exceptions' => true ]);
        $params = [ 'claveAccesoComprobante' => $accessKey ];
        $result = $client->__soapCall('autorizacionComprobante', [$params]);
        return json_decode(json_encode($result), true);
    }

    protected function storeSriDocument(Invoice $invoice, string $signedXml, array $recep, array $auto): void
    {
        $status = 'rejected';
        $authorizedAt = null;

        $estado = data_get($auto, 'autorizaciones.autorizacion.estado')
               ?? data_get($recep, 'estado');

        if (in_array($estado, ['AUTORIZADO', 'RECIBIDA'])) {
            $status = ($estado === 'AUTORIZADO') ? 'authorized' : 'received';
            if ($status === 'authorized') {
                $authorizedAt = now();
            }
        }

        SriDocument::updateOrCreate([
            'company_id' => $invoice->company_id,
            'documentable_type' => Invoice::class,
            'documentable_id' => $invoice->id,
        ], [
            'document_type' => $invoice->document_type,
            'access_key' => $invoice->access_key,
            'status' => $status,
            'sri_response' => json_encode(['recepcion' => $recep, 'autorizacion' => $auto]),
            'signed_xml' => $signedXml,
            'sent_at' => now(),
            'authorized_at' => $authorizedAt,
        ]);

        $invoice->update([
            'status' => $status,
            'authorization_number' => $status === 'authorized' ? $invoice->access_key : null,
            'authorization_date' => $authorizedAt,
        ]);
    }

    protected function generateInvoiceXml(Invoice $invoice): string
    {
        return view('xml.invoice', [
            'invoice' => $invoice->load(['company','customer','details.product']),
        ])->render();
    }

    protected function signXml(string $xml, Company $company): string
    {
        // TODO: integrate XAdES-BES signing
        return $xml;
    }

    /** Build 49-digit access key (SRI) */
    public static function buildAccessKey(string $issueDateDMY, string $docCode, string $ruc, string $env, string $estab, string $ptoEmi, string $secuencial, string $codigoNum = null, string $tipoEmision = '1'): string
    {
        $codigoNum = $codigoNum ?: str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT) . '0000000000000000000';
        $base = $issueDateDMY.$docCode.$ruc.$env.$estab.$ptoEmi.$secuencial.$codigoNum.$tipoEmision;
        $dv = self::mod11($base);
        return $base.$dv;
    }

    /** Modulo 11 per SRI (weights 2..7) */
    public static function mod11(string $digits): int
    {
        $sum = 0; $mult = 2;
        for ($i = strlen($digits)-1; $i >= 0; $i--) {
            $sum += intval($digits[$i]) * $mult;
            $mult = ($mult == 7) ? 2 : $mult + 1;
        }
        $mod = 11 - ($sum % 11);
        if ($mod == 11) return 0; if ($mod == 10) return 1; return $mod;
    }
    

    // public function authorizeInvoice(Invoice $invoice): void
    // {
    //     // Generate XML according to SRI specification
    //     $xml = $this->generateInvoiceXml($invoice);
        
    //     // Sign XML with digital certificate
    //     $signedXml = $this->signXml($xml, $invoice->company);
        
    //     // Send to SRI for authorization
    //     $response = $this->sendToSri($signedXml, $invoice->company);
        
    //     // Process SRI response
    //     $this->processSriResponse($invoice, $response);
    // }

    // private function generateInvoiceXml(Invoice $invoice): string
    // {
    //     $company = $invoice->company;
    //     $customer = $invoice->customer;
        
    //     return view('xml.invoice', compact('invoice', 'company', 'customer'))->render();
    // }

    // private function signXml(string $xml, Company $company): string
    // {
    //     // Implementation depends on digital signature library
    //     // This is a simplified version
    //     return $xml; // In production, implement actual signing
    // }

    // private function sendToSri(string $signedXml, Company $company): array
    // {
    //     $url = $company->sri_environment == '1' 
    //         ? 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl'
    //         : 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';

    //     // Implementation using SOAP client
    //     // This is simplified - actual implementation requires SOAP calls
    //     return [
    //         'estado' => 'RECIBIDA',
    //         'comprobantes' => []
    //     ];
    // }

    // private function processSriResponse(Invoice $invoice, array $response): void
    // {
    //     $status = $response['estado'] === 'RECIBIDA' ? 'authorized' : 'rejected';
        
    //     SriDocument::create([
    //         'company_id' => $invoice->company_id,
    //         'documentable_type' => Invoices::class,
    //         'documentable_id' => $invoice->id,
    //         'document_type' => $invoice->document_type,
    //         'access_key' => $invoice->access_key,
    //         'status' => $status,
    //         'sri_response' => json_encode($response),
    //         'sent_at' => now(),
    //         'authorized_at' => $status === 'authorized' ? now() : null
    //     ]);

    //     $invoice->update([
    //         'status' => $status,
    //         'authorization_number' => $status === 'authorized' ? $invoice->access_key : null,
    //         'authorization_date' => $status === 'authorized' ? now() : null
    //     ]);
    // }
}