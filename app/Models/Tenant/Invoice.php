<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type',
        'customer_id',
        'supplier_id',
        'document_type',
        'issue_date',
        'establishment_code',
        'emission_point',
        'sequential',
        'access_key',
        'issue_date',
        'period',
        'subtotal_12',
        'subtotal_0',
        'subtotal_no_tax',
        'subtotal_exempt',
        'discount',
        'ice',
        'iva',
        'tip',
        'total',
        'status',
        'xml_content',
        'authorization_number',
        'authorization_date',
    ];

    protected $casts = [
        'subtotal_12'     => 'float',
        'subtotal_0'      => 'float',
        'subtotal_no_tax' => 'float',
        'subtotal_exempt' => 'float',
        'discount'        => 'float',
        'ice'             => 'float',
        'iva'             => 'float',
        'tip'             => 'float',
        'total'           => 'float',
        'issue_date'      => 'date',
        'authorization_date' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function details()
    {
        return $this->hasMany(InvoiceDetail::class, 'invoice_id');
    }

    public function sriDocument()
    {
        return $this->morphOne(SriDocument::class, 'documentable');
    }
}
