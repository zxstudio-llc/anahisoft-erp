import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner"

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Panel', href: '/admin' },
  { title: 'Testimonios', href: '/admin/testimonials' }
];

export default function Index({ testimonials }: { testimonials: any[] }) {
  const toggleStatus = (testimonial: any) => {
    router.patch(`/admin/testimonials/${testimonial.id}/toggle`, {}, {
      onSuccess: () => {
        toast.success('Estado actualizado', {
          description: `El testimonio de ${testimonial.name} ha sido ${!testimonial.is_active ? 'activado' : 'desactivado'}`,
        });
      },
      onError: () => {
        toast.error('Error', {
          description: 'No se pudo actualizar el estado',
        });
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Testimonios" />
      
      <div  className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Todos los testimonios</h2>
            <p className="text-muted-foreground">
            Gestiona los testimonios de tus clientes
            </p>
          </div>
          
          <Button asChild>
            <Link href="/admin/testimonials/create">
              Nuevo Testimonio
            </Link>
          </Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Testimonios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo/Empresa</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={t.photo_url} />
                      <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.position || '-'}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{t.message}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={t.is_active} 
                        onCheckedChange={() => toggleStatus(t)}
                      />
                      <Badge variant={t.is_active ? 'default' : 'secondary'}>
                        {t.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/testimonials/${t.id}/edit`}>
                          Editar
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar este testimonio?')) {
                            router.delete(`/admin/testimonials/${t.id}`);
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
}