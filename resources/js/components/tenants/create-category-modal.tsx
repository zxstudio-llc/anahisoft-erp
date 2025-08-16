import { Category } from '@/common/interfaces/tenant/categories.interface';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Api from '@/lib/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category;
    onSuccess?: (category: Category, isEdit: boolean) => void;
}

interface CategoryFormData {
    name: string;
    description: string;
    is_active: boolean;
}

interface ApiError {
    response?: {
        data?: {
            errors?: Record<string, string>;
        };
    };
}

export default function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
    const isEditMode = !!category;
    const [processing, setProcessing] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        is_active: true,
    });

    // Actualizar los datos del formulario cuando cambia la categoría
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                is_active: category.is_active !== undefined ? category.is_active : true,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                is_active: true,
            });
        }
    }, [category, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setValidationErrors({});

        try {
            let response;
            if (isEditMode && category) {
                response = await Api.put<Category>(`/v1/categories/${category.id}`, formData);
                if (response) {
                    toast.success('Categoría actualizada exitosamente');
                    if (onSuccess) {
                        onSuccess(response, true);
                    }
                }
            } else {
                response = await Api.post<Category>('/v1/categories', formData);
                if (response) {
                    toast.success('Categoría creada exitosamente');
                    if (onSuccess) {
                        onSuccess(response, false);
                    }
                }
            }
            handleClose();
        } catch (error) {
            console.error('Error:', error);
            const apiError = error as ApiError;
            if (apiError.response?.data?.errors) {
                setValidationErrors(apiError.response.data.errors);
                // Mostrar el primer error de validación
                const firstError = Object.values(apiError.response.data.errors)[0];
                toast.error(firstError || 'Error al procesar el formulario');
            } else {
                toast.error('Error al procesar la solicitud');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            is_active: true,
        });
        setValidationErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Actualice los datos de la categoría.'
                            : 'Complete la información para crear una nueva categoría.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Nombre <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ingrese el nombre de la categoría"
                            className={validationErrors.name ? 'border-red-500' : ''}
                        />
                        {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ingrese una descripción (opcional)"
                            className={validationErrors.description ? 'border-red-500' : ''}
                        />
                        {validationErrors.description && (
                            <p className="text-sm text-red-500">{validationErrors.description}</p>
                        )}
                    </div>

                    {/* Estado (solo en modo edición) */}
                    {isEditMode && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
                            />
                            <Label htmlFor="is_active" className="text-sm font-normal">
                                Categoría activa
                            </Label>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEditMode ? 'Actualizar' : 'Crear'} Categoría
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 