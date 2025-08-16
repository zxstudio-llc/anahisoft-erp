import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageDropzone } from '@/components/app/editor/image-dropzone';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard' },
  { title: 'Crear Banner', href: '/admin/banners/create' },
];

const bannerSizes = [
  { label: '1024x256 (4:1)', width: 1024, height: 256 },
  { label: '1024x300 (24:7)', width: 1024, height: 300 },
  { label: '1024x384 (8:3)', width: 1024, height: 384 },
  { label: '1024x768 (4:3)', width: 1024, height: 768 },
  { label: '1280x267 (24:5)', width: 1280, height: 267 },
  { label: '1280x375 (24:7)', width: 1280, height: 375 },
  { label: '1280x400 (16:5)', width: 1280, height: 400 },
  { label: '1280x800 (8:5)', width: 1280, height: 800 },
  { label: '1366x256 (16:3)', width: 1366, height: 256 },
  { label: '1366x384 (32:9)', width: 1366, height: 384 },
  { label: '1366x768 (16:9)', width: 1366, height: 768 },
  { label: '1440x300 (24:7)', width: 1440, height: 300 },
  { label: '1440x450 (16:5)', width: 1440, height: 450 },
  { label: '1440x900 (8:5)', width: 1440, height: 900 },
  { label: '1600x300 (16:3)', width: 1600, height: 300 },
  { label: '1600x450 (32:9)', width: 1600, height: 450 },
  { label: '1600x900 (16:9)', width: 1600, height: 900 },
  { label: '1920x360 (16:3)', width: 1920, height: 360 },
  { label: '1920x540 (32:9)', width: 1920, height: 540 },
  { label: '1920x1080 (16:9)', width: 1920, height: 1080 },
];


export default function Create() {
  const [imageError, setImageError] = useState<string | null>(null);
  const [form, setForm] = useState({
    size: bannerSizes[0],
    title: '',
    subtitle: '',
    image: null as File | null,
    link: '',
    cta: {
      cta_1: { name: '', url: '' },
      cta_2: { name: '', url: '' },
    },
    is_active: true,
    published_at: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (file: File | null) => {
    setImageError(null);
    if (!file) {
      setForm((prev) => ({ ...prev, image: null }));
      return;
    }

    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const expectedWidth = form.size.width;
      const expectedHeight = form.size.height;

      if (width === expectedWidth && height === expectedHeight) {
        setForm((prev) => ({ ...prev, image: file }));
        setImageError(null);
      } else {
        setImageError(
          `La imagen debe tener dimensiones exactas de ${expectedWidth}x${expectedHeight} px. La imagen seleccionada tiene ${width}x${height} px.`
        );
        setForm((prev) => ({ ...prev, image: null }));
      }
    };
    img.onerror = () => {
      setImageError('No se pudo validar la imagen seleccionada.');
      setForm((prev) => ({ ...prev, image: null }));
    };
    img.src = URL.createObjectURL(file);
  };


  const handleSwitchChange = (checked: boolean) => {
    setForm((prev) => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'is_active' && value !== null) {
        data.append(key, value as any);
      }
    });

    data.append('cta', JSON.stringify(form.cta));
    data.append('is_active', form.is_active ? '1' : '0');
    data.append('width', form.size.width.toString());
    data.append('height', form.size.height.toString());

    router.post('/admin/banners', data, {
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear nuevo banner" />

      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Crear Banner</h2>
            <p className="text-muted-foreground">
              Administra todos los banners desde aquí.
            </p>
          </div>
          <Button type="submit" form="banner-form">
            Guardar
          </Button>
        </div>

        <form onSubmit={handleSubmit} id="banner-form" className="flex flex-col 2xl:flex-row gap-8">
          <Card className="w-full 2xl:w-7/9">
            <CardContent className="space-y-4">

              {/* Columna izquierda */}
              <div className="flex-1 space-y-6">
                <div>
                  <Label htmlFor="size">Dimensión del banner</Label>
                  <select
                    id="size"
                    name="size"
                    value={form.size.label}
                    onChange={e => {
                      const selected = bannerSizes.find(b => b.label === e.target.value);
                      if (selected) {
                        setForm(prev => ({ ...prev, size: selected }));
                        setForm(prev => ({ ...prev, image: null })); // limpia imagen para evitar error si cambia tamaño
                        setImageError(null);
                      }
                    }}
                    className="w-full rounded border px-3 py-2"
                  >
                    {bannerSizes.map(({ label }) => (
                      <option key={label} value={label}>{label}</option>
                    ))}
                  </select>
                </div>
                <Label htmlFor="image" className="hidden">Imagen</Label>
                <div className="flex w-full gap-2">
                  <div className="w-5/9">
                    <ImageDropzone
                      image={form.image}
                      onImageChange={handleImageChange}
                      collectionName="banners_covers"
                      title="Portada del banner"
                      description="Imagen principal que aparecerá en el listado"
                    />
                    {imageError && <p className="text-sm text-red-600 mt-1">{imageError}</p>}
                    {form.image && (
                      <p className="text-sm text-gray-500 mt-2">
                        Archivo seleccionado: {form.image.name}
                      </p>
                    )}
                  </div>
                  <div className="w-4/9 space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Título del banner"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subtitle">Subtítulo</Label>
                      <Input
                        id="subtitle"
                        name="subtitle"
                        value={form.subtitle}
                        onChange={handleChange}
                        placeholder="Subtítulo del banner"
                      />
                    </div>
                    <div>
                      <Label htmlFor="link">Enlace</Label>
                      <Input
                        id="link"
                        name="link"
                        type="url"
                        value={form.link}
                        onChange={handleChange}
                        placeholder="https://ejemplo.com"
                      />
                    </div>
                    <div className="flex gap-2 w-full">
                    <div className="w-full">
                        <Label htmlFor="cta_1">Nombre</Label>
                        <Input
                        className="w-full"
                          value={form.cta.cta_1.name}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              cta: {
                                ...prev.cta,
                                cta_1: { ...prev.cta.cta_1, name: e.target.value },
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="w-full">
                        <Label htmlFor="url_1">Enlace</Label>
                        <Input
                        className="w-full"
                          value={form.cta.cta_1.url}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              cta: {
                                ...prev.cta,
                                cta_1: { ...prev.cta.cta_1, url: e.target.value },
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 w-full">
                    <div className="w-full">
                        <Label htmlFor="cta2">Nombre</Label>
                        <Input
                        className="w-full"
                          value={form.cta.cta_2.name}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              cta: {
                                ...prev.cta,
                                cta_2: { ...prev.cta.cta_2, name: e.target.value },
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="w-full">
                        <Label htmlFor="url_2">Enlace</Label>
                        <Input
                        className="w-full"
                          value={form.cta.cta_2.url}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              cta: {
                                ...prev.cta,
                                cta_2: { ...prev.cta.cta_2, url: e.target.value },
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Columna derecha: Card */}
          <div className="w-full 2xl:w-2/9">
            <Card className="space-y-4">
              <CardHeader>
                <CardTitle>Opciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div>
                  <Label htmlFor="published_at">Fecha de publicación</Label>
                  <Input
                    id="published_at"
                    name="published_at"
                    type="datetime-local"
                    value={form.published_at}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Activo</Label>
                  <Switch
                    id="is_active"
                    checked={form.is_active}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>

              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
