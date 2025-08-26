<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return [
        'identification_type' => 'required|in:04,05,06,07', // RUC,Cédula,Pasaporte,Consumidor final
        'identification' => 'required|string|max:20', // add custom RUC rule if needed
        'business_name' => 'required|string|max:255',
        'email' => 'nullable|email|max:255',
        'phone' => 'nullable|string|max:50',
        'address' => 'nullable|string|max:255',
        'active' => 'boolean'
    ];}
}
