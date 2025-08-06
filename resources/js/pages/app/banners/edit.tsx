import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageDropzone } from '@/components/app/editor/image-dropzone';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function Edit({ banner }: { banner: any }) {
  console.log('Banner data:', banner);
  const initialWidth = banner.width || 1024;
  const initialHeight = banner.height || 256;
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Estados separados para manejar la imagen
  const [currentImage, setCurrentImage] = useState(banner.image_url || null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [form, setForm] = useState({
    width: initialWidth,
    height: initialHeight,
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    link: banner.link || '',
    cta: banner.cta || { cta_1: { name: '', url: '' }, cta_2: { name: '', url: '' } },
    is_active: banner.is_active || false,
    published_at: banner.published_at || '',
  });

  const bannerSize = bannerSizes.find(size =>
    size.width === form.width &&
    size.height === form.height
  );

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
    setRemoveImage(false);
    
    if (!file) {
      setNewImage(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const expectedWidth = form.width;
      const expectedHeight = form.height;

      if (width === expectedWidth && height === expectedHeight) {
        setNewImage(file);
        setImageError(null);
      } else {
        setImageError(
          `La imagen debe tener dimensiones exactas de ${expectedWidth}x${expectedHeight} px. La imagen seleccionada tiene ${width}x${height} px.`
        );
        setNewImage(null);
      }
    };
    img.onerror = () => {
      setImageError('No se pudo validar la imagen seleccionada.');
      setNewImage(null);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleRemoveImage = () => {
    console.log('Remove image called');
    setCurrentImage(null);
    setNewImage(null);
    setRemoveImage(true);
    setImageError(null);
    console.log('Image removal state set:', { removeImage: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    // Debug: Log del estado antes de enviar
    console.log('Form state before submit:', {
      form,
      newImage,
      removeImage,
      currentImage
    });

    // Agregar todos los campos del formulario
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'cta') {
        data.append('cta', JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        data.append(key, value as string);
      }
    });

    // Manejar imagen
    if (removeImage) {
      data.append('remove_image', '1');
      console.log('Adding remove_image flag');
    } else if (newImage) {
      data.append('image', newImage);
      console.log('Adding new image file:', newImage.name);
    }

    data.append('is_active', form.is_active ? '1' : '0');
    data.append('_method', 'PUT');

    // Debug: Log de FormData
    console.log('FormData entries:');
    for (let [key, value] of data.entries()) {
      console.log(key, value);
    }

    router.post(`/admin/banners/${banner.id}`, data, {
      forceFormData: true,
      onSuccess: (page) => {
        console.log('Update successful', page);
        // Actualizar estados después de éxito
        if (removeImage) {
          setCurrentImage(null);
          setRemoveImage(false);
        } else if (newImage) {
          // La nueva imagen ahora es la actual
          setCurrentImage(URL.createObjectURL(newImage));
          setNewImage(null);
        }
      },
      onError: (errors) => {
        console.error('Update failed:', errors);
      },
    });
  };

  const sizeLabel = bannerSize
    ? `${bannerSize.label} (Ancho: ${form.width}px, Alto: ${form.height}px)`
    : `Personalizado (Ancho: ${form.width}px, Alto: ${form.height}px)`;

  // Determinar qué imagen mostrar
  const displayImage = newImage || (!removeImage ? currentImage : null);

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/admin/dashboard' },
      { title: 'Editar Banner', href: `/admin/banners/${banner.id}/edit` },
    ]}>
      <Head title="Editar banner" />

      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Editar Banner</h2>
            <p className="text-muted-foreground">
              Modifica los datos del banner seleccionado.
            </p>
          </div>
          <Button type="submit" form="banner-form">Actualizar</Button>
        </div>

        <form onSubmit={handleSubmit} id="banner-form" className="flex flex-col 2xl:flex-row gap-8">
          <Card className="w-full 2xl:w-7/9">
            <CardContent className="space-y-4">
              <div className="flex-1 space-y-4">
                <div>
                  <Label>Dimensión del banner</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    <p className="text-sm">
                      {sizeLabel}
                    </p>
                    <input type="hidden" name="width" value={form.width} />
                    <input type="hidden" name="height" value={form.height} />
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                  <Label htmlFor="image" className="hidden">Imagen</Label>
                  <div className="w-full">
                    <ImageDropzone
                      image={newImage}
                      defaultImage={displayImage}
                      onImageChange={handleImageChange}
                      onRemoveImage={handleRemoveImage}
                      collectionName="banners_covers"
                      title="Imagen del banner"
                      description="Imagen actual o selecciona una nueva"
                    />
                  </div>
                  {imageError && <p className="text-sm text-red-600 mt-1">{imageError}</p>}
                  {newImage && (
                    <p className="text-sm text-gray-500 mt-2">
                      Archivo seleccionado: {newImage.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2">
                      <div>
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" value={form.title} onChange={handleChange} />
                      </div>

                      <div>
                        <Label htmlFor="subtitle">Subtítulo</Label>
                        <Input id="subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} />
                      </div>
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
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2 w-full">
                      <div className="w-full">
                        <Label htmlFor="cta_1">Nombre</Label>
                        <Input
                          className="w-full"
                          value={form.cta?.cta_1?.name || ''}
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
                          value={form.cta?.cta_1?.url || ''}
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
                          value={form.cta?.cta_2?.name || ''}
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
                          value={form.cta?.cta_2?.url || ''}
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
                    onCheckedChange={(checked) =>
                      setForm(prev => ({ ...prev, is_active: checked }))
                    }
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