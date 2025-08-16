import { useEffect, useState, useMemo, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { Key, Plus } from 'lucide-react';

import { ApiKey, ApiKeyResponse } from '@/common/interfaces/tenant/apikey.interface';
import Api from '@/lib/api';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ApiKeyModal from '@/components/tenants/create-api-key-modal';
import { DataTable } from './partials/data-table';
import { createColumns } from './partials/columns';

export default function ApiKeysIndex() {
  const [tokens, setTokens] = useState<ApiKey[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    from: 0,
    last_page: 1,
    to: 0,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    sort_field: 'created_at',
    sort_order: 'desc' as 'asc' | 'desc',
    per_page: 10,
    page: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      const response = await Api.get<ApiKeyResponse>('/v1/api-keys', {
        params: { params: filters },
      });

      const resp = response.data.tokens;

      setTokens(resp.data);
      setMeta({
        current_page: resp.current_page,
        from: resp.from,
        last_page: resp.last_page,
        to: resp.to,
        total: resp.total,
      });
    } catch (error) {
      console.error('Error al cargar tokens:', error);
      toast.error('Error al cargar los tokens');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar directamente sin diálogo de confirmación
  const handleDirectDelete = useCallback(async (token: ApiKey) => {
    console.log('Direct delete for token:', token.name, 'ID:', token.id);
    try {
      const response = await Api.delete<ApiKeyResponse>(`/v1/api-keys/${token.id}`);
      
      console.log('Delete response:', response);
      
      // Verificar diferentes estructuras de respuesta
      if (response.success || response.data?.success || response.status === 200) {
        await loadTokens();
        toast.success('Token eliminado correctamente');
      } else {
        console.error('Delete failed - response:', response);
        toast.error('Error al eliminar el token');
      }
    } catch (error) {
      console.error('Error al eliminar token:', error);
      
      // Verificar si es un error 404 (token no encontrado) o 200 (éxito)
      if (error.response?.status === 404) {
        toast.error('Token no encontrado');
      } else if (error.response?.status === 200) {
        // Algunas APIs devuelven 200 pero como "error"
        await loadTokens();
        toast.success('Token eliminado correctamente');
      } else {
        toast.error('Error al eliminar el token');
      }
    }
  }, [filters]);

  useEffect(() => {
    loadTokens();
  }, [filters]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleModalOpen = () => {
    if (tokens.length >= 10) {
      toast.error('Has alcanzado el límite máximo de 10 llaves API');
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadTokens();
    setIsModalOpen(false);
  };

  // Memorizar las columnas para evitar recrearlas en cada render
  const columns = useMemo(() => {
    // Eliminación directa sin confirmación
    return createColumns(handleDirectDelete);
  }, [handleDirectDelete]);

  // Verificar si se ha alcanzado el límite
  const hasReachedLimit = tokens.length >= 10;
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Llaves API', href: '/api-keys' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Llaves API" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Key className="h-6 w-6" />
              <div>
                <h2 className="text-lg font-bold">Llaves API</h2>
                <p className="text-sm text-gray-500">
                  Gestiona las llaves de acceso a la API ({tokens.length}/10)
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <Button 
                onClick={handleModalOpen}
                disabled={hasReachedLimit}
                className={hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Llave API
              </Button>
              {hasReachedLimit && (
                <p className="text-xs text-muted-foreground mt-1">
                  Límite máximo: 10 llaves API
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={columns}
              data={tokens}
              onSearch={handleSearch}
              searchValue={filters.search}
              isLoading={isLoading}
            />
          </CardContent>
        </div>
      </div>

      <ApiKeyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleModalSuccess} 
      />
    </AppLayout>
  );
}