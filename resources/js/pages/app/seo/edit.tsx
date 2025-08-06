import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Calendar, Link as LinkIcon } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { SeoForm } from './form';

interface EditPageProps {
  seo: {
    id: number;
    route: string;
    title: string;
    description: string;
    model_type: string | null;
    model_id: number | null;
    model?: {
      title: string;
      slug: string;
    };
    created_at: string;
    updated_at: string;
  };
  availableModels: Record<string, string>;
  pages: Array<{ id: number; title: string; slug: string }>;
  news: Array<{ id: number; title: string; slug: string }>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function EditSeo() {
  const { seo, flash } = usePage().props as EditPageProps;
  
  const seoBreadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel', href: '/admin' },
    { title: 'SEO', href: '/admin/seo' },
    { title: 'Editar', href: `/admin/seo/${seo.id}/edit` }
  ];

  const getModelTypeBadge = (modelType: string | null) => {
    if (!modelType) {
      return <Badge variant="secondary">Global</Badge>;
    }
    
    if (modelType.includes('Page')) {
      return <Badge variant="default">Página</Badge>;
    }
    
    if (modelType.includes('News')) {
      return <Badge variant="outline">Noticia</Badge>;
    }
    
    return <Badge variant="destructive">Otro</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AppLayout breadcrumbs={seoBreadcrumbs}>
      <Head title={`Editar SEO - ${seo.title || seo.route}`} />
      
      <div className="p-6 space-y-6">
        {/* Flash Messages */}
        {flash?.success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {flash.success}
          </div>
        )}
        
        {flash?.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {flash.error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/seo">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Search className="w-6 h-6 mr-2" />
                Editar SEO
              </h1>
              <p className="text-gray-600 mt-1">
                Modificar configuración SEO existente
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4"> {/* Añade espacio entre los cards */}
          {/* Form Card - Ocupa 75% */}
          <div className="flex-1 w-3/4">
          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Editar Configuración SEO</CardTitle>
              <p className="text-sm text-gray-600">
                Modifica la información para optimizar el posicionamiento en buscadores
              </p>
            </CardHeader>
            <CardContent>
              <SeoForm seo={seo} />
            </CardContent>
          </Card>
          </div>
          <div className="w-1/4 flex flex-col gap-4">
          <div>
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información del SEO</span>
                {getModelTypeBadge(seo.model_type)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <LinkIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Ruta:</span>
                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                      {seo.route}
                    </code>
                  </div>
                  {seo.model && (
                    <div>
                      <span className="font-medium">Asociado a:</span>
                      <span className="ml-2">{seo.model.title}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Creado:</span>
                    <span className="ml-2">{formatDate(seo.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Actualizado:</span>
                    <span className="ml-2">{formatDate(seo.updated_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
          <div>

          {/* Current SEO Preview */}
          {(seo.title || seo.description) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vista Previa Actual</CardTitle>
                <p className="text-sm text-gray-600">
                  Así se ve actualmente en los resultados de búsqueda
                </p>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-200 rounded p-4 bg-white">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {seo.title || 'Sin título configurado'}
                  </div>
                  <div className="text-green-600 text-sm">
                    https://ejemplo.com{seo.route}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {seo.description || 'Sin descripción configurada'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          </div>
          </div>
          </div>
      </div>
    </AppLayout>
  );
}