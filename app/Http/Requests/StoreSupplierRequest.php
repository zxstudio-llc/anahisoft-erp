<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return [
        'identification_type' => 'required|in:04,05,06',
        'identification' => 'required|string|max:20',
        'business_name' => 'required|string|max:255',
        'email' => 'nullable|email|max:255',
        'phone' => 'nullable|string|max:50',
        'address' => 'nullable|string|max:255',
        'active' => 'boolean'
    ];}
}