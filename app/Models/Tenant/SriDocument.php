<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SriDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'document_type', 'access_key', 'authorization_number',
        'status', 'xml_signed', 'sri_response', 'validation_errors',
        'sent_at', 'authorized_at', 'retry_count'
    ];

    protected $casts = [
        'validation_errors' => 'array',
        'sent_at' => 'datetime',
        'authorized_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }
}