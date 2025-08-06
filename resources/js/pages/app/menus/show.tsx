import React, { useState, useRef } from 'react'
import { router } from '@inertiajs/react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from "@/components/ui/switch"
import { Separator } from '@/components/ui/separator'
import { cn } from "@/lib/utils"

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

interface Props {
  items: MenuItem[];
  onReorder?: (newItems: Array<{
    id: number;
    order: number;
    parent_id: number | null;
  }>) => Promise<void>;
  menuItemTypes?: Record<string, string>;
  menuTitle?: string;
  menuId?: number;
}

export default function MenuShow({ 
  items, 
  onReorder, 
  menuItemTypes = {}, 
  menuTitle = '',
  menuId 
}: Props) {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null)
  const [dragOverItem, setDragOverItem] = useState<MenuItem | null>(null)
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | 'inside'>('before')
  const dragCounter = useRef(0)

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === getAllItemIds(items).length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(getAllItemIds(items)))
    }
  }

  const getAllItemIds = (menuItems: MenuItem[]): number[] => {
    let ids: number[] = []
    menuItems.forEach(item => {
      ids.push(item.id)
      if (item.children) {
        ids = ids.concat(getAllItemIds(item.children))
      }
    })
    return ids
  }

  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const deleteSelectedItems = () => {
    if (selectedItems.size === 0) return
    
    if (confirm(`¿Eliminar ${selectedItems.size} elemento(s) seleccionado(s)?`)) {
      selectedItems.forEach(itemId => {
        router.delete(`/admin/menu-items/${itemId}`)
      })
      setSelectedItems(new Set())
    }
  }

  const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1'
    setDraggedItem(null)
    setDragOverItem(null)
    dragCounter.current = 0
  }

  const handleDragOver = (e: React.DragEvent, item: MenuItem) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height
    
    if (y < height * 0.25) {
      setDragPosition('before')
    } else if (y > height * 0.75) {
      setDragPosition('after')
    } else {
      setDragPosition('inside')
    }
    
    setDragOverItem(item)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
  }

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverItem(null)
    }
  }

    const handleDrop = async (e: React.DragEvent, targetItem: MenuItem) => {
        e.preventDefault();
        
        if (!draggedItem || draggedItem.id === targetItem.id) {
        return;
        }
    
        try {
        let itemsToUpdate;
        
        if (targetItem.id === -1) {
            itemsToUpdate = prepareRootItemsForUpdate(items, draggedItem);
        } else {
            itemsToUpdate = prepareItemsForUpdate(items, draggedItem, targetItem, dragPosition);
        }
        
        if (onReorder) {
            await onReorder(itemsToUpdate);
        }
        } catch (error) {
        console.error('Error en el reordenamiento:', error);
        alert('Error al reordenar los elementos. Por favor intente nuevamente.');
        } finally {
        setDraggedItem(null);
        setDragOverItem(null);
        }
    };
  
  const prepareRootItemsForUpdate = (
    currentItems: MenuItem[],
    draggedItem: MenuItem
  ) => {
    const updatedItems = JSON.parse(JSON.stringify(currentItems));
    
    const findAndRemoveItem = (items: MenuItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === draggedItem.id) {
          items.splice(i, 1);
          return true;
        }
        if (items[i].children && findAndRemoveItem(items[i].children || [])) {
          return true;
        }
      }
      return false;
    };
  
    findAndRemoveItem(updatedItems);
  
    updatedItems.push({
      ...draggedItem,
      parent_id: null
    });
  
    return updatedItems.map((item: MenuItem, index: number) => ({
      id: item.id,
      order: Math.max(1, index + 1),
      parent_id: null
    }));
  };
  
  const prepareItemsForUpdate = (
    currentItems: MenuItem[],
    draggedItem: MenuItem,
    targetItem: MenuItem,
    position: 'before'|'after'|'inside'
  ) => {
    const updatedItems = JSON.parse(JSON.stringify(currentItems));
    
    const findItemAndParent = (items: MenuItem[], itemId: number, parent: MenuItem | null = null): 
      { item: MenuItem, parentItems: MenuItem[], parentItem: MenuItem | null } | null => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
          return { 
            item: items[i], 
            parentItems: items,
            parentItem: parent
          };
        }
        if (items[i].children) {
          const found = findItemAndParent(items[i].children || [], itemId, items[i]);
          if (found) return found;
        }
      }
      return null;
    };
  
    const dragged = findItemAndParent(updatedItems, draggedItem.id);
    const target = findItemAndParent(updatedItems, targetItem.id);
  
    if (!dragged || !target) return [];
  
    const draggedIndex = dragged.parentItems.findIndex(i => i.id === dragged.item.id);
    const [movedItem] = dragged.parentItems.splice(draggedIndex, 1);
  
    let newParentItems = target.parentItems;
    let newIndex = target.parentItems.findIndex(i => i.id === target.item.id);
    
    if (position === 'inside') {
      if (!target.item.children) target.item.children = [];
      newParentItems = target.item.children;
      newIndex = newParentItems.length;
      movedItem.parent_id = target.item.id;
    } else {
      movedItem.parent_id = target.parentItem?.id || null;
      if (position === 'after') newIndex++;
    }
  
    newParentItems.splice(newIndex, 0, movedItem);
  
    const flattenAndReorder = (items: MenuItem[], parentId: number | null = null) => {
      return items.reduce((acc, item, index) => {
        acc.push({
          id: item.id,
          order: index + 1,
          parent_id: parentId
        });
        
        if (item.children && item.children.length > 0) {
          acc.push(...flattenAndReorder(item.children, item.id));
        }
        
        return acc;
      }, [] as Array<{id: number, order: number, parent_id: number | null}>);
    };
  
    return flattenAndReorder(updatedItems);
  };

  const reorderItems = (
    menuItems: MenuItem[], 
    draggedItem: MenuItem, 
    targetItem: MenuItem, 
    position: 'before' | 'after' | 'inside'
  ): MenuItem[] => {
    const newItems = [...menuItems]
    
    const draggedIndex = newItems.findIndex(item => item.id === draggedItem.id)
    const targetIndex = newItems.findIndex(item => item.id === targetItem.id)
    
    if (draggedIndex === -1 || targetIndex === -1) return newItems
    
    const [removed] = newItems.splice(draggedIndex, 1)
    
    let insertIndex = targetIndex
    if (draggedIndex < targetIndex) {
      insertIndex = targetIndex - 1
    }
    
    if (position === 'after') {
      insertIndex += 1
    }
    
    newItems.splice(insertIndex, 0, removed)
    
    return newItems
  }

  const getDragOverStyles = (item: MenuItem) => {
    if (dragOverItem?.id !== item.id) return '';
    
    switch (dragPosition) {
      case 'before':
        return 'border-t-4 border-blue-500 mt-1';
      case 'after':
        return 'border-b-4 border-blue-500 mb-1';
      case 'inside':
        return 'bg-blue-50 border-2 border-blue-300 border-dashed';
      default:
        return '';
    }
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const isSelected = selectedItems.has(item.id)

    return (
      <div key={item.id} className="select-none">
        <div 
          className={`flex items-center justify-between bg-white p-3 rounded border cursor-move ${getDragOverStyles(item)} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{ marginLeft: `${depth * 20}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, item)}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item)}
        >
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleItemSelection(item.id)}
              onClick={(e) => e.stopPropagation()}
            />
            
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(item.id)
                }}
              >
                {isExpanded ? '▼' : '▶'}
              </Button>
            )}
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                {!item.is_active && <Badge variant="destructive">Inactivo</Badge>}
                <strong className={item.is_active ? 'text-gray-900' : 'text-gray-400'}>{item.label}</strong>
                <span className="text-sm text-gray-500">({menuItemTypes?.[item.type] || item.type})</span>
              </div>
              <div className="text-sm text-gray-600">
                {item.url} {item.target === '_blank' && <span className="text-xs">(Nueva ventana)</span>}
              </div>
              {item.css_class && <div className="text-xs text-gray-500">CSS: {item.css_class}</div>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline">#{item.order}</Badge>
            <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
              Editar
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => {
                if (confirm('¿Eliminar este elemento del menú?')) {
                  router.delete(`/admin/menu-items/${item.id}`)
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      router.put(`/admin/menu-items/${editingItem.id}`, {
        label: editingItem.label,
        url: editingItem.url,
        type: editingItem.type,
        target: editingItem.target,
        css_class: editingItem.css_class,
        order: editingItem.order,
        parent_id: editingItem.parent_id,
        is_active: editingItem.is_active
      }, {
        onSuccess: () => {
          setEditingItem(null);
          if (menuId) {
            router.reload();
          }
        },
        onError: (errors) => {
          console.error('Error al actualizar:', errors);
          alert(errors.message || 'Error al actualizar el elemento');
        }
      })
    }
  }

  const allItemIds = getAllItemIds(items)
  const isAllSelected = selectedItems.size === allItemIds.length && allItemIds.length > 0

  return (
    <>
      <div className="space-y-6">
        {menuTitle && (
          <div>
            <Label htmlFor="menu-name">Nombre del Menú</Label>
            <Input 
              id="menu-name" 
              value={menuTitle} 
              readOnly
              className="bg-gray-150"
            />
          </div>
        )}

        <div className="border rounded-md">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bulk-select-all"
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                />
                <Label htmlFor="bulk-select-all">
                  Selección múltiple {selectedItems.size > 0 && `(${selectedItems.size} seleccionados)`}
                </Label>
              </div>
              
              {selectedItems.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteSelectedItems}
                >
                  Eliminar seleccionados ({selectedItems.size})
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {selectedItems.size === 0 
                ? "Añade elementos al menú desde la columna izquierda." 
                : "Arrastra los elementos para reordenarlos o usa los controles de selección múltiple."
              }
            </p>
          </div>

          <Separator/>
          <div className="p-4">
            <div 
                className="p-4 mb-4 border-2 border-dashed rounded-lg"
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragPosition('before');
                    setDragOverItem({ id: -1 } as MenuItem);
                }}
                onDrop={(e) => {
                    if (draggedItem) {
                    handleDrop(e, { id: -1, parent_id: null } as MenuItem);
                    }
                }}
                >
                <div className={`text-center p-2 ${
                    dragOverItem?.id === -1 ? 'bg-blue-50' : ''
                }`}>
                    <Label>Soltar aquí para mover a la raíz del menú</Label>
                </div>
            </div>
            <div className="space-y-2">
              {items && items.length > 0 ? (
                items.map(item => renderMenuItem(item))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay elementos en este menú
                </div>
              )}
            </div>
          </div>

          <Separator/>
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="bulk-select-footer"
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
              <Label htmlFor="bulk-select-footer">Selección múltiple</Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Eliminar elementos seleccionados.
            </p>
          </div>
        </div>

        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Editar Elemento</DialogTitle>
                <DialogDescription>Modifica los campos y guarda los cambios.</DialogDescription>
                </DialogHeader>

                {editingItem && (
                <>
                <form onSubmit={handleUpdateItem} className="space-y-4 mt-4">
                              {/* Primera fila */}
                              <div className="flex gap-4">
                                  <div className="w-full">
                                      <Label>Texto del enlace</Label>
                                      <Input
                                          value={editingItem.label ?? ""}
                                          onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                                          required />
                                  </div>
                                  <div className="w-full">
                                      <Label>URL</Label>
                                      <Input
                                          value={editingItem.url ?? ""}
                                          onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })} />
                                  </div>
                              </div>

                              {/* Segunda fila */}
                              <div className="flex gap-4">
                                  <div className="w-full">
                                      <Label>Abrir en</Label>
                                      <Select
                                          value={editingItem.target ?? "_self"}
                                          onValueChange={(value) => setEditingItem({ ...editingItem, target: value })}
                                      >
                                          <SelectTrigger>
                                              <SelectValue placeholder="Seleccionar" />
                                          </SelectTrigger>
                                          <SelectContent>
                                              <SelectItem value="_self">Misma ventana</SelectItem>
                                              <SelectItem value="_blank">Nueva ventana</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  </div>
                                  <div className="w-full">
                                      <Label>Clase CSS</Label>
                                      <Input
                                          value={editingItem.css_class ?? ""}
                                          onChange={(e) => setEditingItem({ ...editingItem, css_class: e.target.value })}
                                          placeholder="class1 class2" />
                                  </div>
                              </div>

                              {/* Tercera fila */}
                              <div className="flex gap-4">
                                  <div className="w-full">
                                      <Label>Orden</Label>
                                      <Input
                                          type="number"
                                          min="0"
                                          value={editingItem.order ?? 0}
                                          onChange={(e) => setEditingItem({ ...editingItem, order: parseInt(e.target.value) })} />
                                  </div>
                                  <div className="w-1/3">
                                      <Label>Estado</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                          <div>
                                              <Badge
                                                  className={cn(
                                                      "rounded-full text-xs px-3 py-1",
                                                      editingItem.is_active
                                                          ? "bg-green-100 text-green-800"
                                                          : "bg-red-100 text-red-800"
                                                  )}
                                              >
                                                  {editingItem.is_active ? "Activo" : "Inactivo"}
                                              </Badge>
                                              <Switch
                                                  id="is_active"
                                                  checked={!!editingItem.is_active}
                                                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_active: !!checked })}
                                                  className={cn(
                                                      editingItem.is_active
                                                          ? "data-[state=checked]:bg-green-600"
                                                          : "data-[state=unchecked]:bg-red-600"
                                                  )} />
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </form><DialogFooter className="pt-4 flex flex-row gap-3">
                                  <Button type="button" onClick={handleUpdateItem}>
                                      Guardar
                                  </Button>
                                  <Button
                                      type="button"
                                      variant="destructive"
                                      onClick={() => setEditingItem(null)}
                                  >
                                      Cancelar
                                  </Button>
                              </DialogFooter>
                              </>
                )}
            </DialogContent>
            </Dialog>
      </div>
    </>
  )
}