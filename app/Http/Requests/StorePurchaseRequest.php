<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'supplier_id' => 'required|exists:suppliers,id',
            'document_type' => 'required|in:01,03,04,05,06,07,08',
            'establishment_code' => 'required|string|size:3',
            'emission_point' => 'required|string|size:3',
            'sequential' => 'required|string|size:9',
            'authorization' => 'nullable|string|max:64',
            'issue_date' => 'required|date',
            'receipt_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|numeric|min:0.0001',
            'details.*.unit_cost' => 'required|numeric|min:0',
            'details.*.discount' => 'nullable|numeric|min:0',
            'details.*.vat_rate' => 'nullable|in:0,2',
        ];
    }
}