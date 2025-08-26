<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return [
        'sku' => 'required|string|max:100',
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'price' => 'required|numeric|min:0',
        'cost' => 'nullable|numeric|min:0',
        'vat_rate' => 'required|in:0,2', // 0% or 13% -> map in service (code "2" for tarifa del 13%)
        'track_inventory' => 'boolean',
        'stock' => 'nullable|numeric|min:0'
    ];}
}