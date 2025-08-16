import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Api from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, CopyIcon, AlertTriangle } from 'lucide-react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface ApiKeyFormData {
    name: string;
    abilities: string[];
    expiration?: string | null;
}

interface ApiKeyResponse {
    success: boolean;
    data: {
        token: string;
        token_type?: string;
    };
    message?: string;
}

export default function ApiKeyModal({ isOpen, onClose, onSuccess }: ApiKeyModalProps) {
    const [formData, setFormData] = useState<ApiKeyFormData>({
        name: '',
        abilities: ['*'],
        expiration: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Preparar los datos para enviar
            const dataToSend: ApiKeyFormData = {
                name: formData.name.trim(),
                abilities: formData.abilities,
            };

            // Solo incluir expiration si hay una fecha seleccionada
            if (formData.expiration && formData.expiration.trim() !== '') {
                dataToSend.expiration = formData.expiration;
            }

            console.log('📤 Enviando datos:', dataToSend);

            const response = await Api.post<ApiKeyResponse>('/v1/api-keys', dataToSend);

            console.log('✅ Respuesta recibida:', response);

            // La respuesta de Axios viene con response.data que contiene los datos del servidor
            const serverResponse = response.data;

            // Verificar si la respuesta del servidor tiene la estructura esperada
            if (serverResponse && serverResponse.success && serverResponse.data && serverResponse.data.token) {
                setGeneratedToken(serverResponse.data.token);
                toast.success(serverResponse.message || 'Llave API creada correctamente');
            } else {
                console.error('🔍 Estructura de respuesta inesperada:', serverResponse);
                throw new Error('No se pudo obtener el token de la respuesta del servidor');
            }
        } catch (error) {
            console.error('❌ Error al crear llave API:', error);
            
            if (error instanceof Error) {
                toast.error(`Error al crear la llave API: ${error.message}`);
            } else {
                toast.error('Error desconocido al crear la llave API');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (generatedToken) {
            // Si se creó un token, llamar onSuccess para recargar la lista
            onSuccess?.();
        }
        
        // Resetear el estado
        setGeneratedToken(null);
        setCopied(false);
        setFormData({
            name: '',
            abilities: ['*'],
            expiration: null,
        });
        onClose();
    };

    const handleCopyToken = async () => {
        if (generatedToken) {
            try {
                await navigator.clipboard.writeText(generatedToken);
                setCopied(true);
                toast.success('Token copiado al portapapeles');
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Error al copiar:', error);
                toast.error('No se pudo copiar el token');
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {generatedToken ? 'API Key Creada' : 'Crear Llave API'}
                    </DialogTitle>
                    <DialogDescription>
                        {generatedToken
                            ? 'Copia tu llave API. Esta clave solo se mostrará una vez.'
                            : 'Las API Keys permiten a aplicaciones externas acceder a tu cuenta. Asegúrate de guardar la clave en un lugar seguro.'}
                    </DialogDescription>
                </DialogHeader>

                {generatedToken ? (
                    // Estado: Mostrar token generado
                    <div className="space-y-4 py-2">
                        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Esta clave solo se mostrará una vez. Guárdala en un lugar seguro.
                            </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                            <Label>Tu llave API</Label>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                <div className="overflow-x-auto flex-1 font-mono text-sm break-all">
                                    {generatedToken}
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={handleCopyToken}
                                    className="flex-shrink-0"
                                    title="Copiar token"
                                >
                                    {copied ? <CheckIcon className="h-4 w-4 text-green-600" /> : <CopyIcon className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Nombre:</strong> {formData.name}</p>
                            <p><strong>Permisos:</strong> {formData.abilities.join(', ')}</p>
                            {formData.expiration && (
                                <p><strong>Expira:</strong> {new Date(formData.expiration).toLocaleDateString()}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    // Estado: Formulario de creación
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Sistema de facturación"
                                required
                                minLength={3}
                                maxLength={100}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Mínimo 3 caracteres, máximo 100
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="abilities">Permisos *</Label>
                            <Select
                                value={formData.abilities[0]}
                                onValueChange={(value) => setFormData({ ...formData, abilities: [value] })}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona los permisos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="*">Acceso completo</SelectItem>
                                    <SelectItem value="read">Solo lectura</SelectItem>
                                    <SelectItem value="write">Solo escritura</SelectItem>
                                    <SelectItem value="api:read">API - Solo lectura</SelectItem>
                                    <SelectItem value="api:write">API - Lectura y escritura</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiration">Fecha de expiración (opcional)</Label>
                            <Input
                                id="expiration"
                                type="date"
                                value={formData.expiration || ''}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    expiration: e.target.value || null 
                                })}
                                min={new Date().toISOString().split('T')[0]}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Si no seleccionas una fecha, la llave no expirará
                            </p>
                        </div>

                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleClose} 
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isLoading || !formData.name.trim()}
                            >
                                {isLoading ? 'Creando...' : 'Crear API Key'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}