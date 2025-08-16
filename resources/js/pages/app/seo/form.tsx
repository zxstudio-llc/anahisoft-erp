import React, { useState, useEffect, useCallback } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface SeoData {
  route: string;
  title: string;
  description: string;
  image: string;
  author: string;
  robots: string;
  keywords: string;
  canonical_url: string;
  model_type: string;
  model_id: string;
}

interface SeoFormProps {
  seo?: any;
}
export function SeoForm({ seo }: SeoFormProps) {
  const pageProps = usePage().props as unknown as {
    availableModels: Record<string, string>;
    pages: Array<{ id: number; title: string; slug: string }>;
    news: Array<{ id: number; title: string; slug: string }>;
  };
  const { availableModels, pages, news } = pageProps;

  const [availableRecords, setAvailableRecords] = useState<Array<{id: number; title: string; slug: string}>>([]);
  
  const { data, setData, post, put, processing, errors } = useForm<SeoData & Record<string, any>>({
    route: seo?.route || '',
    title: seo?.title || '',
    description: seo?.description || '',
    image: seo?.image || '',
    author: seo?.author || '',
    robots: seo?.robots || 'index,follow',
    keywords: seo?.keywords || '',
    canonical_url: seo?.canonical_url || '',
    model_type: seo?.model_type || '',
    model_id: seo?.model_id ? String(seo.model_id) : '',
  });

  // Función para actualizar registros disponibles
  const updateAvailableRecords = useCallback((modelType: string) => {
    if (modelType === 'App\\Models\\Page') {
      setAvailableRecords(pages || []);
    } else if (modelType === 'App\\Models\\News') {
      setAvailableRecords(news || []);
    } else {
      setAvailableRecords([]);
    }
  }, [pages, news]);

  // Efecto para cambiar registros disponibles cuando cambia el tipo
  useEffect(() => {
    updateAvailableRecords(data.model_type);
    
    // Solo limpiar model_id si realmente cambió el tipo y no es la carga inicial
    if (seo && data.model_type !== seo.model_type) {
      setData(prev => ({ ...prev, model_id: '' }));
    }
  }, [data.model_type, updateAvailableRecords]);

  // Función para generar ruta automática
  const generateRoute = useCallback((modelType: string, modelId: string, records: Array<{id: number; title: string; slug: string}>) => {
    if (!modelType || !modelId) return '';
    
    const selectedRecord = records.find(r => r.id.toString() === modelId);
    if (!selectedRecord) return '';

    if (modelType === 'App\\Models\\Page') {
      return `/${selectedRecord.slug}`;
    } else if (modelType === 'App\\Models\\News') {
      return `/news/${selectedRecord.slug}`;
    }
    return '';
  }, []);

  // Efecto para auto-generar ruta solo cuando cambia model_id
  useEffect(() => {
    if (data.model_type && data.model_id && availableRecords.length > 0) {
      const newRoute = generateRoute(data.model_type, data.model_id, availableRecords);
      if (newRoute && newRoute !== data.route) {
        setData(prev => ({ ...prev, route: newRoute }));
      }
    }
  }, [data.model_id, data.model_type, availableRecords, generateRoute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (seo) {
      put(`/admin/seo/${seo.id}`, {
        preserveScroll: true,
      });
    } else {
      post('/admin/seo', {
        preserveScroll: true,
      });
    }
  };

  const handleModelTypeChange = (value: string) => {
    setData(prev => ({
      ...prev,
      model_type: value,
      model_id: '', // Limpiar selección anterior
      route: '' // Limpiar ruta anterior
    }));
  };

  const handleModelIdChange = (value: string) => {
    setData(prev => ({ ...prev, model_id: value }));
  };

  const basicFields = [
    { 
      key: 'title' as keyof SeoData, 
      label: 'Título SEO', 
      type: 'input',
      placeholder: 'Título optimizado para SEO (máx. 60 caracteres)'
    },
    { 
      key: 'description' as keyof SeoData, 
      label: 'Meta Descripción', 
      type: 'textarea',
      placeholder: 'Descripción breve y atractiva (máx. 160 caracteres)'
    },
    { 
      key: 'keywords' as keyof SeoData, 
      label: 'Palabras Clave', 
      type: 'input', 
      placeholder: 'palabra1, palabra2, palabra3' 
    },
    { 
      key: 'author' as keyof SeoData, 
      label: 'Autor', 
      type: 'input',
      placeholder: 'Nombre del autor del contenido'
    },
    { 
      key: 'image' as keyof SeoData, 
      label: 'Imagen SEO (URL)', 
      type: 'input', 
      placeholder: 'https://ejemplo.com/imagen.jpg' 
    },
    { 
      key: 'canonical_url' as keyof SeoData, 
      label: 'URL Canónica', 
      type: 'input', 
      placeholder: 'https://ejemplo.com/pagina-principal' 
    },
  ];

  const robotsOptions = [
    { value: 'index,follow', label: 'Index, Follow (Recomendado)' },
    { value: 'noindex,follow', label: 'No Index, Follow' },
    { value: 'index,nofollow', label: 'Index, No Follow' },
    { value: 'noindex,nofollow', label: 'No Index, No Follow' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección de Asociación */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Asociación del SEO
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="model_type">Tipo de Contenido</Label>
            <Select value={data.model_type} onValueChange={handleModelTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(availableModels || {}).map(([value, label]) => (
                  // Add check to ensure value is not empty
                  value && (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
            {errors.model_type && (
              <p className="text-sm text-red-500 mt-1">{errors.model_type}</p>
            )}
          </div>

          {data.model_type && availableRecords.length > 0 && (
            <div>
              <Label htmlFor="model_id">Seleccionar Registro</Label>
              <Select value={data.model_id} onValueChange={handleModelIdChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar registro..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRecords.map((record) => (
                    <SelectItem key={record.id} value={record.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{record.title}</span>
                        <span className="text-xs text-gray-500">/{record.slug}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.model_id && (
                <p className="text-sm text-red-500 mt-1">{errors.model_id}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="route">
              Ruta URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="route"
              value={data.route}
              onChange={(e) => setData('route', e.target.value)}
              placeholder="/ruta-de-la-pagina"
              required
            />
            {errors.route && (
              <p className="text-sm text-red-500 mt-1">{errors.route}</p>
            )}
          </div>
        </div>

        {!data.model_type && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>SEO Global:</strong> Este SEO se aplicará cuando no haya un SEO específico configurado para la ruta.
            </AlertDescription>
          </Alert>
        )}

        {data.model_type && !data.model_id && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Selecciona un registro específico para asociar este SEO, o deja vacío para SEO general del tipo.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Campos SEO Básicos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Configuración SEO</h3>
        <div className="space-y-4">
          {basicFields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>
                {field.label}
                {field.key === 'title' && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({data.title.length}/60)
                  </span>
                )}
                {field.key === 'description' && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({data.description.length}/160)
                  </span>
                )}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  value={data[field.key]}
                  onChange={(e) => setData(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className={field.key === 'description' && data.description.length > 160 ? 'border-yellow-400' : ''}
                />
              ) : (
                <Input
                  id={field.key}
                  value={data[field.key]}
                  onChange={(e) => setData(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={field.key === 'title' && data.title.length > 60 ? 'border-yellow-400' : ''}
                />
              )}
              {errors[field.key] && (
                <p className="text-sm text-red-500 mt-1">{errors[field.key]}</p>
              )}
              {field.key === 'title' && data.title.length > 60 && (
                <p className="text-sm text-yellow-600 mt-1">
                  ⚠️ El título es muy largo. Se recomienda máximo 60 caracteres.
                </p>
              )}
              {field.key === 'description' && data.description.length > 160 && (
                <p className="text-sm text-yellow-600 mt-1">
                  ⚠️ La descripción es muy larga. Se recomienda máximo 160 caracteres.
                </p>
              )}
            </div>
          ))}

          <div>
            <Label htmlFor="robots">Directivas para Robots de Búsqueda</Label>
            <Select value={data.robots} onValueChange={(value) => setData('robots', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {robotsOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.robots && (
              <p className="text-sm text-red-500 mt-1">{errors.robots}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Controla cómo los motores de búsqueda indexan esta página
            </p>
          </div>
        </div>
      </div>

      {/* Vista previa */}
      {(data.title || data.description) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Vista Previa del SEO</h4>
          <div className="border border-gray-200 rounded p-3 bg-white">
            <div className="text-blue-600 text-lg hover:underline cursor-pointer">
              {data.title || 'Título de la página'}
            </div>
            <div className="text-green-600 text-sm">
              {data.canonical_url || `https://ejemplo.com${data.route}`}
            </div>
            <div className="text-gray-600 text-sm mt-1">
              {data.description || 'Descripción de la página que aparecerá en los resultados de búsqueda...'}
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={processing}>
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            seo ? 'Actualizar SEO' : 'Crear SEO'
          )}
        </Button>
      </div>
    </form>
  );
}