<?php

namespace App\Imports;

use App\Models\Tenant\ChartOfAccount;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Illuminate\Support\Collection;

class ChartOfAccountsImport implements ToCollection, WithHeadingRow, WithValidation, SkipsEmptyRows, SkipsOnFailure
{
    use SkipsFailures;

    private array $processedRows = [];
    private array $createdAccounts = [];

    /**
     * Procesar toda la colección - FILTRAR FILAS VACÍAS
     */
    public function collection(Collection $rows)
    {
        \Log::info("=== INICIANDO IMPORTACIÓN DIRECTA ===");
        \Log::info("Filas recibidas del Excel: " . count($rows));

        $validRows = 0;
        $skippedRows = 0;

        // Procesar filas y filtrar las completamente vacías
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // +2 porque Excel empieza en fila 2
            $preparedRow = $this->prepareRowDataDirect($row->toArray(), $rowNumber);
            
            // Solo agregar si la fila tiene contenido real
            if ($preparedRow) {
                $this->processedRows[] = $preparedRow;
                $validRows++;
            } else {
                $skippedRows++;
            }
        }

        \Log::info("Resumen procesamiento:", [
            'filas_válidas' => $validRows,
            'filas_vacías_omitidas' => $skippedRows,
            'total_procesado' => count($this->processedRows)
        ]);

        // Ordenar por nivel y código
        usort($this->processedRows, function ($a, $b) {
            if ($a['level'] === $b['level']) {
                return strcmp($a['code'], $b['code']);
            }
            return $a['level'] <=> $b['level'];
        });

        // Crear todas las cuentas
        $successful = 0;
        $failed = 0;
        
        foreach ($this->processedRows as $rowData) {
            $account = $this->createAccount($rowData);
            if ($account) {
                $successful++;
            } else {
                $failed++;
            }
        }

