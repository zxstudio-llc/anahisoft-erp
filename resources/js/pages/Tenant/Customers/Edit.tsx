import React, { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

export interface Customer {
  id: number;
  identification_type: '04' | '05' | '06' | '07';
  identification: string | null;
  business_name: string;
  trade_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
}

interface CustomerFormData {
  identification_type: '04' | '05' | '06' | '07';
  identification: string;
  business_name: string;
  trade_name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
}

interface CustomerEditProps {
  customer: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  errors?: Record<string, string[]>;
}

const Button = ({ children, onClick, disabled = false, variant = 'default', type = 'button', className = '' }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} h-10 px-4 py-2 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', error = false, ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500' : 'border-input'} ${className}`}
    {...props}
  />
);

const Label = ({ children, htmlFor, className = '' }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    {children}
  </label>
);

const Select = ({ children, value, onChange, className = '', error = false }) => (
  <select
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500' : 'border-input'} ${className}`}
  >
    {children}
  </select>
);

const Textarea = ({ className = '', error = false, ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500' : 'border-input'} ${className}`}
    {...props}
  />
);

const Switch = ({ checked, onChange, id }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-primary' : 'bg-input'}`}
    id={id}
  >
    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

export default function Edit({ customer, onSubmit, onCancel, errors = {} }: CustomerEditProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    identification_type: customer.identification_type,
    identification: customer.identification || '',
    business_name: customer.business_name,
    trade_name: customer.trade_name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    active: customer.active
  });

  const identificationTypes = [
    { value: '04', label: 'RUC' },
    { value: '05', label: 'Cédula' },
    { value: '06', label: 'Pasaporte' },
    { value: '07', label: 'Consumidor Final' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getError = (field: string) => errors[field]?.[0];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Cliente</h1>
          <p className="text-gray-600">Actualiza los datos del cliente</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Identificación */}
          <div className="space-y-2">
            <Label htmlFor="identification_type">Tipo de Identificación *</Label>
            <Select
              value={formData.identification_type}
              onChange={(e) => updateField('identification_type', e.target.value)}
              error={!!getError('identification_type')}
            >
              {identificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            {getError('identification_type') && (
              <p className="text-sm text-red-600">{getError('identification_type')}</p>
            )}
          </div>

          {/* Identificación */}
          <div className="space-y-2">
            <Label htmlFor="identification">
              Identificación {formData.identification_type !== '07' ? '*' : ''}
            </Label>
            <Input
              id="identification"
              value={formData.identification}
              onChange={(e) => updateField('identification', e.target.value)}
              placeholder={formData.identification_type === '07' ? 'No aplica' : 'Ingrese identificación'}
              disabled={formData.identification_type === '07'}
              error={!!getError('identification')}
            />
            {getError('identification') && (
              <p className="text-sm text-red-600">{getError('identification')}</p>
            )}
          </div>
        </div>

        {/* Razón Social */}
        <div className="space-y-2">
          <Label htmlFor="business_name">Razón Social *</Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) => updateField('business_name', e.target.value)}
            placeholder="Ingrese la razón social"
            error={!!getError('business_name')}
          />
          {getError('business_name') && (
            <p className="text-sm text-red-600">{getError('business_name')}</p>
          )}
        </div>

        {/* Nombre Comercial */}
        <div className="space-y-2">
          <Label htmlFor="trade_name">Nombre Comercial</Label>
          <Input
            id="trade_name"
            value={formData.trade_name}
            onChange={(e) => updateField('trade_name', e.target.value)}
            placeholder="Nombre comercial (opcional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="cliente@email.com"
              error={!!getError('email')}
            />
            {getError('email') && (
              <p className="text-sm text-red-600">{getError('email')}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+593999123456"
              error={!!getError('phone')}
            />
            {getError('phone') && (
              <p className="text-sm text-red-600">{getError('phone')}</p>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Dirección completa del cliente"
            rows={3}
          />
        </div>

        {/* Estado Activo */}
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onChange={(value) => updateField('active', value)}
          />
          <Label htmlFor="active">Cliente activo</Label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Actualizar Cliente
          </Button>
        </div>
      </div>
    </div>
  );
}