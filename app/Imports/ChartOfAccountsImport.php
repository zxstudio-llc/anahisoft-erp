<?php

namespace App\Imports;

use App\Models\Tenant\ChartOfAccount;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;

class ChartOfAccountsImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows, SkipsOnFailure
{
    use SkipsFailures;

    /**
     * Mapear cada fila a un modelo
     */
    private array $insertedCodes = [];

    public function model(array $row)
    {
        $code = trim($row['codigo_cuenta'] ?? $row['codigo'] ?? null);
        $name = trim($row['nombre_cuenta'] ?? $row['nombre'] ?? null);
        $financialStatementType = $row['tipo_estado_financiero'] ?? null;
        $creditDebitType = $row['credito_debito'] ?? $row['credito/debito'] ?? 'neutral';
        $hasSubaccounts = $row['tiene_subcuentas'] ?? 'no';

        if (!$code || !$name || !$financialStatementType) {
            \Log::warning("Fila omitida por datos faltantes", $row);
            return null;
        }

        $accountType = $this->mapFinancialStatementType($financialStatementType);
        $creditDebit = $this->normalizeCreditDebit($creditDebitType);
        $isDetail = strtolower(trim($hasSubaccounts)) === 'no';
        $level = $this->calculateLevel($code);
        $parentCode = $this->determineParentCode($code);

        // Verificar si el padre ya fue insertado o es null (cuenta raíz)
        if ($parentCode && !in_array($parentCode, $this->insertedCodes)) {
            // No insertar aún, esperar a que el padre exista
            \Log::info("Fila pospuesta por padre inexistente: {$code}, padre: {$parentCode}");
            return null;
        }

        try {
            $account = ChartOfAccount::create([
                'company_id' => $this->getCompanyId(),
                'code' => $code,
                'name' => $name,
                'account_type' => $accountType,
                'account_subtype' => $financialStatementType,
                'parent_code' => $parentCode,
                'level' => $level,
                'is_detail' => $isDetail,
                'credit_debit_type' => $creditDebit,
                'initial_balance' => 0,
                'debit_balance' => 0,
                'credit_balance' => 0,
                'active' => true,
            ]);

            // Guardar en cache temporal
            $this->insertedCodes[] = $code;

            return $account;

        } catch (\Exception $e) {
            \Log::error('Error al crear cuenta:', [
                'code' => $code,
                'name' => $name,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Reglas de validación para cada fila
     */
    public function rules(): array
    {
        return [
            '*.codigo_cuenta' => 'required|string|max:20',
            '*.nombre_cuenta' => 'required|string|max:255',
            '*.tipo_estado_financiero' => 'required|string',
            '*.credito_debito' => 'nullable|string|in:debito,credito,neutral,DEBITO,CREDITO,NEUTRAL',
            '*.tiene_subcuentas' => 'nullable|string|in:si,no,SI,NO',
        ];
    }

    /**
     * Mensajes personalizados de validación
     */
    public function customValidationMessages()
    {
        return [
            '*.codigo_cuenta.required' => 'El código de cuenta es obligatorio',
            '*.nombre_cuenta.required' => 'El nombre de cuenta es obligatorio',
            '*.tipo_estado_financiero.required' => 'El tipo de estado financiero es obligatorio',
            '*.credito_debito.in' => 'El tipo crédito/débito debe ser: DEBITO, CREDITO o NEUTRAL',
            '*.tiene_subcuentas.in' => 'Tiene subcuentas debe ser: SI o NO',
        ];
    }

    /**
     * Mapear tipo de estado financiero a account_type estándar
     */
    private function mapFinancialStatementType(string $type): string
    {
        $type = strtoupper(trim($type));
        
        $typeMap = [
            'CUENTAS DE ORDEN' => 'asset',
            'ESTADO DE CAMBIOS EN EL PATRIMONIO' => 'equity',
            'ESTADO DE FLUJO DE EFECTIVO' => 'asset', // Puede ser asset o liability dependiendo del contexto
            'ESTADO DE SITUACION' => 'asset', // Puede ser asset, liability o equity
            'ESTADO DE RESULTADOS' => 'income', // Puede ser income o expense
        ];

        // Si no encuentra mapeo exacto, intentar inferir por palabras clave
        if (!isset($typeMap[$type])) {
            if (strpos($type, 'PATRIMONIO') !== false || strpos($type, 'CAPITAL') !== false) {
                return 'equity';
            } elseif (strpos($type, 'RESULTADO') !== false || strpos($type, 'INGRESO') !== false) {
                return 'income';
            } elseif (strpos($type, 'GASTO') !== false || strpos($type, 'COSTO') !== false) {
                return 'expense';
            } elseif (strpos($type, 'PASIVO') !== false || strpos($type, 'DEUDA') !== false) {
                return 'liability';
            } else {
                return 'asset'; // Default
            }
        }

        return $typeMap[$type];
    }

    /**
     * Normalizar crédito/débito
     */
    private function normalizeCreditDebit(string $type): string
    {
        $type = strtoupper(trim($type));
        
        switch ($type) {
            case 'DEBITO':
            case 'DÉBITO':
            case 'DEBIT':
                return 'debit';
            case 'CREDITO':
            case 'CRÉDITO':
            case 'CREDIT':
                return 'credit';
            case 'NEUTRAL':
            default:
                return 'neutral';
        }
    }

    /**
     * Calcular nivel jerárquico basado en el código
     */
    private function calculateLevel(string $code): int
    {
        $cleanCode = preg_replace('/[^0-9]/', '', $code);
        
        if (strlen($cleanCode) <= 1) return 1;
        if (strlen($cleanCode) <= 2) return 2;
        if (strlen($cleanCode) <= 4) return 3;
        if (strlen($cleanCode) <= 6) return 4;
        return 5;
    }

    /**
     * Determinar código padre basado en la jerarquía
     */
    private function determineParentCode(string $code): ?string
    {
        $cleanCode = preg_replace('/[^0-9]/', '', $code);
        $level = $this->calculateLevel($code);
        
        if ($level <= 1) return null;
        
        if ($level == 2) return substr($cleanCode, 0, 1);
        if ($level == 3) return substr($cleanCode, 0, 2);
        if ($level == 4) return substr($cleanCode, 0, 4);
        
        return null;
    }

    /**
     * Obtener company_id de la sesión
     */
    private function getCompanyId(): ?int
    {
        return session('active_company_id');
    }
}