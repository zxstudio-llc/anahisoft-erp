"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageDropzone } from "@/components/app/editor/image-dropzone";

interface Testimonial {
  id: number;
  name: string;
  position?: string;
  message: string;
  photo?: string;
}

interface TestimonialSelectorProps {
  testimonials?: Testimonial[];
  value: number | null;
  onChange: (value: number | null) => void;
  onCreateNew: (testimonial: any) => Promise<number>;
}

export function TestimonialSelector({ testimonials = [], value, onChange, onCreateNew }: TestimonialSelectorProps) {
  const [open, setOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    position: "",
    message: "",
    photo: null as File | null,
  });

  const selected = testimonials.find(t => t.id === value) || null;

  const handleCreate = async () => {
    const id = await onCreateNew(newTestimonial);
    onChange(id);
    setOpen(false);
    setNewTestimonial({ name: "", position: "", message: "", photo: null });
  };

  return (
    <div className="space-y-4">
      <Label>Seleccionar Testimonio</Label>
      <div className="flex gap-2">
        <Select
          value={value?.toString() ?? "none"}
          onValueChange={(val) => onChange(val === "none" ? null : parseInt(val))}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecciona un testimonio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ninguno (crear nuevo)</SelectItem>
            {testimonials.map(t => (
              <SelectItem key={t.id} value={t.id.toString()}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={!!value}>Crear Nuevo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Testimonio</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label>Avatar</Label>
                <ImageDropzone
                  image={newTestimonial.photo}
                  onImageChange={(file) => setNewTestimonial(prev => ({ ...prev, avatar: file }))}
                  collectionName="testimonials_avatars"
                />
              </div>
              <div>
                <Label>Nombre</Label>
                <Input value={newTestimonial.name} onChange={(e) => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <Label>Rol</Label>
                <Input value={newTestimonial.position} onChange={(e) => setNewTestimonial(prev => ({ ...prev, position: e.target.value }))} />
              </div>
              <div>
                <Label>Contenido</Label>
                <Input value={newTestimonial.message} onChange={(e) => setNewTestimonial(prev => ({ ...prev, message: e.target.value }))} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Crear</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selected && (
        <div className="border p-4 rounded-md space-y-2 bg-muted/50">
          {selected.photo && (
            <img src={selected.photo} alt="Avatar" className="w-20 h-20 rounded-full object-cover border" />
          )}
          <div><strong>{selected.name}</strong> — <em>{selected.position}</em></div>
          <p>{selected.message}</p>
        </div>
      )}
    </div>
  );
}
