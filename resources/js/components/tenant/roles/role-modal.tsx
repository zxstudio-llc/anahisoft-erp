import { RoleModalProps } from '@/common/interfaces/tenant/roles.interface';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export function RoleModal({ isOpen, onClose, permissions = [], role }: RoleModalProps) {
    const form = useForm({
        name: role?.name || '',
        description: role?.description || '',
        permissions: role?.permissions?.map((p) => p.name) || [],
    });

    const { data, setData, post, put, processing, errors, reset } = form;

    useEffect(() => {
        if (role) {
            setData({
                name: role.name,
                description: role.description || '',
                permissions: role.permissions.map((p) => p.name),
            });
        } else {
            reset();
        }
    }, [role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (role) {
            put(`/roles/${role.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/roles', {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    const handlePermissionChange = (permission: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permission]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permission),
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{role ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
                    <DialogDescription>
                        {role
                            ? 'Modifica los detalles y permisos del rol seleccionado.'
                            : 'Crea un nuevo rol y asigna sus permisos correspondientes.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} autoFocus={false} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>
                    <div>
                        <Label>Permisos</Label>
                        <div className="space-y-2">
                            {permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`permission-${permission.id}`}
                                        checked={data.permissions.includes(permission.name)}
                                        onCheckedChange={(checked) => handlePermissionChange(permission.name, checked as boolean)}
                                    />
                                    <Label htmlFor={`permission-${permission.id}`}>{permission.name}</Label>
                                </div>
                            ))}
                        </div>
                        {errors.permissions && <p className="text-sm text-red-500">{errors.permissions}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {role ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
