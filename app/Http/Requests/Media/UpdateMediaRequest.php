<?php

namespace App\Http\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMediaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('media'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        return [
            'name' => 'sometimes|string|max:255',
            'custom_properties' => 'sometimes|array',
            'crop' => 'sometimes|array',
            'crop.x' => 'required_with:crop|numeric',
            'crop.y' => 'required_with:crop|numeric',
            'crop.width' => 'required_with:crop|numeric',
            'crop.height' => 'required_with:crop|numeric',
            'resize' => 'sometimes|array',
            'resize.width' => 'required_with:resize|integer',
            'resize.height' => 'required_with:resize|integer',
        ];
    }

    public function prepareForValidation()
    {
        return $this->merge([
            'custom_properties' => $this->input('custom_properties', []),
        ]);
    }
}
