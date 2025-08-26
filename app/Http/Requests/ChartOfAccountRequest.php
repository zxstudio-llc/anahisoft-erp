<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChartOfAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:20|unique:chart_of_accounts,code,' . $this->id,
            'name' => 'required|string|max:300',
            'account_type' => 'required|string|in:asset,liability,equity,income,expense',
            'account_subtype' => 'nullable|string|max:50',
            'parent_code' => 'nullable|exists:chart_of_accounts,code',
            'level' => 'required|integer|min:1',
            'is_detail' => 'boolean',
            'initial_balance' => 'nullable|numeric|min:0',
            'active' => 'boolean',
        ];
    }
}
