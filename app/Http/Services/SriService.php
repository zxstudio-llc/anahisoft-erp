<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SriService
{
    // Endpoints principales (solo mantenemos los que funcionan)
    private const BASE_URL_RUC = 'https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/obtenerPorNumerosRuc?=&ruc=';
    private const BASE_URL_ESTABLECIMIENTOS = 'https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/Establecimiento/consultarPorNumeroRuc?numeroRuc=';

    /**
     * Traduce todas las claves del array de español a inglés
     */
    private function translateAllKeys(array $data): array
    {
        $translated = [
            'contributor' => [
                'identification' => $data['contribuyente']['identificacion'] ?? null,
                'denomination' => $data['contribuyente']['denominacion'] ?? null,
                'type' => $data['contribuyente']['tipo'] ?? null,
                'class' => $data['contribuyente']['clase'] ?? null,
                'id_type' => $data['contribuyente']['tipoIdentificacion'] ?? null,
                'resolution' => $data['contribuyente']['resolucion'] ?? null,
                'business_name' => $data['contribuyente']['nombreComercial'] ?? null,
                'trade_name' => $data['contribuyente']['nombreComercial'] ?? null,
                'head_office_address' => $data['contribuyente']['direccionMatriz'] ?? null,
                'info_date' => $data['contribuyente']['fechaInformacion'] ?? null,
                'message' => $data['contribuyente']['mensaje'] ?? null,
                'status' => $data['contribuyente']['estado'] ?? null,
            ],
            'ruc_info' => $this->translateInfoRucKeys($data['infoRuc'] ?? []),
        ];

        return $translated;
    }

    private function translateInfoRucKeys(array $info): array
    {
        return [
            'ruc_number' => $info['numeroRuc'] ?? null,
            'legal_name' => $info['razonSocial'] ?? null,
            'status' => $info['estadoContribuyenteRuc'] ?? null,
            'main_activity' => $info['actividadEconomicaPrincipal'] ?? null,
            'taxpayer_type' => $info['tipoContribuyente'] ?? null,
            'regime' => $info['regimen'] ?? null,
            'accounting_required' => $info['obligadoLlevarContabilidad'] ?? null,
            'withholding_agent' => $info['agenteRetencion'] ?? null,
            'special_taxpayer' => $info['contribuyenteEspecial'] ?? null,
            'taxpayer_dates_information' => [
                'start_date' => $info['informacionFechasContribuyente']['fechaInicioActividades'] ?? null,
                'cessation_date' => $info['informacionFechasContribuyente']['fechaCese'] ?? null,
                'restart_date' => $info['informacionFechasContribuyente']['fechaReinicioActividades'] ?? null,
                'update_date' => $info['informacionFechasContribuyente']['fechaActualizacion'] ?? null,
            ],
            'legal_representatives' => $info['representantesLegales'] ?? [],
            'cancellation_reason' => $info['motivoCancelacionSuspension'] ?? null,
            'ghost_taxpayer' => $info['contribuyenteFantasma'] ?? null,
            'nonexistent_transactions' => $info['transaccionesInexistente'] ?? null,
            'establishments' => $info['establecimientos'] ?? [],
        ];
    }


    /**
     * Obtiene datos del RUC usando la API REST
     */
    public function getRucData(string $ruc): array
    {
        Log::debug("Obteniendo datos RUC para: {$ruc}");
        $data = [];
        
        try {
            $rucUrl = self::BASE_URL_RUC . $ruc;
            Log::debug("Consultando URL RUC: {$rucUrl}");
            
            $response = Http::timeout(30)
                ->withHeaders($this->getApiHeaders())
                ->get($rucUrl);

            if (!$response->successful()) {
                Log::error("Error al obtener datos RUC", [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                throw new \Exception('Error al obtener datos del RUC: ' . $response->status());
            }

            $rucData = $response->json();
            Log::debug("Datos RUC recibidos", $rucData);
            $data = $rucData[0] ?? [];
            
            try {
                $establecimientos = $this->getEstablecimientos($ruc);
                Log::debug("Establecimientos obtenidos", $establecimientos);
                
                if (!empty($establecimientos)) {
                    $data['establecimientos'] = $establecimientos;
                }
            } catch (\Exception $e) {
                Log::error("Error obteniendo establecimientos: " . $e->getMessage());
                $data['establecimientos'] = ['error' => $e->getMessage()];
            }

        } catch (\Exception $e) {
            Log::error('Error en getRucData', [
                'ruc' => $ruc,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }

        return $this->translateAllKeys(['infoRuc' => $data]);
    }

    /**
     * Obtiene los establecimientos usando la API REST
     */
    private function getEstablecimientos(string $ruc): array
    {
        $establecimientosUrl = self::BASE_URL_ESTABLECIMIENTOS . $ruc;
        Log::debug("Consultando establecimientos en URL: {$establecimientosUrl}");
        
        $response = Http::timeout(30)
            ->withHeaders($this->getApiHeaders())
            ->get($establecimientosUrl);

        if (!$response->successful()) {
            Log::error("Error al obtener establecimientos", [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            throw new \Exception('Error al obtener establecimientos: ' . $response->status());
        }

        $establecimientos = $response->json();
        Log::debug("Datos de establecimientos recibidos", $establecimientos);

        return array_map(function ($est) {
            $direccion = $est['direccionCompleta'] ?? '';
            return [
                'establishment_number' => $est['numeroEstablecimiento'] ?? null,
                'commercial_name' => $est['nombreFantasiaComercial'] ?? null,
                'establishment_type' => $est['tipoEstablecimiento'] ?? null,
                'complete_address' => $direccion,
                'establishment_status' => $est['estado'] ?? null,
                'is_headquarters' => ($est['matriz'] ?? '') === 'SI',
                'province' => $this->extractProvince($direccion),
                'canton' => $this->extractCanton($direccion),
                'parish' => $this->extractParish($direccion)
            ];
        }, $establecimientos);
    }
        /**
     * Extrae la provincia de la dirección
     */
    private function extractProvince(string $direccion): ?string
    {
        $parts = explode('/', $direccion);
        return trim($parts[0] ?? '');
    }

    /**
     * Extrae el cantón de la dirección
     */
    private function extractCanton(string $direccion): ?string
    {
        $parts = explode('/', $direccion);
        return trim($parts[1] ?? '');
    }

    /**
     * Extrae la parroquia de la dirección
     */
    private function extractParish(string $direccion): ?string
    {
        $parts = explode('/', $direccion);
        return trim($parts[2] ?? '');
    }

    /**
     * Obtiene datos del registro civil (opcional)
     */
    private function getRegistroCivilData(string $identification): array
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders($this->getApiHeaders())
                ->get(self::BASE_URL_REGISTRO_CIVIL . $identification);

            if (!$response->successful()) {
                return ['error' => 'No se pudo obtener datos del registro civil'];
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::warning('Error obteniendo datos registro civil', [
                'identification' => $identification,
                'error' => $e->getMessage()
            ]);
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Formatea la dirección del establecimiento
     */
    private function formatDireccionEstablecimiento(array $establecimiento): string
    {
        $parts = [
            $establecimiento['direccion'] ?? null,
            $establecimiento['localidad'] ?? null,
            $establecimiento['provincia'] ?? null,
            $establecimiento['canton'] ?? null,
            $establecimiento['parroquia'] ?? null
        ];

        return implode(' / ', array_filter($parts));
    }

    /**
     * Headers comunes para las peticiones a la API
     */
    private function getApiHeaders(): array
    {
        return [
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept' => 'application/json',
            'Accept-Language' => 'es-EC,es;q=0.9',
            'Referer' => 'https://srienlinea.sri.gob.ec/',
            'Origin' => 'https://srienlinea.sri.gob.ec',
            'X-Requested-With' => 'XMLHttpRequest'
        ];
    }
}