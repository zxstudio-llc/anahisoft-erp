import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImageUp, Trash2 } from "lucide-react";
import React, { useRef } from "react";
import { toast } from "sonner";

interface ImageDropzoneProps {
  image: File | null;
  onImageChange: (file: File | null) => void;
  onRemoveImage?: () => void; // Nueva prop para manejar eliminación
  defaultImage?: string | null;
  collectionName?: string;
  original_url?: string;
  title?: string;
  description?: string;
}

export function ImageDropzone({
  image,
  onImageChange,
  onRemoveImage,
  defaultImage,
  collectionName = 'default',
  title = "Imagen",
  description = "Gestiona la imagen"
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (onRemoveImage) {
      onRemoveImage(); // Usar la función prop si está disponible
    } else {
      onImageChange(null); // Fallback al comportamiento anterior
    }
    
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    toast.success("Imagen eliminada correctamente");
  };

  // Mostrar imagen si existe una nueva imagen o una imagen por defecto
  const hasImage = image || defaultImage;

  if (hasImage) {
    return (
      <Card>
        <CardHeader className="flex justify-between">
          <div className="flex flex-col">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClick}
            >
              <ImageUp className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará la imagen seleccionada del formulario. Podrás seleccionar una nueva imagen después.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveImage}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="">
            <img
              src={image ? URL.createObjectURL(image) : defaultImage || ''}
              alt="Imagen de la noticia"
              className="w-full h-full object-contain rounded-md"
              onLoad={() => {
                // Solo revocar URL si es una imagen nueva (File object)
                if (image && typeof image === 'object' && image instanceof File) {
                  // No revocar inmediatamente para evitar problemas de visualización
                  setTimeout(() => {
                    URL.revokeObjectURL(URL.createObjectURL(image));
                  }, 1000);
                }
              }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Label className="bg-gray-100 w-full flex items-center justify-center text-gray-600 h-8 rounded-md text-xs truncate px-2">
            {image ? image.name : (defaultImage ? 'Imagen existente' : '')}
          </Label>
        </CardFooter>

        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </Card>
    );
  }

  // Si no hay imagen, mostrar el área de drop
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onClick={handleClick}
          className="border-2 border-dashed rounded-md cursor-pointer p-6 flex flex-col items-center justify-center text-center transition-colors border-gray-300 bg-transparent h-62 hover:border-gray-400 hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4m0 0l-4 4m4-4v12" />
          </svg>
          <p className="text-gray-600">
            Haz clic para seleccionar una imagen
          </p>
          <p className="text-xs text-gray-400 mt-1">Formatos permitidos: JPG, PNG, GIF</p>
        </div>
      </CardContent>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </Card>
  );
}