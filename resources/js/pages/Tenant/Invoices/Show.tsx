"use client"

import { useState, useEffect } from "react"
import { Eye, ChevronLeft, Download, Mail, Share, Edit, FileText, CreditCard, User, Calendar, Hash, Building, FileCheck, FileX, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import Api from "@/lib/api"

interface InvoiceDetail {
  id: number;
  product?: {
    id: number;
    name: string;
    code: string;
    sku: string | null;
    unit_price: number;
    has_igv: boolean;
    igv_percentage: number;
    ice_rate: string | null;
    item_type: string;
  } | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  iva: number;
  ice: number;
  total: number;
}

interface Invoice {
  id: number;
  type: 'sale' | 'purchase';
  document_type: '01' | '03';
  document_type_name: string;
  establishment_code: string;
  emission_point: string;
  sequential: string;
  access_key: string | null;
  issue_date: string;
  period: string;
  subtotal_12: number;
  subtotal_0: number;
  iva: number;
  ice: number;
  total: number;
  status: 'draft' | 'issued' | 'authorized' | 'rejected' | 'canceled';
  customer?: {
    id: number;
    business_name: string;
    identification: string;
    email: string;
    phone: string;
    address: string;
  } | null;
  details: InvoiceDetail[];
  xml_path?: string | null;
  pdf_path?: string | null;
  cdr_path?: string | null;
  authorization_number: string | null;
  authorization_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ShowProps {
  invoice: Invoice;
  canDownloadPdf: boolean;
  canDownloadXml: boolean;
  canDownloadCdr: boolean;
}

export default function ShowInvoice({ invoice: initialInvoice, canDownloadPdf, canDownloadXml, canDownloadCdr }: ShowProps) {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [isLoading, setIsLoading] = useState(false);

  // Función para formatear números de moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Función para formatear el número de factura
  const formatInvoiceNumber = () => {
    return `${invoice.establishment_code}-${invoice.emission_point}-${invoice.sequential}`;
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'issued': return 'outline';
      case 'authorized': return 'default';
      case 'rejected': return 'destructive';
      case 'canceled': return 'destructive';
      default: return 'secondary';
    }
  }

  // Función para obtener el icono según el estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authorized': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'canceled': return <FileX className="h-4 w-4" />;
      case 'issued': return <FileCheck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  }

  // Función para descargar PDF
  const handleDownloadPdf = async () => {
    try {
      setIsLoading(true);
      const response = await Api.get(`/api/sales/${invoice.id}/download-pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${formatInvoiceNumber()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error al descargar el PDF');
    } finally {
      setIsLoading(false);
    }
  }

  // Función para descargar XML
  const handleDownloadXml = async () => {
    try {
      setIsLoading(true);
      const response = await Api.get(`/api/sales/${invoice.id}/download-xml`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${formatInvoiceNumber()}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('XML descargado correctamente');
    } catch (error) {
      console.error('Error downloading XML:', error);
      toast.error('Error al descargar el XML');
    } finally {
      setIsLoading(false);
    }
  }

  // Función para descargar CDR
  const handleDownloadCdr = async () => {
    try {
      setIsLoading(true);
      const response = await Api.get(`/api/sales/${invoice.id}/download-cdr`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cdr-${formatInvoiceNumber()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('CDR descargado correctamente');
    } catch (error) {
      console.error('Error downloading CDR:', error);
      toast.error('Error al descargar el CDR');
    } finally {
      setIsLoading(false);
    }
  }

  // Función para enviar por email
  const handleSendEmail = async () => {
    try {
      setIsLoading(true);
      // Aquí implementarías la lógica para enviar por email
      toast.success('Factura enviada por correo electrónico');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Error al enviar por correo');
    } finally {
      setIsLoading(false);
    }
  }

  // Función para verificar si se puede anular según normativa SRI 2025
  const canCancelInvoice = () => {
    if (invoice.status !== 'authorized') return false;
    
    const issueDate = new Date(invoice.issue_date);
    const today = new Date();
    const seventhOfNextMonth = new Date(issueDate.getFullYear(), issueDate.getMonth() + 1, 7);
    
    // Verificar si el día 7 es fin de semana o feriado (simplificado)
    if (seventhOfNextMonth.getDay() === 0) { // Domingo
      seventhOfNextMonth.setDate(8);
    } else if (seventhOfNextMonth.getDay() === 6) { // Sábado
      seventhOfNextMonth.setDate(9);
    }
    
    return today <= seventhOfNextMonth;
  }

  // Función para verificar si se puede corregir con nota de crédito
  const canCorrectWithCreditNote = () => {
    if (invoice.status !== 'authorized') return false;
    
    const issueDate = new Date(invoice.issue_date);
    const today = new Date();
    const oneYearLater = new Date(issueDate);
    oneYearLater.setFullYear(issueDate.getFullYear() + 1);
    
    return today <= oneYearLater && !canCancelInvoice();
  }

  return (
    <AppLayout>
      <Head title={`Factura ${formatInvoiceNumber()}`} />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Factura {formatInvoiceNumber()}</h1>
              <p className="text-sm text-gray-600">Detalles completos de la factura</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(invoice.status)} className="gap-1">
              {getStatusIcon(invoice.status)}
              {invoice.status === 'draft' && 'Borrador'}
              {invoice.status === 'issued' && 'Emitida'}
              {invoice.status === 'authorized' && 'Autorizada'}
              {invoice.status === 'rejected' && 'Rechazada'}
              {invoice.status === 'canceled' && 'Cancelada'}
            </Badge>

            {/* Botón de edición solo para borradores */}
            {invoice.status === 'draft' && (
              <Button
                variant="outline"
                onClick={() => window.location.href = `/invoices/${invoice.id}/edit`}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Factura
              </Button>
            )}

            {/* Botones de acción según el estado */}
            {invoice.status === 'authorized' && (
              <div className="flex gap-2">
                {canCancelInvoice() && (
                  <Button variant="outline" className="text-destructive">
                    <FileX className="mr-2 h-4 w-4" />
                    Anular Factura
                  </Button>
                )}
                {canCorrectWithCreditNote() && (
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Emitir Nota de Crédito
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tarjeta de información de la factura */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Factura</CardTitle>
                <CardDescription>Datos principales del comprobante</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Número:</span>
                      <span className="font-mono">{formatInvoiceNumber()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Tipo:</span>
                      <span>{invoice.document_type_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Fecha de emisión:</span>
                      <span>{formatDate(invoice.issue_date)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {invoice.authorization_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">N° de autorización:</span>
                        <span className="font-mono">{invoice.authorization_number}</span>
                      </div>
                    )}
                    {invoice.authorization_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Fecha de autorización:</span>
                        <span>{formatDate(invoice.authorization_date)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Establecimiento:</span>
                      <span>{invoice.establishment_code}-{invoice.emission_point}</span>
                    </div>
                  </div>
                </div>

                {invoice.access_key && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground">Clave de acceso</div>
                    <div className="font-mono text-sm break-all">{invoice.access_key}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tarjeta de información del cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
                <CardDescription>Datos del receptor de la factura</CardDescription>
              </CardHeader>
              <CardContent>
                {invoice.customer ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{invoice.customer.business_name}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Identificación</div>
                        <div>{invoice.customer.identification}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Email</div>
                        <div>{invoice.customer.email || 'No especificado'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Teléfono</div>
                        <div>{invoice.customer.phone || 'No especificado'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Dirección</div>
                        <div>{invoice.customer.address || 'No especificado'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No se especificó cliente</div>
                )}
              </CardContent>
            </Card>

            {/* Tarjeta de items de la factura */}
            <Card>
              <CardHeader>
                <CardTitle>Items de la Factura</CardTitle>
                <CardDescription>Productos y servicios incluidos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Unitario</TableHead>
                      <TableHead className="text-right">Descuento</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{detail.description}</div>
                            {detail.product && (
                              <div className="text-sm text-muted-foreground">
                                Código: {detail.product.code}
                                {detail.product.sku && ` • SKU: ${detail.product.sku}`}
                              </div>
                            )}
                            <div className="flex gap-1 mt-1">
                              {detail.product?.has_igv && (
                                <Badge variant="outline" className="text-xs">
                                  IVA {detail.product.igv_percentage}%
                                </Badge>
                              )}
                              {detail.product?.ice_rate && (
                                <Badge variant="outline" className="text-xs">
                                  ICE {detail.product.ice_rate}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{detail.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(detail.unit_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(0)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(detail.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar con totales y acciones */}
          <div className="space-y-6">
            {/* Tarjeta de totales */}
            <Card>
              <CardHeader>
                <CardTitle>Totales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoice.subtotal_12 > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Subtotal 12%:</span>
                    <span>{formatCurrency(invoice.subtotal_12)}</span>
                  </div>
                )}
                {invoice.subtotal_0 > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Subtotal 0%:</span>
                    <span>{formatCurrency(invoice.subtotal_0)}</span>
                  </div>
                )}
                {invoice.iva > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>IVA:</span>
                    <span>{formatCurrency(invoice.iva)}</span>
                  </div>
                )}
                {invoice.ice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>ICE:</span>
                    <span>{formatCurrency(invoice.ice)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(invoice.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tarjeta de acciones */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleDownloadPdf}
                  disabled={!canDownloadPdf || isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDownloadXml}
                  disabled={!canDownloadXml || isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar XML
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDownloadCdr}
                  disabled={!canDownloadCdr || isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar CDR
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleSendEmail}
                  disabled={isLoading}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar por Email
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  <Share className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
              </CardContent>
            </Card>

            {/* Información de normativa SRI */}
            {invoice.status === 'authorized' && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Información Legal SRI
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                  <p>
                    <strong>Plazo de anulación:</strong> Hasta el día 7 del mes siguiente a la emisión.
                  </p>
                  <p>
                    <strong>Corrección:</strong> Hasta 12 meses mediante nota de crédito.
                  </p>
                  <p>
                    <strong>Facturas a consumidor final:</strong> No pueden ser anuladas directamente después de emitidas.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}