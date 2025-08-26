<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWithholdingRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'purchase_id' => 'required|exists:purchases,id',
            'issue_date' => 'required|date',
            'establishment_code' => 'required|string|size:3',
            'emission_point' => 'required|string|size:3',
            'sequential' => 'required|string|size:9',
            'income_tax_percent' => 'nullable|numeric|min:0',
            'vat_percent' => 'nullable|numeric|min:0',
            'income_tax_amount' => 'nullable|numeric|min:0',
            'vat_amount' => 'nullable|numeric|min:0',
        ];
    }
}
