import { Role } from '@/common/interfaces/tenant/users.interface';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    roles: Role[];
}

export function CreateUserModal({ isOpen, onClose, roles }: CreateUserModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        roles: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users', {
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
                    <DialogTitle>Crear nuevo usuario</DialogTitle>
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
                        <Label htmlFor="password">Contraseña</Label>
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
                            Crear usuario
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 