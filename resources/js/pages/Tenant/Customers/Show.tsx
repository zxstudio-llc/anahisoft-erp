import React from "react";
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, Receipt, CreditCard, User, Building, Hash } from "lucide-react";

export interface Customer {
  id: number;
  identification_type: '04' | '05' | '06' | '07';
  identification: string | null;
  business_name: string;
  trade_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  special_taxpayer: boolean;
  accounting_required: boolean;
  credit_limit: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  invoices_count: number;
  formatted_identification: string;
  identification_type_name: string;
  invoices?: Invoice[];
}

interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  issued_at: string;
}

interface CustomerShowProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

const Button = ({ children, onClick, disabled = false, variant = 'default', className = '' }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} h-10 px-4 py-2 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border"
  };

  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export default function Show({ customer, onEdit, onDelete, onBack }: CustomerShowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const confirmDelete = () => {
    if (window.confirm(`¿Estás seguro de eliminar al cliente "${customer.business_name}"? Esta acción no se puede deshacer.`)) {
      onDelete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalles del Cliente</h1>
            <p className="text-gray-600">Información completa del cliente</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo de Identificación</label>
                  <div className="flex items-center mt-1">
                    <Hash className="h-4 w-4 mr-2 text-gray-400" />
                    <Badge variant="outline">
                      {customer.identification_type_name}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Identificación</label>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-mono text-sm">{customer.formatted_identification}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Razón Social</label>
                <p className="mt-1 text-lg font-medium">{customer.business_name}</p>
              </div>

              {customer.trade_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre Comercial</label>
                  <p className="mt-1">{customer.trade_name}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                        {customer.email}
                      </a>
                    </div>
                  </div>
                )}

                {customer.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                        {customer.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {customer.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dirección</label>
                  <div className="flex items-start mt-1">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                    <span>{customer.address}</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Estado</span>
                  <Badge variant={customer.active ? "default" : "destructive"}>
                    {customer.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facturas Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Facturas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.invoices && customer.invoices.length > 0 ? (
                <div className="space-y-3">
                  {customer.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(invoice.issued_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay facturas registradas
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{customer.invoices_count}</div>
                <p className="text-sm text-gray-500">Facturas Emitidas</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(customer.credit_limit)}
                </div>
                <p className="text-sm text-gray-500">Límite de Crédito</p>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contribuyente Especial</span>
                  <Badge variant={customer.special_taxpayer ? "default" : "secondary"}>
                    {customer.special_taxpayer ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contabilidad Obligada</span>
                  <Badge variant={customer.accounting_required ? "default" : "secondary"}>
                    {customer.accounting_required ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Registro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Información de Registro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Creado</label>
                <p className="text-sm">{formatDate(customer.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Última Actualización</label>
                <p className="text-sm">{formatDate(customer.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}