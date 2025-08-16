<?php

namespace App\Http\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMediaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        // Modificación: permitir cualquier nombre de colección o usar una lista dinámica
        // Opción 1: Permitir cualquier cadena válida como nombre de colección
//         return [
//             'file' => 'required|file|max:5120',
//             'collection_name' => 'required|string|max:255',
//             'name' => 'nullable|string|max:255',
//             'custom_properties' => 'nullable|array',
//             'model_type' => 'nullable|string',
//             'model_id' => 'nullable|integer'
//         ];

        // Opción 2 (alternativa): Si quieres mantener un control pero permitir añadir nuevas
        // Descomenta esto y comenta la opción 1 si prefieres este enfoque

        // Lista base de colecciones permitidas
        $allowedCollections = ['default', 'unattached', 'news_covers', 'news_content_images'];

        // Si el usuario está intentando crear una nueva colección, añadirla a la lista
        $requestedCollection = $this->input('collection_name');
        if ($requestedCollection && !in_array($requestedCollection, $allowedCollections)) {
            $allowedCollections[] = $requestedCollection;
        }

        return [
            'file' => 'sometimes|required_without:external_url|file|max:5120',
            'external_url' => 'sometimes|required_without:file|url',
            'name' => 'nullable|string|max:255',
            'collection_name' => ['required', 'string', 'max:255', Rule::in($allowedCollections)],
            'model_type' => 'nullable|string',
            'model_id' => 'nullable|integer',
            'custom_properties' => 'nullable|array',
        ];

    }

    public function prepareForValidation()
    {
        $customProperties = $this->input('custom_properties');

        if (is_string($customProperties)) {
            $customProperties = json_decode($customProperties, true) ?? [];
        }

        // Normalizar el nombre de la colección (transformar espacios en guiones bajos, etc.)
        $collectionName = $this->input('collection_name');
        if ($collectionName) {
            $collectionName = trim(strtolower($collectionName));
            $collectionName = preg_replace('/\s+/', '_', $collectionName);
        }

        return $this->merge([
            'custom_properties' => $customProperties,
            'name' => $this->input('name') ?? ($this->hasFile('file') ? $this->file('file')->getClientOriginalName() : null),
            'collection_name' => $collectionName,
        ]);
    }
}
