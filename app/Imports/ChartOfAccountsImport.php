<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use App\Models\Tenant\ChartOfAccount;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ChartOfAccountsImport implements ToModel, WithHeadingRow
{
    /**
    * @param Collection $collection
    */
    public function model(array $row)
    {
        return new ChartOfAccount([
            'company_id' => null, // global, puedes cambiar si quieres asociar a sucursal
            'code' => $row['CODIGO CUENTA'],
            'name' => $row['NOMBRE CUENTA'],
            'account_type' => strtolower($row['TIPO ESTADO FINANCIERO']), // asset, liability...
            'account_subtype' => $row['CUENTAS DE ORDEN'] ?? null,
            'parent_code' => null, // luego si quieres mapear jerarquía
            'level' => 1, // puedes inferir según el código
            'is_detail' => strtolower($row['TIENE SUBCUENTAS']) === 'si' ? true : false,
            'initial_balance' => 0,
            'debit_balance' => 0,
            'credit_balance' => 0,
            'active' => strtolower($row['estado']) === 'activa' ? true : false,
        ]);
    }
}
