import { useForm, usePage } from "@inertiajs/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { TEMPLATE_REGISTRY } from "@/data/templateRegistry";
import { TiptapWrapper } from "@/components/app/editor/tiptapWrapper";
import { TemplateConfig } from "@/types/templates";

interface PageFormProps {
  page?: any;
  templates?: Record<string, string>;
  templateConfigs?: Record<string, TemplateConfig>;
}

export function PageForm({ page, templates, templateConfigs }: PageFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(page?.template || 'default');
  const [templateErrors, setTemplateErrors] = useState<Record<string, string>>({});

  const { data, setData, post, put, processing, errors } = useForm({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    template: page?.template || 'default',
    template_data: page?.template_data || TEMPLATE_REGISTRY['default'].defaultValues,
    is_active: page?.is_active ?? true,
    sort_order: page?.sort_order || 0,
    meta_title: page?.meta_title || '',
    meta_description: page?.meta_description || '',
    meta_image: page?.meta_image || '',
  });
  const prepareDataForApi = (data: Record<string, any>) => {
    const apiData = { ...data };

    if (apiData.hero_type === 'single') {
      apiData.banners = [];
    } else if (apiData.hero_type === 'slider') {
      apiData.banners = apiData.banners.map(b => ({ banner_id: b.banner_id }));
      apiData.heroTitle = '';
      apiData.heroSubtitle = '';
      apiData.heroButtonText = '';
      apiData.heroButtonLink = '';
    }

    return apiData;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preparedData = prepareDataForApi(data);

    if (page) {
      put(route('admin.pages.update', page.id), preparedData);
    } else {
      post(route('admin.pages.store'), preparedData);
    }
  };

  useEffect(() => {
    if (selectedTemplate !== data.template) {
      setData('template', selectedTemplate);

      if (!page || selectedTemplate !== page.template) {
        const templateConfig = TEMPLATE_REGISTRY[selectedTemplate as keyof typeof TEMPLATE_REGISTRY];
        if (templateConfig) {
          setData('template_data', templateConfig.defaultValues);
        }
      }

      setTemplateErrors({});
    }
  }, [selectedTemplate]);

  const handleTemplateDataChange = (newTemplateData: Record<string, any>) => {
    setData('template_data', newTemplateData);
    setTemplateErrors({});
  };

  const currentTemplateConfig = TEMPLATE_REGISTRY[selectedTemplate as keyof typeof TEMPLATE_REGISTRY];

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Información general de la página</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={data.is_active}
                onCheckedChange={(checked) => setData('is_active', checked)}
              />
              <Label htmlFor="is_active">Página activa</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Título de la página"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={data.slug}
                onChange={(e) => setData('slug', e.target.value)}
                placeholder="URL amigable"
              />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="template">Plantilla</Label>
              <Select
                value={selectedTemplate}
                onValueChange={(value) => setSelectedTemplate(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TEMPLATE_REGISTRY).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{config.label}</span>
                        <span className="text-xs text-gray-500">{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.template && <p className="text-sm text-red-500">{errors.template}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Orden</Label>
              <Input
                id="sort_order"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                value={data.sort_order}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setData("sort_order", isNaN(value) || value < 0 ? 0 : value);
                }}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {currentTemplateConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Configuración del Template
              <Badge variant="outline">{currentTemplateConfig.label}</Badge>
            </CardTitle>
            <CardDescription>
              {currentTemplateConfig.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <currentTemplateConfig.configComponent
              data={data.template_data}
              onChange={handleTemplateDataChange}
              errors={templateErrors}
            />
          </CardContent>
        </Card>
      )}

      {selectedTemplate === 'default' && (
        <Card>
          <CardHeader>
            <CardTitle>Contenido General</CardTitle>
            <CardDescription>Contenido principal de la página</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Contenido</Label>
              <TiptapWrapper
                content={data.content}
                onChange={(content) => setData('content', content)}
                placeholder="Escribe el contenido de la página..."
              />
              {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Configuración SEO</CardTitle>
          <CardDescription>Optimización para motores de búsqueda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Título</Label>
              <Input
                id="meta_title"
                value={data.meta_title}
                onChange={(e) => setData('meta_title', e.target.value)}
                placeholder="Título para SEO (opcional)"
              />
              {errors.meta_title && <p className="text-sm text-red-500">{errors.meta_title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_image">Imagen para SEO</Label>
              <Input
                id="meta_image"
                value={data.meta_image}
                onChange={(e) => setData('meta_image', e.target.value)}
                placeholder="URL de la imagen (opcional)"
              />
              {errors.meta_image && <p className="text-sm text-red-500">{errors.meta_image}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Descripción</Label>
            <Textarea
              id="meta_description"
              value={data.meta_description}
              onChange={(e) => setData('meta_description', e.target.value)}
              rows={3}
              placeholder="Descripción para SEO (opcional)"
            />
            {errors.meta_description && <p className="text-sm text-red-500">{errors.meta_description}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={processing}>
          {processing ? 'Guardando...' : page ? 'Actualizar' : 'Crear Página'}
        </Button>
      </div>
    </form>
  );
}