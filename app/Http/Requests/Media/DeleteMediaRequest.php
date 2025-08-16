<?php

namespace App\Http\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeleteMediaRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules()
    {
        return [
            'permanent' => 'sometimes|boolean',
            'confirmation' => [
                'required_if:permanent,true',
                'string',
                Rule::in(['CONFIRMAR BORRADO PERMANENTE']),
            ],
            'reason' => 'required_if:permanent,true|string|max:500',
        ];
    }

    public function messages()
    {
        return [
            'confirmation.in' => 'Debe escribir exactamente "CONFIRMAR BORRADO PERMANENTE" para confirmar',
            'reason.required_if' => 'Debe proporcionar una razón para el borrado permanente',
        ];
    }

    public function prepareForValidation()
    {
        return $this->merge([
            'permanent' => $this->input('permanent', false),
        ]);
    }
}
