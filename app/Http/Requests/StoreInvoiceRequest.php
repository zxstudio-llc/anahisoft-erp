<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return [
        'customer_id' => 'required|exists:customers,id',
        'issue_date' => 'required|date',
        'payment_method' => 'nullable|string|max:2', // catalog SRI Tabla 26
        'additional_info' => 'nullable|string',
        'details' => 'required|array|min:1',
        'details.*.product_id' => 'required|exists:products,id',
        'details.*.quantity' => 'required|numeric|min:0.0001',
        'details.*.unit_price' => 'required|numeric|min:0',
        'details.*.discount' => 'nullable|numeric|min:0'
    ];}
}