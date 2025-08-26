<?php
namespace App\Services;

use App\Models\Tenant\Invoice;
use App\Models\Tenant\SriDocument;
use App\Models\Tenant\Company;
use App\Services\XadesSigner;
use SoapClient;
use Illuminate\Support\Str;

class SriService
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
        // Ensure access key exists
        if (! $invoice->access_key) {
            $date = date('dmY', strtotime($invoice->issue_date));
            $invoice->access_key = self::buildAccessKey(
                $date, '01', $invoice->company->ruc, (string)$invoice->company->sri_environment,
                $invoice->establishment_code, $invoice->emission_point, $invoice->sequential
            );
            $invoice->save();
        }

        $xml = $this->generateInvoiceXml($invoice);
        $signedXml = $this->signXml($xml, $invoice->company);
        $recep = $this->sendReception($signedXml, $invoice->company);
        $auto = $this->requestAuthorization($invoice->access_key, $invoice->company);
        $this->storeSriDocument($invoice, $signedXml, $recep, $auto);
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
        $client = new SoapClient($wsdl, [ 'trace' => 1, 'exceptions' => true ]);
        $params = [ 'xml' => base64_encode($signedXml) ];
        $result = $client->__soapCall('validarComprobante', [$params]);
        return json_decode(json_encode($result), true) ?: [];
    }

    protected function requestAuthorization(string $accessKey, Company $company): array
    {
        $wsdl = $company->sri_environment == '2' ? self::WSDL['prod']['autorizacion'] : self::WSDL['test']['autorizacion'];
        $client = new SoapClient($wsdl, [ 'trace' => 1, 'exceptions' => true ]);
        $params = [ 'claveAccesoComprobante' => $accessKey ];
        $result = $client->__soapCall('autorizacionComprobante', [$params]);
        return json_decode(json_encode($result), true) ?: [];
    }

    protected function storeSriDocument(Invoice $invoice, string $signedXml, array $recep, array $auto): void
    {
        $estado = data_get($auto, 'autorizaciones.autorizacion.estado')
               ?? data_get($recep, 'estado');

        $status = 'rejected';
        $authorizedAt = null;

        if ($estado === 'AUTORIZADO') {
            $status = 'authorized';
            $authorizedAt = now();
        } elseif (in_array($estado, ['RECIBIDA','EN_PROCESO'])) {
            $status = 'received';
        }

        SriDocument::updateOrCreate([
            'company_id' => $invoice->company_id,
            'documentable_type' => Invoice::class,
            'documentable_id' => $invoice->id,
        ], [
            'document_type' => $invoice->document_type ?? '01',
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
        // Uses XadesSigner (xmlseclibs required). If not installed, throws.
        $p12Path = config('sri.p12_path') ?? env('SRI_P12_PATH');
        $p12Pass = config('sri.p12_password') ?? env('SRI_P12_PASSWORD');
        if (! $p12Path || ! is_file($p12Path)) {
            throw new RuntimeException('Missing SRI_P12_PATH or file not found');
        }
        $signer = new XadesSigner($p12Path, $p12Pass);
        return $signer->sign($xml);
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
}