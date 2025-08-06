import { Role, User } from '@/common/interfaces/tenant/users.interface';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Checkbox } from '@/components/ui/checkbox';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    roles: Role[];
}

export function EditUserModal({ isOpen, onClose, user, roles }: EditUserModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        roles: user.roles,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/users/${user.id}`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData('roles', data.roles.filter(role => role !== roleName));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar usuario</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors.name}
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            error={errors.email}
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Nueva contraseña (opcional)</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            error={errors.password}
                        />
                    </div>
                    <div>
                        <Label>Roles</Label>
                        <div className="space-y-2">
                            {roles.map(role => (
                                <div key={role.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={data.roles.includes(role.name)}
                                        onCheckedChange={(checked) => handleRoleChange(role.name, checked as boolean)}
                                    />
                                    <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                                </div>
                            ))}
                        </div>
                        {errors.roles && <p className="text-sm text-red-500">{errors.roles}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Guardar cambios
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 