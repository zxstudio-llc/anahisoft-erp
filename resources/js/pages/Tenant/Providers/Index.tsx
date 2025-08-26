import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@inertiajs/react';

interface Provider {
  id: number;
  name: string;
  document_number: string;
  email?: string;
  phone?: string;
  status: string;
}

interface Props {
  providers: { data: Provider[] };
}

export default function ProvidersIndex({ providers }: Props) {
  const breadcrumbs = [
    { title: 'Proveedores', href: '/providers' },
  ];

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Proveedores</h1>
          <Link href={route('tenant.providers.create')}>
            <Button>Nuevo Proveedor</Button>
          </Link>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.document_number}</TableCell>
                  <TableCell>{p.email || '-'}</TableCell>
                  <TableCell>{p.phone || '-'}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell className="text-right">
                    <Link href={route('tenant.providers.edit', p.id)}>
                      <Button variant="outline" size="sm">Editar</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppSidebarLayout>
  );
}