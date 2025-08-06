import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageDropzone } from '@/components/app/editor/image-dropzone';
import { TiptapWrapper } from '@/components/app/editor/tiptapWrapper';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Noticias', href: '/admin/news' },
  { title: 'Crear', href: '/admin/news/create' },
];

export default function Create() {
  const { errors } = usePage().props as { errors: Record<string, string> };
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published_at: '',
    is_published: false,
    cover_image: null, 
  });

  const handleImageChange = (file: File | null) => {
    setForm(prev => ({ ...prev, cover_image: file }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const payload = new FormData();
  
    payload.append('title', form.title);
    payload.append('slug', form.slug);
    payload.append('excerpt', form.excerpt);
    payload.append('content', form.content);
    payload.append('published_at', form.published_at);
    payload.append('is_published', form.is_published ? '1' : '0');
  
    if (form.cover_image) {
      payload.append('cover_image', form.cover_image);
    }
  
    router.post('/admin/news', payload, {
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear noticia" />

      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Crear noticia</h2>
            <p className="text-muted-foreground">
              Administra todos las noticias/posts desde aquí.
            </p>
          </div>
          <Button onClick={handleSubmit}>
            Guardar
          </Button>
        </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-6 items-start">

          {/* Columna Principal (75%) */}
          <div className="w-full space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crear Noticia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                  <Label htmlFor="image">Imagen</Label>
                  <ImageDropzone
                    image={form.cover_image}
                    onImageChange={(file) => setForm((prev) => ({ ...prev, cover_image: file }))}
                    collectionName="news_covers"
                    title="Portada de la noticia"
                    description="Imagen principal que aparecerá en el listado"
                  />
                  
                  {form.cover_image && (
                    <p className="text-sm text-gray-500 mt-2">
                      Archivo seleccionado: {form.cover_image.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" name="title" value={form.title} onChange={handleChange} required />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" value={form.slug} onChange={handleChange} />
                </div>

                <div>
                  <Label htmlFor="excerpt">Extracto</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenido</Label>
                  <TiptapWrapper
                    content={form.content}
                    onChange={(content) => setForm((prev) => ({ ...prev, content }))}
                    placeholder="Escribe el contenido de la noticia..."
                    imageCollection="news_content_images"
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500">{errors.content}</p>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha (25%) */}
          <div className="w-[25%] space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
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
                  <Label htmlFor="is_published">Publicar</Label>
                  <Switch
                    id="is_published"
                    name="is_published"
                    checked={form.is_published}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, is_published: checked === true }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
      </div>
    </AppLayout>
  );
}
