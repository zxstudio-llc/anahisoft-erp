import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import Api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
    Download,
    Mail,
    MessageCircle,
    FileText,
    CheckCircle,
    Printer,
    X
} from 'lucide-react';

interface Customer {
    id: number;
    business_name: string;
    email?: string;
    phone?: string;
    identification: string;
}

interface Product {
    id: number;
    name: string;
}

interface SaleDetail {
    id: number;
    product?: Product | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    iva: number;
    ice: number;
    total: number;
}

interface Sale {
    id: number;
    type: 'sale' | 'purchase';
    document_type: '01' | '03';
    document_type_name: string;
    total: number;
    subtotal_12: number;
    subtotal_0: number;
    iva: number;
    ice: number;
    status: 'draft' | 'issued' | 'authorized' | 'rejected' | 'canceled';
    customer?: Customer | null;
    details: SaleDetail[];
    xml_path?: string | null;
    pdf_path?: string | null;
    cdr_path?: string | null;
}

interface SaleSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale;
    canDownloadPdf: boolean;
    canDownloadXml: boolean;
    canDownloadCdr: boolean;
}

export default function SaleSuccessModal({
    isOpen,
    onClose,
    sale,
    canDownloadPdf,
    canDownloadXml,
    canDownloadCdr
}: SaleSuccessModalProps) {
    const [emailData, setEmailData] = useState({
        email: sale?.customer?.email || '',
        message: ''
    });
    const [whatsappData, setWhatsappData] = useState({
        phone: sale?.customer?.phone || '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async (type: 'pdf' | 'xml' | 'cdr') => {
        try {
            setIsLoading(true);
            const response = await Api.get(`/v1/sales/${sale.id}/download-${type}`, {
                responseType: 'blob'
            });
            
            // Crear enlace de descarga
            const responseData = response.data as Blob;
            const url = window.URL.createObjectURL(new Blob([responseData]));
            const link = document.createElement('a');
            link.href = url;
            
            // Generate document number for filename
            const documentNumber = `${sale.document_type}-${sale.id}`;
            link.setAttribute('download', `comprobante-${documentNumber}.${type === 'cdr' ? 'zip' : type}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success(`Archivo ${type.toUpperCase()} descargado correctamente`);
        } catch (error: unknown) {
            console.error('Error downloading file:', error);
            toast.error(`Error al descargar el archivo ${type.toUpperCase()}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!emailData.email) {
            toast.error('Ingresa un correo electrónico');
            return;
        }

        try {
            setIsLoading(true);
            await Api.post(`/v1/sales/${sale.id}/send-email`, emailData);
            toast.success('Comprobante enviado por correo electrónico');
            setEmailData({ email: '', message: '' });
        } catch (error: unknown) {
            console.error('Error sending email:', error);
            toast.error('Error al enviar el correo electrónico');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWhatsApp = async () => {
        if (!whatsappData.phone) {
            toast.error('Ingresa un número de teléfono');
            return;
        }

        try {
            setIsLoading(true);
            const response = await Api.post(`/v1/sales/${sale.id}/whatsapp-link`, whatsappData);
            
            // Abrir WhatsApp en nueva ventana
            const responseData = response.data as { whatsapp_url: string };
            window.open(responseData.whatsapp_url, '_blank');
            toast.success('Enlace de WhatsApp generado');
            setWhatsappData({ phone: '', message: '' });
        } catch (error: unknown) {
            console.error('Error generating WhatsApp link:', error);
            toast.error('Error al generar enlace de WhatsApp');
        } finally {
            setIsLoading(false);
        }
    };

    if (!sale) return null;

    // Helper function to get status badge variant
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'authorized':
            case 'issued':
                return 'default';
            case 'draft':
                return 'secondary';
            case 'rejected':
            case 'canceled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    // Helper function to get status display text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'authorized':
                return 'AUTORIZADO';
            case 'issued':
                return 'EMITIDO';
            case 'draft':
                return 'BORRADOR';
            case 'rejected':
                return 'RECHAZADO';
            case 'canceled':
                return 'CANCELADO';
            default:
                return status.toUpperCase();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-2">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">¡Venta Procesada Exitosamente!</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {sale.document_type_name} #{sale.id}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="ml-auto"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Resumen de la venta */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cliente</p>
                                    <p className="font-medium">{sale.customer?.business_name || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground">{sale.customer?.identification || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold text-primary">{formatCurrency(sale.total)}</p>
                                    <Badge 
                                        variant={getStatusVariant(sale.status)}
                                        className="mt-1"
                                    >
                                        {getStatusText(sale.status)}
                                    </Badge>
                                </div>
                            </div>
                            
                            <Separator className="my-3" />
                            
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Subtotal 15%</p>
                                    <p className="font-medium">{formatCurrency(sale.subtotal_12)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Subtotal 0%</p>
                                    <p className="font-medium">{formatCurrency(sale.subtotal_0)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">IVA</p>
                                    <p className="font-medium">{formatCurrency(sale.iva)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total</p>
                                    <p className="font-medium">{formatCurrency(sale.total)}</p>
                                </div>
                            </div>

                            {/* Mostrar detalles de productos */}
                            {sale.details && sale.details.length > 0 && (
                                <>
                                    <Separator className="my-3" />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Productos/Servicios</p>
                                        <div className="space-y-2">
                                            {sale.details.map((detail) => (
                                                <div key={detail.id} className="flex justify-between items-center text-sm">
                                                    <div>
                                                        <span className="font-medium">{detail.product?.name || 'Producto sin nombre'}</span>
                                                        <span className="text-muted-foreground ml-2">x{detail.quantity}</span>
                                                    </div>
                                                    <span className="font-medium">{formatCurrency(detail.total)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Opciones de descarga */}
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                            <Download className="h-5 w-5" />
                            Descargar Archivos
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                variant="outline"
                                onClick={() => handleDownload('pdf')}
                                disabled={!canDownloadPdf || isLoading}
                                className="flex flex-col gap-2 h-auto py-4"
                            >
                                <FileText className="h-6 w-6" />
                                <span className="text-sm">PDF</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleDownload('xml')}
                                disabled={!canDownloadXml || isLoading}
                                className="flex flex-col gap-2 h-auto py-4"
                            >
                                <FileText className="h-6 w-6" />
                                <span className="text-sm">XML</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleDownload('cdr')}
                                disabled={!canDownloadCdr || isLoading}
                                className="flex flex-col gap-2 h-auto py-4"
                            >
                                <FileText className="h-6 w-6" />
                                <span className="text-sm">CDR</span>
                            </Button>
                        </div>
                    </div>

                    {/* Envío por correo */}
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                            <Mail className="h-5 w-5" />
                            Enviar por Correo
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={emailData.email}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="email-message">Mensaje (opcional)</Label>
                                <Textarea
                                    id="email-message"
                                    placeholder="Mensaje personalizado..."
                                    value={emailData.message}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            <Button
                                onClick={handleSendEmail}
                                disabled={!emailData.email || isLoading}
                                className="w-full"
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar por Correo
                            </Button>
                        </div>
                    </div>

                    {/* Envío por WhatsApp */}
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                            <MessageCircle className="h-5 w-5" />
                            Enviar por WhatsApp
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="phone">Número de teléfono</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+593 999 999 999"
                                    value={whatsappData.phone}
                                    onChange={(e) => setWhatsappData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="whatsapp-message">Mensaje (opcional)</Label>
                                <Textarea
                                    id="whatsapp-message"
                                    placeholder="Mensaje personalizado..."
                                    value={whatsappData.message}
                                    onChange={(e) => setWhatsappData(prev => ({ ...prev, message: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            <Button
                                onClick={handleWhatsApp}
                                disabled={!whatsappData.phone || isLoading}
                                className="w-full"
                                variant="outline"
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Abrir WhatsApp
                            </Button>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                            className="flex-1"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                        </Button>
                        <Button
                            onClick={onClose}
                            className="flex-1"
                        >
                            Finalizar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}