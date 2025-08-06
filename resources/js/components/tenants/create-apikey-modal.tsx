import { ApiKeyFormData, ApiKeyResponse } from '@/common/interfaces/tenant/apikey.interface';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { CheckIcon, CopyIcon } from 'lucide-react';

interface CreateApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateApiKeyModal({ isOpen, onClose }: CreateApiKeyModalProps) {
    const [formData, setFormData] = useState<ApiKeyFormData>({
        name: '',
        abilities: ['read'],
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const availableAbilities = [
        { id: 'read', label: 'Leer datos (read)' },
        { id: 'write', label: 'Escribir datos (write)' },
        { id: 'delete', label: 'Eliminar datos (delete)' },
    ];

    const handleAbilityChange = (ability: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            abilities: checked
                ? [...prev.abilities, ability]
                : prev.abilities.filter(a => a !== ability),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post<ApiKeyResponse>('/api-keys', formData);
            
            if (response.data.success && response.data.token) {
                setToken(response.data.token);
            } else {
                setError(response.data.message || 'Error al crear la API Key');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear la API Key');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToken = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        if (token) {
            // Si se creó un token, recargamos la página al cerrar
            router.reload();
        } else {
            onClose();
        }
        
        // Resetear el estado
        setFormData({ name: '', abilities: ['read'] });
        setError(null);
        setToken(null);
        setCopied(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crear nueva API Key</DialogTitle>
                    <DialogDescription>
                        Las API Keys permiten a aplicaciones externas acceder a tu cuenta. Asegúrate de guardar la clave en un lugar seguro.
                    </DialogDescription>
                </DialogHeader>

                {token ? (
                    <div className="space-y-4">
                        <Alert variant="warning">
                            <AlertDescription>
                                Esta clave solo se mostrará una vez. Guárdala en un lugar seguro.
                            </AlertDescription>
                        </Alert>
                        
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <div className="overflow-x-auto flex-1 font-mono text-sm">
                                {token}
                            </div>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={handleCopyToken}
                                className="flex-shrink-0"
                            >
                                {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                            </Button>
                        </div>
                        
                        <DialogFooter>
                            <Button onClick={handleClose}>Cerrar</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-2 pb-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre de la API Key</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Sistema de facturación"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Permisos</Label>
                                <div className="space-y-2">
                                    {availableAbilities.map((ability) => (
                                        <div key={ability.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`ability-${ability.id}`}
                                                checked={formData.abilities.includes(ability.id)}
                                                onCheckedChange={(checked) => 
                                                    handleAbilityChange(ability.id, checked === true)
                                                }
                                            />
                                            <Label htmlFor={`ability-${ability.id}`}>{ability.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear API Key'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
} 