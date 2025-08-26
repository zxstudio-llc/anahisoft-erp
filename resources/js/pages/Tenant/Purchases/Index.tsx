import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@inertiajs/react';

interface Purchase {
  id: number;
  document_number: string;
  total: number;
  status: string;
  provider: { id: number; name: string };
}

interface Props {
  purchases: { data: Purchase[] };
}

export default function PurchasesIndex({ purchases }: Props) {
  const breadcrumbs = [
    { title: 'Compras', href: '/purchases' },
  ];

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Compras</h1>
          <Link href={route('tenant.purchases.create')}>
            <Button>Nueva Compra</Button>
          </Link>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.provider?.name || '-'}</TableCell>
                  <TableCell>{p.document_number}</TableCell>
                  <TableCell>${p.total?.toFixed(2)}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell className="text-right">
                    <Link href={route('tenant.purchases.show', p.id)}>
                      <Button variant="outline" size="sm">Ver</Button>
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