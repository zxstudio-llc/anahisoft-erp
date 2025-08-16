import { Role } from '@/common/interfaces/tenant/roles.interface';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Api from '@/lib/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role?: Role;
    permissions: Array<{ value: string; label: string }>;
    onSuccess?: (role: Role, isEdit: boolean) => void;
}

interface RoleFormData {
    name: string;
    permissions: string[];
}

export default function RoleModal({ isOpen, onClose, role, permissions, onSuccess }: RoleModalProps) {
    const [formData, setFormData] = useState<RoleFormData>({
        name: '',
        permissions: [],
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name,
                permissions: role.permissions.map(p => p.name),
            });
        } else {
            setFormData({
                name: '',
                permissions: [],
            });
        }
    }, [role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const endpoint = role ? `/v1/roles/${role.id}` : '/v1/roles';
            const method = role ? 'put' : 'post';

            const { data } = await Api[method](endpoint, formData);

            if (data.success) {
                toast.success(role ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
                onSuccess?.(data.data, !!role);
                onClose();
            }
        } catch (error) {
            console.error('Error al guardar rol:', error);
            toast.error('Error al guardar el rol');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermissionChange = (permission: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: checked
                ? [...prev.permissions, permission]
                : prev.permissions.filter(p => p !== permission),
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{role ? 'Editar Rol' : 'Crear Rol'}</DialogTitle>
                    <DialogDescription>
                        {role ? 'Actualiza los datos del rol' : 'Ingresa los datos del nuevo rol'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Permisos</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {permissions.map((permission) => (
                                <div key={permission.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`permission-${permission.value}`}
                                        checked={formData.permissions.includes(permission.value)}
                                        onCheckedChange={(checked) => handlePermissionChange(permission.value, checked as boolean)}
                                    />
                                    <Label htmlFor={`permission-${permission.value}`}>{permission.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : role ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 