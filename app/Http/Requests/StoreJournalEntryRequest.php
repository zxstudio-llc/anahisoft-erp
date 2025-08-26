<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalEntryRequest extends FormRequest{
    public function authorize(): bool { return true; }
    public function rules(): array {
      return [
        'entry_date' => 'required|date',
        'description' => 'required|string|max:255',
        'details' => 'required|array|min:2',
        'details.*.account_code' => 'required|string',
        'details.*.description' => 'nullable|string|max:255',
        'details.*.debit' => 'nullable|numeric|min:0',
        'details.*.credit' => 'nullable|numeric|min:0',
      ];
    }
}