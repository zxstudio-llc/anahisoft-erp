import { User } from '@/common/interfaces/tenant/users.interface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { router } from '@inertiajs/react';

interface UsersTableProps {
    users: User[];
    onEdit: (user: User) => void;
}

export function UsersTable({ users, onEdit }: UsersTableProps) {
    const handleDelete = (userId: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            router.delete(`/users/${userId}`);
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Fecha de creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <div className="flex gap-1">
                                {user.roles.map((role) => (
                                    <Badge key={role} variant="secondary">
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(user)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
} 