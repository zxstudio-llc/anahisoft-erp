<?xml version="1.0" encoding="UTF-8"?>
@php($c = $invoice->company)
@php($cust = $invoice->customer)
<factura id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>{{ $c->sri_environment }}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>{{ $c->business_name }}</razonSocial>
    <nombreComercial>{{ $c->trade_name }}</nombreComercial>
    <ruc>{{ $c->ruc }}</ruc>
    <claveAcceso>{{ $invoice->access_key }}</claveAcceso>
    <codDoc>01</codDoc>
    <estab>{{ $invoice->establishment_code }}</estab>
    <ptoEmi>{{ $invoice->emission_point }}</ptoEmi>
    <secuencial>{{ $invoice->sequential }}</secuencial>
    <dirMatriz>{{ $c->address }}</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>{{ \\Carbon\\Carbon::parse($invoice->issue_date)->format('d/m/Y') }}</fechaEmision>
    <dirEstablecimiento>{{ $c->address }}</dirEstablecimiento>
    <obligadoContabilidad>SI</obligadoContabilidad>
    <tipoIdentificacionComprador>{{ $cust->identification_type }}</tipoIdentificacionComprador>
    <razonSocialComprador>{{ $cust->business_name }}</razonSocialComprador>
    <identificacionComprador>{{ $cust->identification }}</identificacionComprador>
    <totalSinImpuestos>{{ number_format(($invoice->subtotal_0 + $invoice->subtotal_12 + $invoice->subtotal_14), 2, '.', '') }}</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalConImpuestos>
      @if($invoice->subtotal_0 > 0)
      <totalImpuesto>
        <codigo>2</codigo><codigoPorcentaje>0</codigoPorcentaje>
        <baseImponible>{{ number_format($invoice->subtotal_0, 2, '.', '') }}</baseImponible>
        <valor>0.00</valor>
      </totalImpuesto>
      @endif
      @if($invoice->subtotal_12 > 0)
      <totalImpuesto>
        <codigo>2</codigo><codigoPorcentaje>2</codigoPorcentaje>
        <baseImponible>{{ number_format($invoice->subtotal_12, 2, '.', '') }}</baseImponible>
        <valor>{{ number_format($invoice->vat_value, 2, '.', '') }}</valor>
      </totalImpuesto>
      @endif
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>{{ number_format($invoice->total, 2, '.', '') }}</importeTotal>
    <moneda>DOLAR</moneda>
  </infoFactura>
  <detalles>
    @foreach($invoice->details as $d)
    <detalle>
      <codigoPrincipal>{{ $d->product->sku }}</codigoPrincipal>
      <descripcion>{{ $d->product->name }}</descripcion>
      <cantidad>{{ number_format($d->quantity, 6, '.', '') }}</cantidad>
      <precioUnitario>{{ number_format($d->unit_price, 6, '.', '') }}</precioUnitario>
      <descuento>{{ number_format($d->discount ?? 0, 2, '.', '') }}</descuento>
      <precioTotalSinImpuesto>{{ number_format($d->subtotal, 2, '.', '') }}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>{{ $d->vat_rate }}</codigoPorcentaje>
          <tarifa>{{ $d->vat_rate === '2' ? '13' : '0' }}</tarifa>
          <baseImponible>{{ number_format($d->subtotal, 2, '.', '') }}</baseImponible>
          <valor>{{ number_format($d->vat_value, 2, '.', '') }}</valor>
        </impuesto>
      </impuestos>
    </detalle>
    @endforeach
  </detalles>
</factura>