import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Link } from '@inertiajs/react';

export default function ProvidersCreate() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    document_type: '',
    document_number: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('tenant.providers.store'));
  };

  const breadcrumbs = [
    { title: 'Proveedores', href: '/providers' },
    { title: 'Crear', href: '/providers/create' },
  ];

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 max-w-3xl">
        <h1 className="text-xl font-semibold mb-4">Nuevo Proveedor</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo Doc</Label>
              <Input value={data.document_type} onChange={(e) => setData('document_type', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Número</Label>
              <Input value={data.document_number} onChange={(e) => setData('document_number', e.target.value)} />
              {errors.document_number && <p className="text-sm text-red-600">{errors.document_number}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Dirección</Label>
            <Input value={data.address} onChange={(e) => setData('address', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={processing}>Guardar</Button>
            <Link href={route('tenant.providers.index')}>
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </form>
      </div>
    </AppSidebarLayout>
  );
}