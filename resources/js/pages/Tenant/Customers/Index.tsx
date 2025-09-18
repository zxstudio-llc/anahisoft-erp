import { Customer, DocumentType } from '@/common/interfaces/tenant/customers.interface';
import CustomerModal from '@/components/tenants/create-customer-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import Api from '@/lib/api';
import {
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCircle,
    ArrowUpDown,
    ChevronDown,
    MoreHorizontal
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
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
} from "@tanstack/react-table"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconX } from '@tabler/icons-react';
import { Label } from '@/components/ui/label';

interface ApiResponse {
    success: boolean;
    customers: Customer[];
    identification_types: Array<{
        value: string;
        label: string;
    }>;
}

interface DeleteResponse {
    success: boolean;
    message: string;
}

export default function Index() {
    // Estados
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]); // Todos los datos sin filtrar
    const [documentTypes, setDocumentTypes] = useState<Array<{ value: string; label: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);

    // Estados para TanStack Table
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [identificationTypeFilter, setIdentificationTypeFilter] = useState('all');

    // Funciones utilitarias para formatear identificación
    const getIdentificationTypeName = (type: string): string => {
        const types: Record<string, string> = {
            '04': 'RUC',
            '05': 'Cédula',
            '06': 'Pasaporte',
            '07': 'Consumidor Final'
        };
        return types[type] || 'Otro';
    };

    const formatIdentification = (identification: string, type: string): string => {
        if (!identification) return '-';

        if (type === '04' && identification.length === 13) {
            return `${identification.slice(0, 10)}-${identification.slice(10)}`;
        }

        return identification;
    };

    const handleDelete = async (customer: Customer) => {
        if (!confirm('¿Está seguro de eliminar este cliente?')) return;

        try {
            const response = await Api.delete<{ data: DeleteResponse }>(`/v1/customer/${customer.id}`);
            if (response.data.success) {
                toast.success(response.data.message);
                loadCustomers();
            }
        } catch (error) {
            toast.error('Error al eliminar el cliente');
        }
    };

    const handleModalSuccess = (customer: Customer) => {
        loadCustomers();
        setIsModalOpen(false);
        setSelectedCustomer(undefined);
    };

    // Función de filtro global personalizada con debug
    const globalFilterFn = (row: any, columnId: string, value: string): boolean => {
        const customer = row.original as Customer;
        const searchValue = value.toLowerCase().trim();

        if (!searchValue) return true;

        const businessName = customer.business_name?.toLowerCase() || '';
        const tradeName = customer.trade_name?.toLowerCase() || '';
        const identification = customer.identification?.toLowerCase() || '';
        const email = customer.email?.toLowerCase() || '';
        const phone = customer.phone?.toLowerCase() || '';

        // Debug temporal - elimina estas líneas después de probar
        // if (searchValue.includes('zx-studio')) {
        //     console.log('Buscando:', searchValue);
        //     console.log('Business Name:', businessName);
        //     console.log('Coincide business_name:', businessName.includes(searchValue));
        //     console.log('Customer completo:', customer);
        // }

        return (
            businessName.includes(searchValue) ||
            tradeName.includes(searchValue) ||
            identification.includes(searchValue) ||
            email.includes(searchValue) ||
            phone.includes(searchValue)
        );
    };

    // Definir columnas de la tabla
    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: "id",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 p-0 font-medium"
                >
                    ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("id")}</div>
            ),
        },
        {
            accessorKey: "business_name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 p-0 font-medium"
                >
                    Razón Social
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    <span className="font-medium">{row.getValue("business_name")}</span>
                </div>
            ),
            filterFn: "includesString",
        },
        {
            accessorKey: "identification_type",
            header: "Tipo de ID",
            cell: ({ row }) => {
                const type = row.getValue("identification_type") as string;
                return (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {getIdentificationTypeName(type)}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => {
                if (value === 'all') return true;
                return row.getValue(id) === value;
            },
        },
        {
            id: "identification",
            header: "Identificación",
            accessorFn: (row) => row.identification || '',
            cell: ({ row }) => {
                const customer = row.original;
                const identification = customer.identification || customer.formatted_identification || '';
                return (
                    <div className="font-mono">
                        {formatIdentification(identification, customer.identification_type)}
                    </div>
                );
            },
            filterFn: "includesString",
        },
        {
            accessorKey: "email",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 p-0 font-medium"
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="lowercase">{row.getValue("email") || '-'}</div>
            ),
            filterFn: "includesString",
        },
        {
            accessorKey: "phone",
            header: "Teléfono",
            cell: ({ row }) => (
                <div>{row.getValue("phone") || '-'}</div>
            ),
            filterFn: "includesString",
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 p-0 font-medium"
                >
                    Fecha de Registro
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"));
                return (
                    <div>
                        {date.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        })}
                    </div>
                );
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const customer = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedCustomer(customer);
                                    setIsModalOpen(true);
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar cliente
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(customer)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar cliente
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    // Cargar customers (todos los datos)
    const loadCustomers = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await Api.get<{ data: ApiResponse }>('/v1/customer/all');

            if (response.data.success) {
                setCustomers(response.data.customers);
                setAllCustomers(response.data.customers);
                setDocumentTypes(response.data.identification_types || []);
            }
        } catch (error) {
            toast.error('Error al cargar los clientes');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    // Manejar cambio de filtro de tipo de identificación
    const handleIdentificationTypeChange = (value: string) => {
        setIdentificationTypeFilter(value);
        table.getColumn("identification_type")?.setFilterValue(value);
    };

    // Limpiar filtros
    const clearFilters = () => {
        setGlobalFilter('');
        setIdentificationTypeFilter('all');
        table.resetColumnFilters();
        table.resetGlobalFilter();
    };

    // Configurar tabla con client-side filtering
    const table = useReactTable({
        data: customers,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        globalFilterFn: globalFilterFn,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    const breadcrumbs = [
        { title: 'Inicio', href: '/' },
        { title: 'Clientes', href: '/customers' },
    ];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                            <UserCircle className="h-6 w-6" />
                            <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Cliente
                        </Button>
                    </CardHeader>

                    <CardContent>
                        {/* Filtros */}
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center justify-between">
                            <div className="flex gap-2 items-center">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por razón social, identificación, email..."
                                            value={globalFilter ?? ""}
                                            onChange={(event) => setGlobalFilter(event.target.value)}
                                            className="pl-8 w-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex ">
                                    {table.getFilteredRowModel().rows.length !== allCustomers.length && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                        >
                                            <IconX /> Limpiar filtros
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Select
                                    value={identificationTypeFilter}
                                    onValueChange={handleIdentificationTypeChange}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Tipo de identificación" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los tipos</SelectItem>
                                        {documentTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
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
                                                        {column.id === 'business_name' ? 'Razón Social' :
                                                            column.id === 'identification_type' ? 'Tipo de ID' :
                                                                column.id === 'identification' ? 'Identificación' :
                                                                    column.id === 'created_at' ? 'Fecha de Registro' :
                                                                        column.id}
                                                    </DropdownMenuCheckboxItem>
                                                );
                                            })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="relative">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                </div>
                            ) : allCustomers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <UserCircle className="h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        No hay clientes registrados
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Para comenzar a usar el sistema, necesitas registrar al menos un cliente.
                                    </p>
                                    <div className="mt-6">
                                        <Button onClick={() => setIsModalOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Registrar Primer Cliente
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="overflow-hidden rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                {table.getHeaderGroups().map((headerGroup) => (
                                                    <TableRow key={headerGroup.id}>
                                                        {headerGroup.headers.map((header) => (
                                                            <TableHead key={header.id}>
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableHeader>
                                            <TableBody>
                                                {table.getRowModel().rows?.length ? (
                                                    table.getRowModel().rows.map((row) => (
                                                        <TableRow
                                                            key={row.id}
                                                            data-state={row.getIsSelected() && "selected"}
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
                                                            No se encontraron resultados.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Paginación estilo shadcn */}
                                    <div className="flex items-center justify-between px-4">
                                        {/* Texto de filas seleccionadas */}
                                        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex items-center">
                                            {table.getFilteredRowModel().rows.length === allCustomers.length ? (
                                                <span>
                                                    Total de {allCustomers.length} clientes
                                                </span>
                                            ) : (
                                                <span>
                                                    Mostrando {table.getFilteredRowModel().rows.length} de {allCustomers.length} clientes
                                                </span>
                                            )}
                                        </div>

                                        {/* Controles de paginación */}
                                        <div className="flex w-full items-center gap-8 lg:w-fit">
                                            {/* Selector de cantidad de filas */}
                                            <div className="hidden items-center gap-2 lg:flex">
                                                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                                    Filas por página
                                                </Label>
                                                <Select
                                                    value={`${table.getState().pagination.pageSize}`}
                                                    onValueChange={(value) => {
                                                        table.setPageSize(Number(value))
                                                    }}
                                                >
                                                    <SelectTrigger className="w-20" id="rows-per-page">
                                                        <SelectValue
                                                            placeholder={table.getState().pagination.pageSize}
                                                        />
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

                                            {/* Info de la página actual */}
                                            <div className="flex w-fit items-center justify-center text-sm font-medium">
                                                Página {table.getState().pagination.pageIndex + 1} de{" "}
                                                {table.getPageCount()}
                                            </div>

                                            {/* Botones de navegación */}
                                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                                <Button
                                                    variant="outline"
                                                    className="hidden h-8 w-8 p-0 lg:flex"
                                                    onClick={() => table.setPageIndex(0)}
                                                    disabled={!table.getCanPreviousPage()}
                                                >
                                                    <span className="sr-only">Ir a la primera página</span>
                                                    <IconChevronsLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="size-8"
                                                    size="icon"
                                                    onClick={() => table.previousPage()}
                                                    disabled={!table.getCanPreviousPage()}
                                                >
                                                    <span className="sr-only">Ir a la página anterior</span>
                                                    <IconChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="size-8"
                                                    size="icon"
                                                    onClick={() => table.nextPage()}
                                                    disabled={!table.getCanNextPage()}
                                                >
                                                    <span className="sr-only">Ir a la página siguiente</span>
                                                    <IconChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="hidden size-8 lg:flex"
                                                    size="icon"
                                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                                    disabled={!table.getCanNextPage()}
                                                >
                                                    <span className="sr-only">Ir a la última página</span>
                                                    <IconChevronsRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCustomer(undefined);
                }}
                customer={selectedCustomer}
                documentTypes={documentTypes}
                onSuccess={handleModalSuccess}
            />
        </AppSidebarLayout>
    );
}