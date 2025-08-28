import { Customer, CustomerResponse, DocumentType } from '@/common/interfaces/tenant/customers.interface';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Api from '@/lib/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ApiError, ApiResponse } from '@/common/interfaces/tenant/document-validation.interface';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  documentTypes: DocumentType[];
  onSuccess?: (customer: Customer) => void;
}

export default function CustomerModal({ isOpen, onClose, customer, documentTypes, onSuccess }: CustomerModalProps) {
  const isEditMode = !!customer;
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    business_name: '',
    document_type: '01',
    identification: '',
    email: '',
    phone: '',
    address: '',
    is_active: true,
  });

  // Cargar datos en edición
  useEffect(() => {
    if (customer) {
      setFormData({
        business_name: customer.business_name,
        document_type: customer.document_type,
        identification: customer.identification,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        is_active: customer.is_active,
      });
    } else {
      setFormData({
        business_name: '',
        document_type: '01',
        identification: '',
        email: '',
        phone: '',
        address: '',
        is_active: true,
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setValidationErrors({});

    try {
      let response;
      if (isEditMode && customer) {
        response = await Api.put<ApiResponse<CustomerResponse>>(`/v1/customer/${customer.id}`, formData);
      } else {
        response = await Api.post<ApiResponse<CustomerResponse>>('/v1/customer', formData);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        if (onSuccess) onSuccess(response.data.data);
        handleClose();
      }
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.errors) {
        const errors: { [key: string]: string } = {};
        Object.entries(apiError.response.data.errors).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : value;
        });
        setValidationErrors(errors);
        toast.error(Object.values(errors)[0] || 'Error en formulario');
      } else {
        toast.error(apiError.response?.data?.message || 'Error al procesar solicitud');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setFormData({
      business_name: '',
      document_type: '01',
      identification: '',
      email: '',
      phone: '',
      address: '',
      is_active: true,
    });
    setValidationErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Actualiza los datos del cliente.' : 'Completa la información para registrar un nuevo cliente.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="business_name">Razón Social / Nombre</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="Razón social o nombre"
              className={validationErrors.business_name ? 'border-red-500' : ''}
            />
            {validationErrors.business_name && <p className="text-sm text-red-500">{validationErrors.business_name}</p>}
          </div>

          {/* Documento */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="document_type">Tipo de Documento</Label>
              <select
                id="document_type"
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 text-sm ${validationErrors.document_type ? 'border-red-500' : ''}`}
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {validationErrors.document_type && <p className="text-sm text-red-500">{validationErrors.document_type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="identification">Número</Label>
              <Input
                id="identification"
                value={formData.identification}
                onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
                placeholder="Número de identificación"
                className={validationErrors.identification ? 'border-red-500' : ''}
              />
              {validationErrors.identification && <p className="text-sm text-red-500">{validationErrors.identification}</p>}
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className={validationErrors.email ? 'border-red-500' : ''}
              />
              {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Número de teléfono"
                className={validationErrors.phone ? 'border-red-500' : ''}
              />
              {validationErrors.phone && <p className="text-sm text-red-500">{validationErrors.phone}</p>}
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Dirección completa"
              className={validationErrors.address ? 'border-red-500' : ''}
            />
            {validationErrors.address && <p className="text-sm text-red-500">{validationErrors.address}</p>}
          </div>

          {/* Estado */}
          {isEditMode && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
              />
              <Label htmlFor="is_active" className="text-sm font-normal">
                Cliente activo
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>{isEditMode ? 'Actualizar' : 'Crear'} Cliente</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
