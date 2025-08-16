<?php

namespace App\Models\SRI;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sri extends Model
{
    use HasFactory;

    protected $primaryKey = 'identification';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'identification',
        'business_name',
        'legal_name',
        'commercial_name',
        'status',
        'taxpayer_type',
        'taxpayer_status',
        'taxpayer_class',
        'regime',
        'main_activity',
        'start_date',
        'cessation_date',
        'restart_date',
        'update_date',
        'accounting_required',
        'withholding_agent',
        'special_taxpayer',
        'ghost_taxpayer',
        'nonexistent_transactions',
        'legal_representatives',
        'cancellation_reason',
        'head_office_address',
        'debt_amount',
        'debt_description',
        'establishments',
        'challenge',
        'remission'
    ];

    protected $casts = [
        'establishments' => 'array',
        'challenge' => 'array',
        'remission' => 'array',
        'legal_representatives' => 'array',
    ];

    public static function createFromApiData(array $data, string $identification): self
    {
        $rucInfo = $data['ruc_info'] ?? [];
        if (isset($rucInfo[0])) {
            $rucInfo = $rucInfo[0];
        }
        $establishments = $rucInfo['establishments'] ?? [];
        $datesInfo = $rucInfo['informacionFechasContribuyente'] ?? [];
        $headOfficeAddress = null;
        foreach ($establishments as $est) {
            if (($est['is_headquarters'] ?? false) || ($est['matriz'] ?? '') === 'SI') {
                $headOfficeAddress = $est['complete_address'] ?? $est['direccionCompleta'] ?? null;
                break;
            }
        }
        $legalRepresentatives = is_array($rucInfo['legal_representatives'] ?? null) 
            ? $rucInfo['legal_representatives'] 
            : [];
        
        $mappedData = [
            'identification' => $identification,
            'business_name' => $data['contributor']['business_name'] ?? $rucInfo['legal_name'] ?? null,
            'legal_name' => $rucInfo['legal_name'] ?? $data['contributor']['business_name'] ?? null,
            'commercial_name' => $rucInfo['commercial_name'] ?? null,
            'status' => $data['contributor']['status'] ?? $rucInfo['taxpayer_status'] ?? null,
            'taxpayer_type' => $rucInfo['taxpayer_type'] ?? null,
            'taxpayer_status' => $rucInfo['taxpayer_status'] ?? null,
            'taxpayer_class' => $rucInfo['taxpayer_class'] ?? null,
            'regime' => $rucInfo['regime'] ?? 'GENERAL',
            
            'main_activity' => $rucInfo['main_activity'] ?? $rucInfo['actividadEconomicaPrincipal'] ?? null,
            'start_date' => $rucInfo['start_date'] ?? $rucInfo['taxpayer_dates_information']['fechaInicioActividades'] ?? null,
            'cessation_date' => $rucInfo['cessation_date'] ?? $rucInfo['taxpayer_dates_information']['fechaCese'] ?? null,
            'restart_date' => $rucInfo['restart_date'] ?? $rucInfo['taxpayer_dates_information']['fechaReinicioActividades'] ?? null,
            'update_date' => $rucInfo['update_date'] ?? $rucInfo['taxpayer_dates_information']['fechaActualizacion'] ?? null,
            
            'accounting_required' => $rucInfo['accounting_required'] ?? $rucInfo['obligadoLlevarContabilidad'] ?? 'NO',
            'withholding_agent' => $rucInfo['withholding_agent'] ?? $rucInfo['agenteRetencion'] ?? 'NO',
            'special_taxpayer' => $rucInfo['special_taxpayer'] ?? $rucInfo['contribuyenteEspecial'] ?? 'NO',
            'ghost_taxpayer' => $rucInfo['ghost_taxpayer'] ?? $rucInfo['contribuyenteFantasma'] ?? 'NO',
            'nonexistent_transactions' => $rucInfo['nonexistent_transactions'] ?? $rucInfo['transaccionesInexistente'] ?? 'NO',
            
            'legal_representatives' => $rucInfo['legal_representatives'] ?? [],
            'cancellation_reason' => $rucInfo['cancellation_reason'] ?? null,
            
            'head_office_address' => $data['contributor']['head_office_address'] ?? $headOfficeAddress,
            
            'debt_amount' => $data['debt']['amount'] ?? null,
            'debt_description' => $data['debt']['description'] ?? null,
            
            'establishments' => $establishments,
            'challenge' => $data['challenge'] ?? null,
            'remission' => $data['remission'] ?? null
        ];
    
        return static::updateOrCreate(
            ['identification' => $identification],
            $mappedData
        );
    }
}