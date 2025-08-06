import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function MenuCreate() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    is_active: true
  });

  const breadcrumbs = [
    { title: 'Panel', href: '/admin' },
    { title: 'Menús', href: '/admin/menus' },
    { title: 'Crear', href: '/admin/menus/create' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/admin/menus', formData);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear Menú" />
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-semibold">Crear Nuevo Menú</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ubicación
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Seleccionar ubicación</option>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
                <option value="sidebar">Sidebar</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded"
                />
                <span className="ml-2 text-sm">Menú activo</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.get('/admin/menus')}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Crear Menú
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
