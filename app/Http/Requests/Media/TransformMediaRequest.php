<?php

namespace App\Http\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransformMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('media'));
    }

    public function rules()
    {
        return [
            'operations' => 'required|array|min:1',
            'operations.*.type' => [
                'required',
                Rule::in(['crop', 'resize', 'rotate', 'filter', 'optimize']),
            ],
            'operations.*.width' => 'required_if:operations.*.type,crop,resize|integer|min:50|max:5000',
            'operations.*.height' => 'required_if:operations.*.type,crop,resize|integer|min:50|max:5000',
            'operations.*.x' => 'required_if:operations.*.type,crop|integer|min:0',
            'operations.*.y' => 'required_if:operations.*.type,crop|integer|min:0',
            'operations.*.angle' => 'required_if:operations.*.type,rotate|integer|min:-360|max:360',
            'operations.*.filter' => 'required_if:operations.*.type,filter|string|in:grayscale,sepia,blur',
            'operations.*.quality' => 'required_if:operations.*.type,optimize|integer|min:10|max:100',
            'preserve_original' => 'sometimes|boolean',
            'output_format' => 'sometimes|string|in:jpg,png,webp',
        ];
    }

    public function messages()
    {
        return [
            'operations.*.type.in' => 'Tipo de operación no válido',
            'operations.*.width.required_if' => 'Ancho requerido para recorte/redimension',
            'operations.*.height.required_if' => 'Altura requerida para recorte/redimension',
            'operations.*.x.required_if' => 'Coordenada X requerida para recorte',
            'operations.*.y.required_if' => 'Coordenada Y requerida para recorte',
        ];
    }

    public function prepareForValidation()
    {
        return $this->merge([
            'preserve_original' => $this->input('preserve_original', false),
            'output_format' => $this->input('output_format', 'jpg'),
        ]);
    }
}
