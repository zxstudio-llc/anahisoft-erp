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

interface Sale {
    id: number;
    document_number: string;
    document_type: string;
    document_type_name: string;
    total: number;
    subtotal: number;
    igv: number;
    sunat_state: string;
    client: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
        document_number: string;
    };
    products: Array<{
        id: number;
        name: string;
        pivot: {
            quantity: number;
            price: number;
            total: number;
        };
    }>;
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
        email: sale?.client?.email || '',
        message: ''
    });
    const [whatsappData, setWhatsappData] = useState({
        phone: sale?.client?.phone || '',
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
            link.setAttribute('download', `comprobante-${sale.document_number}.${type === 'cdr' ? 'zip' : type}`);
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
                                {sale.document_type_name} {sale.document_number}
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
                                    <p className="font-medium">{sale.client.name}</p>
                                    <p className="text-sm text-muted-foreground">{sale.client.document_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold text-primary">{formatCurrency(sale.total)}</p>
                                    <Badge 
                                        variant={sale.sunat_state === 'ACEPTADO' ? 'default' : 'secondary'}
                                        className="mt-1"
                                    >
                                        {sale.sunat_state}
                                    </Badge>
                                </div>
                            </div>
                            
                            <Separator className="my-3" />
                            
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Subtotal</p>
                                    <p className="font-medium">{formatCurrency(sale.subtotal)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">IGV</p>
                                    <p className="font-medium">{formatCurrency(sale.igv)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total</p>
                                    <p className="font-medium">{formatCurrency(sale.total)}</p>
                                </div>
                            </div>
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
                                    placeholder="+51 999 999 999"
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