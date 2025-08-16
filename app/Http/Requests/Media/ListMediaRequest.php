<?php

namespace App\Http\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListMediaRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'trashed' => 'nullable|in:with,without,only',
            'search' => 'sometimes|string|max:255|nullable',
            'mime_type' => 'sometimes|string|nullable',
            'collection' => 'sometimes|string|nullable',
            'sort_by' => ['sometimes', Rule::in(['created_at', 'updated_at', 'name', 'size', 'mime_type'])],
            'sort_direction' => ['sometimes', Rule::in(['asc', 'desc'])],
            'per_page' => 'sometimes|integer|min:1|max:100',
            'date_from' => 'sometimes|date|nullable',
            'date_to' => 'sometimes|date|nullable|after_or_equal:date_from',
            'user_id' => 'sometimes|integer|nullable|exists:users,id',
            'type' => ['sometimes', 'string', Rule::in(['attached', 'unattached', 'all'])],
        ];
    }

    public function prepareForValidation()
    {
        $defaults = [
            'per_page' => 30,
            'sort_by' => 'created_at',
            'sort_direction' => 'desc',
            'trashed' => 'without',
            'type' => 'all',
            'mime_type' => '',
            'collection' => '',
            'search' => '',
            'date_from' => null,
            'date_to' => null,
            'user_id' => null,
        ];

        return $this->merge(array_merge(
            $defaults,
            $this->only(array_keys($defaults)))
        );
    }
}