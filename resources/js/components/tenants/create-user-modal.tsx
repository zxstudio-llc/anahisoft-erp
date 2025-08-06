import { User } from '@/common/interfaces/tenant/users.interface';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Api from '@/lib/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User;
    roles: Array<{ value: string; label: string }>;
    onSuccess: (updatedUser?: User) => void;
}

interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    is_active: boolean;
}

interface ApiResponse {
    data: {
        success: boolean;
        message: string;
        data: User;
    };
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
            errors?: Record<string, string[]>;
        };
    };
}

export default function UserModal({ isOpen, onClose, user, roles, onSuccess }: UserModalProps) {
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        is_active: true,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: '',
                role: user.roles?.[0]?.name || '',
                is_active: user.is_active,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: '',
                is_active: true,
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const endpoint = user ? `/v1/users/${user.id}` : '/v1/users';
            const method = user ? 'put' : 'post';

            if (formData.role === "default") {
                toast.error('Por favor selecciona un rol válido');
                setIsLoading(false);
                return;
            }

            const response = await Api[method]<ApiResponse>(endpoint, {
                ...formData,
                role: formData.role,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                onSuccess(response.data.data);
                onClose();
            }
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Error al guardar usuario:', error);
            toast.error(apiError.response?.data?.message || 'Error al guardar el usuario');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
                    <DialogDescription>
                        {user ? 'Actualiza los datos del usuario' : 'Ingresa los datos del nuevo usuario'}
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
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    {!user && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!user}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    required={!user}
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select
                            value={formData.role || "default"}
                            onValueChange={(value) => setFormData({ ...formData, role: value === "default" ? "" : value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default" disabled>Selecciona un rol</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                        {role.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                        />
                        <Label htmlFor="is_active">Usuario activo</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 