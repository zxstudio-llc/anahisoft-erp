"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageDropzone } from "@/components/app/editor/image-dropzone";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface News {
  id: number;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  published_at?: string;
  is_published?: boolean;
  image?: string;
  isUsed?: boolean;
}

interface NewsSelectorProps {
  news?: News[];
  value: number | null;
  onChange: (value: number | null) => void;
  onCreateNew: (newsItem: any) => Promise<number>;
  usedItems?: number[];
}

export function NewsSelector({ 
  news = [],
  value,
  onChange,
  onCreateNew,
  usedItems = [] 
}: NewsSelectorProps) {
  const [open, setOpen] = useState(false);
  const [newNews, setNewNews] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published_at: new Date().toISOString().split('T')[0],
    is_published: true,
    image: null as File | null,
  });

  const selected = news.find(n => n.id === value) || null;

  const handleCreate = async () => {
    try {
      const formData = new FormData();
      
      formData.append('title', newNews.title);
      formData.append('slug', newNews.slug || '');
      formData.append('excerpt', newNews.excerpt || '');
      formData.append('content', newNews.content || '');
      formData.append('published_at', newNews.published_at);
      formData.append('is_published', newNews.is_published ? '1' : '0');
      
      if (newNews.image) {
        formData.append('image', newNews.image);
      }

      const id = await onCreateNew(formData);
      onChange(id);
      setOpen(false);
      setNewNews({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        published_at: new Date().toISOString().split('T')[0],
        is_published: true,
        image: null,
      });
    } catch (error) {
      console.error("Error creating News:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Seleccionar Noticia</Label>
      <div className="flex gap-2">
        <Select
          value={value?.toString() ?? "none"}
          onValueChange={(val) => onChange(val === "none" ? null : parseInt(val))}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecciona una noticia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ninguna (crear nueva)</SelectItem>
              {news.map(n => {
                const isUsed = usedItems.includes(n.id) && n.id !== value;
                return (
                  <SelectItem 
                    key={n.id} 
                    value={n.id.toString()}
                    disabled={isUsed}
                    className="relative"
                  >
                    <div className="flex items-center justify-between">
                      <span>{n.title || 'Sin título'}</span>
                      {isUsed && (
                        <Badge variant="secondary" className="ml-2">
                          Usado
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={!!value}>Crear Nueva</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Noticia</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-4">
                <Label>Imagen de Portada</Label>
                <ImageDropzone
                  image={newNews.image}
                  onImageChange={(file) => setNewNews(prev => ({ ...prev, image: file }))}
                  collectionName="news_covers"
                  title="Portada de la noticia"
                  description="Imagen principal que aparecerá en el listado"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input 
                    value={newNews.title} 
                    onChange={(e) => setNewNews(prev => ({ ...prev, title: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input 
                    value={newNews.slug} 
                    onChange={(e) => setNewNews(prev => ({ ...prev, slug: e.target.value }))} 
                    placeholder="Se generará automáticamente si se deja vacío"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resumen</Label>
                <Textarea
                  value={newNews.excerpt}
                  onChange={(e) => setNewNews(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Contenido</Label>
                <Textarea
                  value={newNews.content}
                  onChange={(e) => setNewNews(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Publicación</Label>
                  <Input 
                    type="date" 
                    value={newNews.published_at} 
                    onChange={(e) => setNewNews(prev => ({ ...prev, published_at: e.target.value }))} 
                  />
                </div>
                <div className="flex items-center justify-between space-y-2">
                  <Label>Publicado</Label>
                  <Switch
                    checked={newNews.is_published}
                    onCheckedChange={(checked) => setNewNews(prev => ({ ...prev, is_published: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Crear Noticia</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selected && (
        <div className="border p-4 rounded-md space-y-2 bg-muted/50">
          {selected.image && (
            <img
              src={selected.image}
              alt={selected.title}
              className="w-full h-40 object-cover rounded-md mb-2"
            />
          )}
          <h4 className="font-semibold">{selected.title}</h4>
          <p className="text-sm">{selected.excerpt}</p>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Publicado: {selected.published_at || "Sin fecha"}</span>
            <span>Estado: {selected.is_published ? 'Publicado' : 'No publicado'}</span>
          </div>
        </div>
      )}
    </div>
  );
}