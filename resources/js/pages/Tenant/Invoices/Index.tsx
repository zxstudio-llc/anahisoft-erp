import { Props } from '@/common/interfaces/tenant/invoices.interface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { 
  Search, 
  ArrowUpDown, 
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Download,
  Send,
  Trash2,
  Copy,
  Plus
} from 'lucide-react';
import { useState } from 'react';
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

// Tipo de datos para las facturas (basado en tu interfaz)
interface Invoice {
  id: number;
  number: string;
  client_name: string;
  date: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

// Componente para las acciones específicas de cada factura
const InvoiceActions = ({ invoice }: { invoice: Invoice }) => {
  const handleView = () => {
    router.get(`/invoices/${invoice.id}`);
  };

  const handleEdit = () => {
    router.get(`/invoices/${invoice.id}/edit`);
  };

  const handleDownloadPDF = () => {
    router.get(`/invoices/${invoice.id}/pdf`);
  };

  const handleSend = () => {
    router.post(`/invoices/${invoice.id}/send`);
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
      router.delete(`/invoices/${invoice.id}`);
    }
  };

  const handleDuplicate = () => {
    router.post(`/invoices/${invoice.id}/duplicate`);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Ver */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleView}
        title="Ver factura"
      >
        <Eye className="h-4 w-4" />
      </Button>

      {/* Editar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEdit}
        title="Editar factura"
        disabled={invoice.status === 'paid'}
      >
        <Edit className="h-4 w-4" />
      </Button>

      {/* Descargar PDF */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownloadPDF}
        title="Descargar PDF"
      >
        <Download className="h-4 w-4" />
      </Button>

      {/* Menú de más acciones */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          
          {invoice.status === 'draft' && (
            <DropdownMenuItem onClick={handleSend}>
              <Send className="mr-2 h-4 w-4" />
              Enviar factura
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => navigator.clipboard.writeText(invoice.number)}
          >
            Copiar número
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600"
            disabled={invoice.status === 'paid'}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Definición de columnas para TanStack Table
const createColumns = (): ColumnDef<Invoice>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "number",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Número
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-mono font-medium">
        {row.getValue("number")}
      </div>
    ),
  },
  {
    accessorKey: "client_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cliente
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <div className="font-medium truncate">
          {row.getValue("client_name")}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return <div>{date.toLocaleDateString('es-ES')}</div>;
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="justify-start"
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const total = parseFloat(row.getValue("total"));
      const formatted = total.toLocaleString('es-EC', {
        currency: 'USD',
        style: 'currency',
      });
      return (
        <div className="text-right font-medium">
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = {
        draft: { label: 'Borrador', variant: 'secondary' as const },
        sent: { label: 'Enviada', variant: 'default' as const },
        paid: { label: 'Pagada', variant: 'default' as const },
        overdue: { label: 'Vencida', variant: 'destructive' as const },
        cancelled: { label: 'Cancelada', variant: 'outline' as const },
      };
      
      const config = statusConfig[status as keyof typeof statusConfig];
      
      return (
        <Badge variant={config?.variant || 'secondary'}>
          {config?.label || status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <InvoiceActions invoice={row.original} />;
    },
  },
];

export default function Index({ invoices = [], filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    // Estados para TanStack Table
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const columns = React.useMemo(() => createColumns(), []);

    const table = useReactTable({
        data: invoices,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/invoices', { search: searchTerm, status: status === 'all' ? '' : status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/invoices', { search: searchTerm, status: value === 'all' ? '' : value }, { preserveState: true });
    };

    // Aplicar filtros locales de la tabla
    React.useEffect(() => {
        table.getColumn("client_name")?.setFilterValue(searchTerm);
    }, [searchTerm, table]);

    React.useEffect(() => {
        if (status && status !== 'all') {
            table.getColumn("status")?.setFilterValue([status]);
        } else {
            table.getColumn("status")?.setFilterValue(undefined);
        }
    }, [status, table]);

    return (
        <AppLayout>
            <Head title="Facturas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Facturas</h1>
                    <Button onClick={() => router.get('/invoices/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Factura
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                            <form onSubmit={handleSearch} className="flex w-full items-center space-x-2 md:w-96">
                                <Input
                                    placeholder="Buscar por cliente o número..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                                <Button type="submit" size="icon" variant="ghost">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                            <div className="flex items-center space-x-2">
                                <Select value={status} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-full md:w-40">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="draft">Borrador</SelectItem>
                                        <SelectItem value="sent">Enviada</SelectItem>
                                        <SelectItem value="paid">Pagada</SelectItem>
                                        <SelectItem value="overdue">Vencida</SelectItem>
                                        <SelectItem value="cancelled">Cancelada</SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            Columnas <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {table
                                            .getAllColumns()
                                            .filter((column) => column.getCanHide())
                                            .map((column) => {
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        key={column.id}
                                                        className="capitalize"
                                                        checked={column.getIsVisible()}
                                                        onCheckedChange={(value) =>
                                                            column.toggleVisibility(!!value)
                                                        }
                                                    >
                                                        {column.id}
                                                    </DropdownMenuCheckboxItem>
                                                );
                                            })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Tabla con TanStack Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead key={header.id}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </TableHead>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                                className="hover:bg-muted/50"
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                No se encontraron facturas.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Información de selección y paginación */}
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="flex-1 text-sm text-muted-foreground">
                                {table.getFilteredSelectedRowModel().rows.length} de{" "}
                                {table.getFilteredRowModel().rows.length} factura(s) seleccionada(s).
                            </div>
                            <div className="flex items-center space-x-6 lg:space-x-8">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium">Filas por página</p>
                                    <Select
                                        value={`${table.getState().pagination.pageSize}`}
                                        onValueChange={(value) => {
                                            table.setPageSize(Number(value))
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-[70px]">
                                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                                    {pageSize}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                                    {table.getPageCount()}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        className="hidden h-8 w-8 p-0 lg:flex"
                                        onClick={() => table.setPageIndex(0)}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <span className="sr-only">Ir a la primera página</span>
                                        {'<<'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <span className="sr-only">Ir a la página anterior</span>
                                        {'<'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <span className="sr-only">Ir a la página siguiente</span>
                                        {'>'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="hidden h-8 w-8 p-0 lg:flex"
                                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <span className="sr-only">Ir a la última página</span>
                                        {'>>'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}