import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { SeoForm } from './form';

const seoBreadcrumbs: BreadcrumbItem[] = [
  { title: 'Panel', href: '/admin' },
  { title: 'SEO', href: '/admin/seo' },
  { title: 'Crear', href: '/admin/seo/create' }
];

interface CreatePageProps {
  availableModels: Record<string, string>;
  pages: Array<{ id: number; title: string; slug: string }>;
  news: Array<{ id: number; title: string; slug: string }>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function CreateSeo() {
  const { flash } = usePage().props as CreatePageProps;

  return (
    <AppLayout breadcrumbs={seoBreadcrumbs}>
      <Head title="Crear SEO" />
      
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
                Crear Nuevo SEO
              </h1>
              <p className="text-gray-600 mt-1">
                Configura el SEO para una página específica o global
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4"> {/* Añade espacio entre los cards */}
          {/* Form Card - Ocupa 75% */}
          <div className="flex-1 w-3/4"> {/* flex-1 para que ocupe el espacio disponible o w-3/4 para 75% */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración SEO</CardTitle>
                <p className="text-sm text-gray-600">
                  Completa la información para optimizar el posicionamiento en buscadores
                </p>
              </CardHeader>
              <CardContent>
                <SeoForm />
              </CardContent>
            </Card>
          </div>

          {/* Help Section - Ocupa 25% */}
          <div className="w-1/4"> {/* w-1/4 para 25% del ancho */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Consejos SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm"> {/* Quitamos grid-cols-2 para que sea una sola columna */}
                  <div className="mb-4"> {/* Añadimos margen inferior */}
                    <h4 className="font-medium text-green-700">✅ Buenas Prácticas</h4>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Título único y descriptivo (50-60 caracteres)</li>
                      <li>• Meta descripción atractiva (150-160 caracteres)</li>
                      <li>• URL limpia y legible</li>
                      <li>• Imagen optimizada para redes sociales</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700">❌ Evitar</h4>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Títulos duplicados entre páginas</li>
                      <li>• Keyword stuffing en descripción</li>
                      <li>• URLs muy largas o con caracteres especiales</li>
                      <li>• Contenido duplicado</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}