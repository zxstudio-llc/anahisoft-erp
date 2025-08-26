import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Link } from '@inertiajs/react';

interface Provider { id: number; name: string }
interface Product { id: number; name: string; price: number; stock: number }

interface Props {
  providers: Provider[];
  products: Product[];
}

export default function PurchasesCreate({ providers, products }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    provider_id: '',
    issue_date: new Date().toISOString().slice(0, 10),
    document_type: '01',
    series: '',
    number: '',
    currency: 'USD',
    items: [] as Array<{ product_id: number; quantity: number; unit_price: number }>,
    notes: '',
  });

  const addItem = (product: Product) => {
    setData('items', [...data.items, { product_id: product.id, quantity: 1, unit_price: product.price }]);
  };

  const updateItem = (index: number, field: 'quantity' | 'unit_price', value: number) => {
    const items = [...data.items];
    items[index] = { ...items[index], [field]: value };
    setData('items', items);
  };

  const removeItem = (index: number) => {
    const items = [...data.items];
    items.splice(index, 1);
    setData('items', items);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('tenant.purchases.store'));
  };

  const breadcrumbs = [
    { title: 'Compras', href: '/purchases' },
    { title: 'Crear', href: '/purchases/create' },
  ];

  return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Proveedor</Label>
              <Select value={data.provider_id} onValueChange={(v) => setData('provider_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.provider_id && <p className="text-sm text-red-600">{errors.provider_id}</p>}
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="date" value={data.issue_date} onChange={(e) => setData('issue_date', e.target.value)} />
            </div>
            <div>
              <Label>Moneda</Label>
              <Input value={data.currency} onChange={(e) => setData('currency', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Items</Label>
            <div className="rounded border divide-y">
              {data.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 p-2 items-center">
                  <div className="col-span-5">
                    <Select value={String(item.product_id)} onValueChange={(v) => updateItem(idx, 'unit_price', products.find(p => p.id === Number(v))?.price || item.unit_price)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                  </div>
                  <div className="col-span-3">
                    <Input type="number" step="0.01" min={0} value={item.unit_price} onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))} />
                  </div>
                  <div className="col-span-2 text-right">
                    <Button type="button" variant="outline" onClick={() => removeItem(idx)}>Quitar</Button>
                  </div>
                </div>
              ))}
              {data.items.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">Agregue productos desde la derecha</div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={processing}>Guardar</Button>
            <Link href={route('tenant.purchases.index')}>
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </form>

        <div className="space-y-3">
          <h2 className="font-semibold">Productos</h2>
          <div className="rounded border divide-y">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">Stock: {p.stock} • ${p.price.toFixed(2)}</div>
                </div>
                <Button type="button" variant="outline" onClick={() => addItem(p)}>Agregar</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
}