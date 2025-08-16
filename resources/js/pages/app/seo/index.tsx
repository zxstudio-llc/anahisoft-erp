import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface SeoEntry {
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
}

interface PaginatedSeoEntries {
  data: SeoEntry[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface PageProps {
  seoEntries: PaginatedSeoEntries;
  flash?: {
    success?: string;
    error?: string;
  };
}

const seoBreadcrumbs: BreadcrumbItem[] = [
  { title: 'Panel', href: '/admin' },
  { title: 'SEO', href: '/admin/seo' }
];

export default function SeoIndex() {
  const { seoEntries, flash } = usePage().props as unknown as PageProps;

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

  const handleDelete = (seoId: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este SEO? Esta acción no se puede deshacer.')) {
      router.delete(`/admin/seo/${seoId}`, {
        preserveScroll: true,
        onSuccess: () => {
          // El flash message se maneja automáticamente por Inertia
        },
        onError: (errors) => {
          console.error('Error al eliminar SEO:', errors);
        }
      });
    }
  };

  const renderPaginationLinks = () => {
    if (seoEntries.last_page <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
        <div className="flex items-center text-sm text-gray-500">
          <span>
            Mostrando {seoEntries.from} a {seoEntries.to} de {seoEntries.total} resultados
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {seoEntries.links.map((link, index) => {
            if (!link.url) {
              return (
                <span
                  key={index}
                  className="px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              );
            }

            return (
              <Link
                key={index}
                href={link.url}
                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                  link.active
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                preserveScroll
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={seoBreadcrumbs}>
      <Head title="Gestión SEO" />
      
      <div className="p-6 space-y-4">
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestión SEO</h1>
            <p className="text-gray-600 mt-1">
              Administra el SEO global y específico de páginas y noticias
            </p>
          </div>
          <Link href="/admin/seo/create">
            <Button>Nuevo SEO</Button>
          </Link>
        </div>

        {/* Table Card */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Ruta</th>
                    <th className="px-4 py-3 font-medium">Título SEO</th>
                    <th className="px-4 py-3 font-medium">Asociado a</th>
                    <th className="px-4 py-3 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {seoEntries.data.length > 0 ? (
                    seoEntries.data.map((seo) => (
                      <tr key={seo.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {getModelTypeBadge(seo.model_type)}
                        </td>
                        <td className="px-4 py-3">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {seo.route}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">
                              {seo.title || 'Sin título'}
                            </div>
                            {seo.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs" title={seo.description}>
                                {seo.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {seo.model_type && seo.model ? (
                            <div>
                              <div className="font-medium text-sm">
                                {seo.model.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                /{seo.model.slug}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Sin asociar</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/seo/${seo.id}/edit`}
                                  className="flex items-center"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(seo.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Eye className="w-8 h-8 mb-2 text-gray-400" />
                          <p>No hay registros SEO configurados</p>
                          <Link href="/admin/seo/create" className="mt-2">
                            <Button variant="outline" size="sm">
                              Crear el primero
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {renderPaginationLinks()}
          </CardContent>
        </Card>

        {/* Stats */}
        {seoEntries.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {seoEntries.data.filter(seo => !seo.model_type).length}
                </div>
                <p className="text-sm text-gray-600">SEO Global</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {seoEntries.data.filter(seo => seo.model_type?.includes('Page')).length}
                </div>
                <p className="text-sm text-gray-600">SEO de Páginas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {seoEntries.data.filter(seo => seo.model_type?.includes('News')).length}
                </div>
                <p className="text-sm text-gray-600">SEO de Noticias</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}