<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array {
        return [
            'business_name' => 'required|string|max:255',
            'trade_name' => 'nullable|string|max:255',
            'ruc' => 'required|string|size:13',
            'sri_environment' => 'required|in:1,2', // 1=Pruebas, 2=Producción
            'establishment_code' => 'required|string|size:3',
            'emission_point' => 'required|string|size:3',
            'address' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
        ];
    }
}