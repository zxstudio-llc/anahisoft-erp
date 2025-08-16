"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageDropzone } from "@/components/app/editor/image-dropzone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Banner {
  id: number;
  title?: string;
  subtitle?: string;
  link?: string;
  is_active?: boolean;
  published_at?: string;
  image?: string;
}

interface BannerSelectorProps {
  banners?: Banner[];
  value: number | null;
  onChange: (value: number | null) => void;
  onCreateNew: (banner: any) => Promise<number>;
}

export function BannerSelector({ banners = [], value, onChange, onCreateNew }: BannerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    link: '',
    is_active: true,
    published_at: '',
    image: null as File | null,
  });

  const selectedBanner = banners.find(b => b.id === value) || null;

  const handleCreate = async () => {
    try {
      const newId = await onCreateNew(newBanner);
      onChange(newId);
      setOpen(false);
      setNewBanner({
        title: '',
        subtitle: '',
        link: '',
        is_active: true,
        published_at: '',
        image: null,
      });
    } catch (error) {
      console.error("Error creating banner:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Seleccionar Banner</Label>
      <div className="flex gap-2">
        <Select
          value={value?.toString() ?? "none"}
          onValueChange={(val) => onChange(val === "none" ? null : parseInt(val))}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecciona un banner existente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ninguno (crear nuevo)</SelectItem>
            {banners.map((banner) => (
              <SelectItem key={banner.id} value={banner.id.toString()}>
                {banner.title || `Banner #${banner.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={!!value}>
              Crear Nuevo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Banner</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-4">
                <Label htmlFor="image">Imagen</Label>
                <ImageDropzone
                  image={newBanner.image}
                  onImageChange={(file) => setNewBanner(prev => ({ ...prev, image: file }))}
                  collectionName="banners_covers"
                  title="Portada del banner"
                  description="Imagen principal que aparecerá en el listado"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título del banner"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    value={newBanner.subtitle}
                    onChange={(e) => setNewBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Subtítulo del banner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Enlace</Label>
                <Input
                  id="link"
                  type="url"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://ejemplo.com"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Activo</Label>
                <Switch
                  id="is_active"
                  checked={newBanner.is_active}
                  onCheckedChange={(checked) => setNewBanner(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Crear Banner</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedBanner && (
        <div className="grid gap-4 border p-4 rounded-lg bg-muted/50">
            
            {/* Imagen del banner */}
            {selectedBanner.image && (
            <div className="space-y-2">
                <Label>Imagen</Label>
                <img
                src={selectedBanner.image}
                alt="Imagen del banner"
                className="rounded-lg border w-full h-auto object-cover"
                />
            </div>
            )}

            {/* Datos del banner */}
            <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>ID</Label>
                <Input value={selectedBanner.id} readOnly />
            </div>
            <div>
                <Label>Título</Label>
                <Input value={selectedBanner.title || ''} readOnly />
            </div>
            <div>
                <Label>Subtítulo</Label>
                <Input value={selectedBanner.subtitle || ''} readOnly />
            </div>
            <div>
                <Label>Link</Label>
                <Input value={selectedBanner.link || ''} readOnly />
            </div>
            <div>
                <Label>Publicado</Label>
                <Input value={selectedBanner.published_at || 'No disponible'} readOnly />
            </div>
            <div>
                <Label>Estado</Label>
                <Input value={selectedBanner.is_active ? 'Activo' : 'Inactivo'} readOnly />
            </div>
            </div>

            <Button variant="secondary">
            Editar Banner
            </Button>
        </div>
        )}
    </div>
  );
}