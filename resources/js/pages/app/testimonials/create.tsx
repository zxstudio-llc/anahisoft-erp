import { Head, Link, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { z } from 'zod';
// Resolver manual para zod (sin @hookform/resolvers)
const zodResolver = (schema: z.ZodSchema) => async (data: any) => {
  try {
    const result = await schema.parseAsync(data);
    return { values: result, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, { message: string }> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          errors[err.path.join('.')] = { message: err.message };
        }
      });
      return { values: {}, errors };
    }
    throw error;
  }
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Panel', href: '/admin' },
  { title: 'Testimonios', href: '/admin/testimonials' },
  { title: 'Crear', href: '/admin/testimonials/create' }
];

// Esquema de validación
const testimonialSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  position: z.string().max(100).optional(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(500),
  photo: z.instanceof(File).nullable().optional(),
  is_active: z.boolean().default(true)
});

export default function Create() {
  const form = useForm({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: '',
      position: '',
      message: '',
      photo: null,
      is_active: true,
    }
  });

  const { watch } = form;
  const photoPreview = watch('photo');

  const onSubmit = async (data: z.infer<typeof testimonialSchema>) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('position', data.position || '');
      formData.append('message', data.message);
      formData.append('is_active', data.is_active ? '1' : '0');
      
      if (data.photo) {
        formData.append('photo', data.photo);
      }

      await router.post('/admin/testimonials', formData, {
        onSuccess: () => {
          toast.success('Testimonio creado correctamente', {
            description: 'El testimonio se ha guardado exitosamente',
          });
          form.reset();
        },
        onError: (errors) => {
          toast.error('Error al crear el testimonio', {
            description: 'Hubo un problema al guardar el testimonio',
          });
        }
      });
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Hubo un problema al procesar el formulario',
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear Testimonio" />
      
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Crear nuevo testimonio</h2>
            <p className="text-muted-foreground">
              Complete los datos del nuevo testimonio
            </p>
          </div>
        </div>
      
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="space-y-6 flex-1">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del cliente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo o empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: CEO de Empresa XYZ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Testimonio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Qué dice el cliente sobre tu servicio/producto"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6 w-full md:w-1/3">
                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto del cliente</FormLabel>
                          <FormControl>
                            <div className="flex flex-col items-center gap-4">
                              <Avatar className="w-32 h-32">
                                {photoPreview ? (
                                  <AvatarImage src={URL.createObjectURL(photoPreview)} />
                                ) : (
                                  <AvatarFallback>CN</AvatarFallback>
                                )}
                              </Avatar>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  field.onChange(e.target.files?.[0] || null);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Estado</FormLabel>
                            <FormDescription>
                              Activar/desactivar este testimonio
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/admin/testimonials">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Testimonio'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}