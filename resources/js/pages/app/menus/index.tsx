import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import MenuShow from './show';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MenuItem {
  id: number;
  label: string;
  url: string;
  type: string;
  target: string;
  css_class: string;
  order: number;
  parent_id: number | null;
  is_active: boolean;
  children?: MenuItem[];
}

interface Menu {
  id: number;
  title: string;
  description: string;
  location: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  items_count?: number;
  items?: MenuItem[];
}

interface Props {
  menus: Menu[];
  availablePages?: Array<{id: number, title: string, slug: string}>;
  availableCategories?: Array<{id: number, name: string, slug: string}>;
  menuItemTypes?: Record<string, string>;
}

export default function MenuIndex({ 
  menus = [], 
  availablePages = [], 
  availableCategories = [],
  menuItemTypes = {} 
}: Props) {
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [customLink, setCustomLink] = useState({ label: '', url: '', target: '_self' });
  const [menuName, setMenuName] = useState('');
  const [localMenus, setLocalMenus] = useState<Menu[]>(menus);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectKey, setSelectKey] = useState(0);

  const breadcrumbs = [
    { title: 'Panel', href: '/admin' },
    { title: 'Menús', href: '/admin/menus' }
  ];

  useEffect(() => {
    if (menus.length > 0 && !selectedMenu) {
      setSelectedMenu(menus[0].id);
    }
  }, [menus]);

  const loadMenuItems = async (menuId: number) => {
    if (!menuId) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(`/admin/menus/${menuId}/items`);
      
      // Actualiza los menús con los items cargados
      const updatedMenus = menus.map(menu => 
        menu.id === menuId 
          ? { ...menu, items: response.data.items || [] }
          : menu
      );
      
      // Usa router.reload para actualizar las props
      router.reload({
        only: ['menus'],
        data: { menus: updatedMenus },
        onSuccess: () => {
          setSelectedMenu(menuId);
        }
      });
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMenu) {
      const menu = localMenus.find(m => m.id === selectedMenu);
      if (menu && !menu.items) {
        loadMenuItems(selectedMenu);
      }
    }
  }, [selectedMenu]);

  const handleDelete = (menuId: number) => {
    if (confirm('¿Estás seguro de eliminar este menú?')) {
      router.delete(`/admin/menus/${menuId}`, {
        onSuccess: () => {
          setLocalMenus(prevMenus => prevMenus.filter(menu => menu.id !== menuId));
          if (selectedMenu === menuId) {
            setSelectedMenu(null);
          }
        }
      });
    }
  };

  const handleCreateMenu = async () => {
    if (menuName.trim()) {
      try {
        setIsSaving(true);
        
        const response = await axios.post('/admin/menus', {
          title: menuName,
          description: '',
          location: '',
          is_active: true
        });

        // Recarga los datos del servidor para obtener el menú recién creado
        router.reload({
          only: ['menus'],
          onSuccess: () => {
            // Encuentra y selecciona el nuevo menú
            const newMenu = menus.find(m => m.title === menuName);
            if (newMenu) {
              setSelectedMenu(newMenu.id);
            }
            setMenuName('');
          }
        });
      } catch (error) {
        alert('Error al crear el menú. Por favor intente nuevamente.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAddPages = async () => {
    if (selectedMenu && selectedPages.length > 0) {
      try {
        const menu = localMenus.find(m => m.id === selectedMenu);
        const currentMaxOrder = menu?.items?.reduce((max, item) => Math.max(max, item.order), 0) || 0;

        const promises = selectedPages.map(async (pageId, index) => {
          const page = availablePages.find(p => p.id === pageId);
          return axios.post(`/admin/menus/${selectedMenu}/items`, {
            label: page?.title || '',
            url: `/${page?.slug || ''}`,
            type: 'page',
            target: '_self',
            css_class: '',
            order: currentMaxOrder + index + 1,
            parent_id: null,
            is_active: true
          });
        });

        await Promise.all(promises);
        await loadMenuItems(selectedMenu);
        setSelectedPages([]);
      } catch (error) {
        alert('Error al agregar páginas. Por favor intente nuevamente.');
      }
    }
  };

  const handleAddCategories = async () => {
    if (selectedMenu && selectedCategories.length > 0) {
      try {
        const menu = localMenus.find(m => m.id === selectedMenu);
        const currentMaxOrder = menu?.items?.reduce((max, item) => Math.max(max, item.order), 0) || 0;

        const promises = selectedCategories.map(async (categoryId, index) => {
          const category = availableCategories.find(c => c.id === categoryId);
          return axios.post(`/admin/menus/${selectedMenu}/items`, {
            label: category?.name || '',
            url: `/category/${category?.slug || ''}`,
            type: 'category',
            target: '_self',
            css_class: '',
            order: currentMaxOrder + index + 1,
            parent_id: null,
            is_active: true
          });
        });

        await Promise.all(promises);
        await loadMenuItems(selectedMenu);
        setSelectedCategories([]);
      } catch (error) {
        alert('Error al agregar categorías. Por favor intente nuevamente.');
      }
    }
  };

  const handleAddCustomLink = async () => {
    if (selectedMenu && customLink.label && customLink.url) {
      try {
        const menu = localMenus.find(m => m.id === selectedMenu);
        const currentMaxOrder = menu?.items?.reduce((max, item) => Math.max(max, item.order), 0) || 0;

        await axios.post(`/admin/menus/${selectedMenu}/items`, {
          label: customLink.label,
          url: customLink.url,
          type: 'custom',
          target: customLink.target,
          css_class: '',
          order: currentMaxOrder + 1,
          parent_id: null,
          is_active: true
        });

        await loadMenuItems(selectedMenu);
        setCustomLink({ label: '', url: '', target: '_self' });
      } catch (error) {
        alert('Error al agregar enlace personalizado. Por favor intente nuevamente.');
      }
    }
  };

  const handleReorder = async (menuId: number, newItems: Array<{id: number, order: number, parent_id: number | null}>) => {
    try {
      await router.put(`/admin/menus/${menuId}/update-order`, {
        items: newItems
      }, {
        preserveScroll: true,
        onSuccess: () => {
          loadMenuItems(menuId);
        }
      });
    } catch (error) {
    }
  };

  const handleSaveMenu = async () => {
    if (!selectedMenu) return;
    
    const menuToSave = localMenus.find(menu => menu.id === selectedMenu);
    if (!menuToSave) return;

    try {
      setIsSaving(true);
      
      await router.put(`/admin/menus/${selectedMenu}`, {
        title: menuToSave.title,
        description: menuToSave.description,
        location: menuToSave.location,
        is_active: menuToSave.is_active
      }, {
        onSuccess: () => {
          router.reload();
        }
      });
      
    } catch (error) {
      alert('Error al guardar el menú. Por favor intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentMenu = selectedMenu 
  ? menus.find(menu => menu.id === selectedMenu)
  : null;
  const safeItemsCount = (menu: Menu) => menu.items?.length || menu.items_count || 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Menús" />
      
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Menus</h2>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-6">
            {/* Columna izquierda: Agregar elementos */}
            <div className="w-full lg:w-1/4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agregar elementos al menú</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Selector de menú */}
                  <div className="space-y-1">
                    <Label>Seleccionar menú para editar</Label>
                    <Select
          value={selectedMenu?.toString() || ""}
          onValueChange={(value) => setSelectedMenu(value ? parseInt(value) : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="-- Seleccione un menú --" />
          </SelectTrigger>
          <SelectContent>
            {menus.map((menu) => (
              <SelectItem key={menu.id} value={menu.id.toString()}>
                {menu.title} ({(menu.items?.length || 0)} items)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
                  </div>

                  {/* Crear nuevo menú */}
                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-sm">Crear nuevo menú</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <Input
                        value={menuName}
                        onChange={(e) => setMenuName(e.target.value)}
                        placeholder="Nombre del menú"
                      />
                      <Button
                        onClick={handleCreateMenu}
                        disabled={!menuName.trim() || isSaving}
                      >
                        {isSaving ? "Creando..." : "Crear"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Agregar páginas */}
                  {availablePages.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Páginas</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 py-2 space-y-2 max-h-48 overflow-y-auto">
                        {availablePages.map((page) => (
                          <label key={page.id} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedPages.includes(page.id)}
                              onChange={(e) =>
                                e.target.checked
                                  ? setSelectedPages([...selectedPages, page.id])
                                  : setSelectedPages(
                                      selectedPages.filter((id) => id !== page.id)
                                    )
                              }
                              disabled={!selectedMenu}
                            />
                            <span>{page.title}</span>
                          </label>
                        ))}
                      </CardContent>
                      <div className="px-4 py-2 border-t">
                        <Button
                          onClick={handleAddPages}
                          disabled={selectedPages.length === 0 || !selectedMenu}
                          className="w-full"
                        >
                          Añadir al menú
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Agregar categorías */}
                  {availableCategories.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Categorías</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 py-2 space-y-2 max-h-48 overflow-y-auto">
                        {availableCategories.map((category) => (
                          <label key={category.id} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.id)}
                              onChange={(e) =>
                                e.target.checked
                                  ? setSelectedCategories([
                                      ...selectedCategories,
                                      category.id,
                                    ])
                                  : setSelectedCategories(
                                      selectedCategories.filter((id) => id !== category.id)
                                    )
                              }
                              disabled={!selectedMenu}
                            />
                            <span>{category.name}</span>
                          </label>
                        ))}
                      </CardContent>
                      <div className="px-4 py-2 border-t">
                        <Button
                          onClick={handleAddCategories}
                          disabled={selectedCategories.length === 0 || !selectedMenu}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Añadir al menú
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Enlace personalizado */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Enlaces personalizados</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-2 space-y-2">
                      <Input
                        type="text"
                        value={customLink.url}
                        onChange={(e) =>
                          setCustomLink({ ...customLink, url: e.target.value })
                        }
                        placeholder="URL"
                        disabled={!selectedMenu}
                      />
                      <Input
                        type="text"
                        value={customLink.label}
                        onChange={(e) =>
                          setCustomLink({ ...customLink, label: e.target.value })
                        }
                        placeholder="Texto del enlace"
                        disabled={!selectedMenu}
                      />
                      <Select
                        value={customLink.target}
                        onValueChange={(value) =>
                          setCustomLink({ ...customLink, target: value })
                        }
                        disabled={!selectedMenu}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_self">Misma ventana</SelectItem>
                          <SelectItem value="_blank">Nueva ventana</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddCustomLink}
                        disabled={!customLink.label || !customLink.url || !selectedMenu}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        Añadir al menú
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha: MenuShow */}
            <div className="w-3/4 h-full">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-xl">Estructura del Menú</CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Cargando elementos del menú...</span>
                    </div>
                  ) : currentMenu ? (
                    <div className="rounded-md border border-transparent">
                      <MenuShow
                        items={currentMenu.items || []}
                        menuTitle={currentMenu.title}
                        menuId={currentMenu.id}
                        menuItemTypes={menuItemTypes}
                        onReorder={(newItems) => handleReorder(currentMenu.id, newItems)}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Selecciona un menú para ver su estructura
                    </div>
                  )}

                  {/* Configuraciones del menú */}
                  {currentMenu && (
                    <div>
                      <h3 className="font-semibold mb-2">Configuraciones del Menú</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="auto-add-pages" />
                          <Label htmlFor="auto-add-pages">Agregar automáticamente nuevas páginas principales a este menú</Label>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="primary" 
                              checked={currentMenu.location === 'primary'}
                              onCheckedChange={(checked) => {
                                setLocalMenus(prevMenus => 
                                  prevMenus.map(menu => 
                                    menu.id === currentMenu.id 
                                      ? { ...menu, location: checked ? 'primary' : '' }
                                      : menu
                                  )
                                );
                              }}
                            />
                            <Label htmlFor="primary">Menú principal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="secondary" 
                              checked={currentMenu.location === 'secondary'}
                              onCheckedChange={(checked) => {
                                setLocalMenus(prevMenus => 
                                  prevMenus.map(menu => 
                                    menu.id === currentMenu.id 
                                      ? { ...menu, location: checked ? 'secondary' : '' }
                                      : menu
                                  )
                                );
                              }}
                            />
                            <Label htmlFor="secondary">Menú secundario</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between items-center">
                  {currentMenu && (
                    <>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDelete(currentMenu.id)}
                      >
                        Eliminar Menú
                      </Button>
                      <Button onClick={handleSaveMenu} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Menú'
                        )}
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}