        \Log::info("=== IMPORTACIÓN COMPLETADA ===");
        \Log::info("Resumen final:", [
            'total_filas_excel' => count($rows),
            'filas_procesadas' => count($this->processedRows),
            'cuentas_creadas_exitosamente' => $successful,
            'cuentas_fallidas' => $failed,
            'total_en_bd' => count($this->createdAccounts)
        ]);
    }

    /**
     * Preparar datos directamente - CON FILTRO DE FILAS VACÍAS
     */
    private function prepareRowDataDirect(array $row, int $rowNumber): ?array
    {
        // Obtener valores directamente
        $values = array_values($row);
        
        // Intentar por nombres de columna primero
        $code = $this->getFirstNonEmpty($row, ['codigo_cuenta', 'codigo']) ?: ($values[0] ?? '');
        $name = $this->getFirstNonEmpty($row, ['nombre_cuenta', 'nombre']) ?: ($values[1] ?? '');
        $financialType = $this->getFirstNonEmpty($row, ['tipo_estado_financiero']) ?: ($values[2] ?? '');
        $creditDebit = $this->getFirstNonEmpty($row, ['credito_debito', 'creditodebito']) ?: ($values[3] ?? '');
        $hasSubaccounts = $this->getFirstNonEmpty($row, ['tiene_subcuentas']) ?: ($values[4] ?? '');

        // Limpiar espacios
        $code = trim($code);
        $name = trim($name);
        $financialType = trim($financialType);
        $creditDebit = trim($creditDebit);
        $hasSubaccounts = trim($hasSubaccounts);

        // FILTRO: Si tanto código como nombre están vacíos, omitir la fila
        if (empty($code) && empty($name)) {
            \Log::debug("Fila $rowNumber omitida: código y nombre vacíos");
            return null;
        }

        // FILTRO: Si solo hay valores que parecen headers o separadores
        if ($this->isHeaderOrSeparator($code, $name)) {
            \Log::debug("Fila $rowNumber omitida: parece header o separador", [
                'codigo' => $code,
                'nombre' => $name
            ]);
            return null;
        }

        // Si no hay código pero sí nombre, usar el número de fila como código
        if (empty($code) && !empty($name)) {
            $code = "ROW_" . $rowNumber;
            \Log::info("Fila $rowNumber: generando código '$code' para nombre: $name");
        }

        // Si no hay nombre, usar un nombre genérico
        if (empty($name)) {
            $name = "Cuenta " . $code;
        }

        // Log de la fila válida
        \Log::info("Fila $rowNumber válida:", [
            'codigo' => $code,
            'nombre' => substr($name, 0, 50) . (strlen($name) > 50 ? '...' : ''),
            'tipo_financiero' => $financialType,
            'subcuentas' => $hasSubaccounts
        ]);

        // Calcular jerarquía
        $level = $this->calculateLevel($code);
        $parentCode = $this->determineParentCode($code);

        return [
            'row_number' => $rowNumber,
            'code' => $code,
            'name' => $name,
            'financial_statement_type' => $this->mapFinancialStatementType($financialType, $code),
            'financial_statement_type_original' => $financialType,
            'nature' => $this->normalizeCreditDebit($creditDebit),
            'has_children' => $this->isHasSubaccounts($hasSubaccounts),
            'level' => $level,
            'parent_code' => $parentCode
        ];
    }

    /**
     * Detectar si una fila es un header o separador - CORREGIDO
     */
    private function isHeaderOrSeparator(string $code, string $name): bool
    {
        $codeUpper = strtoupper($code);
        $nameUpper = strtoupper($name);
        
        // Solo detectar headers reales (no cuentas válidas)
        // Un header típico sería algo como "CODIGO CUENTA" o "NOMBRE CUENTA"
        $realHeaderPatterns = [
            // Patrones de headers completos
            'CODIGO_CUENTA', 'CODIGO CUENTA', 'CÓDIGO_CUENTA', 'CÓDIGO CUENTA',
            'NOMBRE_CUENTA', 'NOMBRE CUENTA', 'ACCOUNT_CODE', 'ACCOUNT CODE',
            'TIPO_ESTADO_FINANCIERO', 'FINANCIAL_STATEMENT_TYPE',
            'CREDITO_DEBITO', 'TIENE_SUBCUENTAS'
        ];
        
        // Solo marcar como header si el código Y nombre coinciden con patrones típicos de headers
        foreach ($realHeaderPatterns as $pattern) {
            if ($codeUpper === $pattern || $nameUpper === $pattern) {
                return true;
            }
        }
        
        // Si el código no tiene formato de cuenta contable, podría ser header
        if (empty($code) || (!preg_match('/^\d+/', $code) && !preg_match('/^[A-Z]+_\d+/', $code))) {
            // Y si el nombre es muy genérico como "CODIGO" o "NOMBRE" solo
            $genericNames = ['CODIGO', 'CÓDIGO', 'NOMBRE', 'NAME', 'CODE', 'TIPO', 'TYPE'];
            if (in_array($nameUpper, $genericNames)) {
                return true;
            }
        }
        
        // Si contiene solo caracteres especiales (separadores)
        if (preg_match('/^[-*=_\s]+$/', $code) && preg_match('/^[-*=_\s]+$/', $name)) {
            return true;
        }
        
        return false;
    }

    /**
     * Obtener el primer valor no vacío de una lista de claves
     */
    private function getFirstNonEmpty(array $row, array $keys): string
    {
        foreach ($keys as $key) {
            if (isset($row[$key]) && !empty(trim($row[$key]))) {
                return trim($row[$key]);
            }
            // También buscar variaciones de la clave
            foreach ($row as $rowKey => $rowValue) {
                if (stripos($rowKey, $key) !== false && !empty(trim($rowValue))) {
                    return trim($rowValue);
                }
            }
        }
        return '';
    }

    /**
     * Validar solo el campo de subcuentas - SIMPLIFICADO
     */
    private function isHasSubaccounts(string $value): bool
    {
        if (empty($value)) {
            return false;
        }
        
        $normalized = strtoupper(trim($value));
        
        // Buscar variaciones de "SI"
        return in_array($normalized, ['SI', 'SÍ', 'YES', 'Y', 'S', '1', 'TRUE', 'VERDADERO']);
    }

    /**
     * Crear cuenta - SIN CAMBIOS
     */
    private function createAccount(array $data): ?ChartOfAccount
    {
        try {
            $parent = null;
            
            // Buscar padre si existe
            if ($data['parent_code']) {
                $parent = ChartOfAccount::where('code', $data['parent_code'])->first();
                
                if (!$parent) {
                    \Log::debug("Padre '{$data['parent_code']}' no encontrado para '{$data['code']}'");
                }
            }

            // Crear o actualizar cuenta
            $account = ChartOfAccount::updateOrCreate(
                ['code' => $data['code']],
                [
                    'name' => $data['name'],
                    'financial_statement_type' => $data['financial_statement_type'],
                    'financial_statement_type_original' => $data['financial_statement_type_original'],
                    'nature' => $data['nature'],
                    'parent_id' => $parent?->id,
                    'level' => $data['level'],
                    'has_children' => $data['has_children'],
                    'active' => true,
                ]
            );

            $this->createdAccounts[] = $account->code;
            
            \Log::info("✓ Cuenta: {$data['code']} - {$data['name']} (Subcuentas: " . ($data['has_children'] ? 'SI' : 'NO') . ")");
            
            return $account;

        } catch (\Exception $e) {
            \Log::error("✗ Error fila {$data['row_number']}:", [
                'codigo' => $data['code'],
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Reglas de validación - MÍNIMAS
     */
    public function rules(): array
    {
        return []; // Sin reglas de validación estrictas
    }

    public function customValidationMessages(): array
    {
        return [];
    }

    /**
     * Mapear tipo de estado financiero - CON FALLBACK
     */
    private function mapFinancialStatementType(string $type, string $code): string
    {
        if (empty($type)) {
            // Si no hay tipo, inferir del código
            return $this->inferTypeFromCode($code);
        }

        $type = strtoupper(trim($type));
        
        $typeMap = [
            'ESTADO DE SITUACION' => 'asset',
            'ESTADO DE SITUACIÓN' => 'asset',
            'ESTADO DE RESULTADOS' => 'income',
            'ESTADO DE CAMBIOS EN EL PATRIMONIO' => 'equity',
            'ESTADO DE FLUJO DE EFECTIVO' => 'asset',
            'CUENTAS DE ORDEN' => 'asset',
        ];

        if (isset($typeMap[$type])) {
            $mappedType = $typeMap[$type];
            
            // Refinar basado en código
            if (in_array($type, ['ESTADO DE SITUACION', 'ESTADO DE SITUACIÓN'])) {
                $mappedType = $this->determineAccountTypeByCode($code);
            }
            
            if ($type === 'ESTADO DE RESULTADOS') {
                $mappedType = $this->determineIncomeExpenseByCode($code);
            }
            
            return $mappedType;
        }

        // Fallback: inferir del código
        return $this->inferTypeFromCode($code);
    }

    /**
     * Inferir tipo desde código
     */
    private function inferTypeFromCode(string $code): string
    {
        $numericPart = preg_replace('/[^0-9]/', '', $code);
        $firstDigit = substr($numericPart, 0, 1);
        
        switch ($firstDigit) {
            case '1': return 'asset';
            case '2': return 'liability'; 
            case '3': return 'equity';
            case '4': return 'income';
            case '5': 
            case '6': return 'expense';
            default: return 'asset';
        }
    }
    
    private function determineAccountTypeByCode(string $code): string
    {
        $numericPart = preg_replace('/[^0-9]/', '', $code);
        $firstDigit = substr($numericPart, 0, 1);
        
        switch ($firstDigit) {
            case '1': return 'asset';
            case '2': return 'liability';
            case '3': return 'equity';
            default: return 'asset';
        }
    }
    
    private function determineIncomeExpenseByCode(string $code): string
    {
        $numericPart = preg_replace('/[^0-9]/', '', $code);
        $firstDigit = substr($numericPart, 0, 1);
        
        switch ($firstDigit) {
            case '4': return 'income';
            case '5':
            case '6': return 'expense';
            default: return 'income';
        }
    }

    /**
     * Normalizar crédito/débito - SIMPLIFICADO
     */
    private function normalizeCreditDebit(?string $type): string
    {
        if (empty($type)) return 'neutral';

        $normalized = strtoupper(trim($type));
        
        if (strpos($normalized, 'DEBIT') !== false || strpos($normalized, 'DÉBITO') !== false) {
            return 'debit';
        }
        
        if (strpos($normalized, 'CREDIT') !== false || strpos($normalized, 'CRÉDITO') !== false) {
            return 'credit';
        }
        
        return 'neutral';
    }

    /**
     * Calcular nivel - SIN CAMBIOS
     */
    private function calculateLevel(string $code): int
    {
        $dotCount = substr_count($code, '.');
        
        if ($dotCount === 0) {
            $numericPart = preg_replace('/[^0-9]/', '', $code);
            $length = strlen($numericPart);
            
            if ($length === 1) return 1;
            if ($length === 3) return 2;
            if ($length === 5) return 3;
            return 2;
        }
        
        return $dotCount + 2;
    }

    /**
     * Determinar código padre - SIN CAMBIOS
     */
    private function determineParentCode(string $code): ?string
    {
        if (str_contains($code, '.')) {
            $lastDotPos = strrpos($code, '.');
            return substr($code, 0, $lastDotPos);
        }
        
        $numericPart = preg_replace('/[^0-9]/', '', $code);
        $length = strlen($numericPart);
        
        if ($length === 1) return null;
        if ($length === 3) return substr($numericPart, 0, 1);
        if ($length === 5) return substr($numericPart, 0, 3);
        
        return null;
    }
}