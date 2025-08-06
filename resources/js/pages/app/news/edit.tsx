import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, News } from '@/types';
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageDropzone } from '@/components/app/editor/image-dropzone';
import { TiptapWrapper } from '@/components/app/editor/tiptapWrapper';

const breadcrumbs = (title: string): BreadcrumbItem[] => [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Noticias', href: '/admin/news' },
  { title, href: '#' },
];

export default function Edit({ news }: { news: News }) {
  const { errors } = usePage().props as { errors: Record<string, string> };
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState(news.image_url);
  const [form, setForm] = useState({
    title: news.title || '',
    slug: news.slug || '',
    excerpt: news.excerpt || '',
    content: news.content || '',
    published_at: news.published_at || '',
    is_published: news.is_published || false,
    image: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new FormData();

    payload.append('_method', 'put');
    payload.append('title', form.title);
    payload.append('slug', form.slug);
    payload.append('excerpt', form.excerpt);
    payload.append('content', form.content);
    payload.append('published_at', form.published_at);
    payload.append('is_published', form.is_published ? '1' : '0');

    if (!imageFile && news.image_url) {
      payload.append('remove_image', '1');
    } else if (imageFile) {
      payload.append('image', imageFile);
    }

    router.post(`/admin/news/${news.id}`, payload, {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file === null && news.image_url) {
      setCurrentImage(null);
    }
  };


  return (
    <AppLayout breadcrumbs={breadcrumbs(news.title)}>
      <Head title={`Editar: ${news.title}`} />

      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Editar noticia</h2>
            <p className="text-muted-foreground">Modifica los campos necesarios.</p>
          </div>
          <Button type="submit" form="news-form">Guardar cambios</Button>
        </div>

        <form onSubmit={handleSubmit} id="news-form" className="space-y-6">
          <div className="flex gap-6 items-start">
            <div className="w-full space-y-6">
              <Card>
                <CardHeader><CardTitle>Información</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex w-full gap-4">
                    <div className="w-1/2">
                      <Label htmlFor="image" className="hidden">Imagen</Label>
                      <ImageDropzone
                        image={imageFile}
                        onImageChange={handleImageChange}
                        defaultImage={currentImage}
                        title="Portada de la noticia"
                        description="Imagen principal que aparecerá en el listado"
                      />
                    </div>
                    <div className="flex flex-col w-1/2 space-y-6">
                      <div>
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" value={form.title} onChange={handleChange} />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                      </div>

                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input id="slug" name="slug" value={form.slug} onChange={handleChange} />
                      </div>

                      <div>
                        <Label htmlFor="excerpt">Extracto</Label>
                        <Textarea id="excerpt" name="excerpt" value={form.excerpt} onChange={handleChange} rows={3} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Contenido</Label>
                    <TiptapWrapper
                      content={form.content}
                      onChange={(content) => setForm((prev) => ({ ...prev, content }))}
                      placeholder="Escribe el contenido de la noticia..."
                      imageCollection="news_content_images"
                      modelType="News"
                      modelId={news.id}
                    />
                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-[25%] space-y-6">
              <Card>
                <CardHeader><CardTitle>Configuración</CardTitle></CardHeader>
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
                        setForm((prev) => ({ ...prev, is_published: checked }))
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
