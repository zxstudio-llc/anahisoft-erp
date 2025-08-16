import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';
import { Code } from 'lucide-react';

export default function ApiDocs() {
    const breadcrumbs = [
        { title: 'Inicio', href: '/' },
        { title: 'API Keys', href: '/api-keys' },
        { title: 'Documentación API', href: '/api-keys/docs' },
    ];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentación API" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold">Documentación API</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Introducción</CardTitle>
                        <CardDescription>
                            Esta API te permite interactuar con tu sistema Fact desde aplicaciones externas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            Para usar la API, necesitas crear una API Key desde la sección de API Keys. Todas las solicitudes
                            deben incluir tu API Key en el encabezado de autorización.
                        </p>

                        <div className="rounded-md bg-muted p-4">
                            <p className="font-mono text-sm">
                                Authorization: Bearer tu_api_key
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Clientes</CardTitle>
                        <CardDescription>
                            Endpoints para gestionar clientes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                GET /api/clients
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Obtiene una lista paginada de clientes.
                            </p>
                            <h4 className="mt-2 font-semibold">Parámetros de consulta:</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm">
                                <li><span className="font-mono">search</span>: Buscar por nombre, documento o email</li>
                                <li><span className="font-mono">document_type</span>: Filtrar por tipo de documento</li>
                                <li><span className="font-mono">sort_field</span>: Campo para ordenar</li>
                                <li><span className="font-mono">sort_order</span>: Orden (asc/desc)</li>
                                <li><span className="font-mono">per_page</span>: Resultados por página</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                GET /api/clients/{'{id}'}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Obtiene los detalles de un cliente específico.
                            </p>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                POST /api/clients
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Crea un nuevo cliente.
                            </p>
                            <h4 className="mt-2 font-semibold">Campos requeridos:</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm">
                                <li><span className="font-mono">name</span>: Nombre del cliente</li>
                                <li><span className="font-mono">document_type</span>: Tipo de documento</li>
                                <li><span className="font-mono">document_number</span>: Número de documento</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                PUT /api/clients/{'{id}'}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Actualiza un cliente existente.
                            </p>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                DELETE /api/clients/{'{id}'}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Marca un cliente como inactivo.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Productos</CardTitle>
                        <CardDescription>
                            Endpoints para gestionar productos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                GET /api/products
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Obtiene una lista paginada de productos.
                            </p>
                            <h4 className="mt-2 font-semibold">Parámetros de consulta:</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm">
                                <li><span className="font-mono">search</span>: Buscar por nombre, código o barcode</li>
                                <li><span className="font-mono">category_id</span>: Filtrar por categoría</li>
                                <li><span className="font-mono">sort_field</span>: Campo para ordenar</li>
                                <li><span className="font-mono">sort_order</span>: Orden (asc/desc)</li>
                                <li><span className="font-mono">per_page</span>: Resultados por página</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                GET /api/products/{'{id}'}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Obtiene los detalles de un producto específico.
                            </p>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                POST /api/products
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Crea un nuevo producto.
                            </p>
                            <h4 className="mt-2 font-semibold">Campos requeridos:</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm">
                                <li><span className="font-mono">code</span>: Código del producto</li>
                                <li><span className="font-mono">name</span>: Nombre del producto</li>
                                <li><span className="font-mono">price</span>: Precio</li>
                                <li><span className="font-mono">stock</span>: Stock</li>
                                <li><span className="font-mono">unit_type</span>: Tipo de unidad</li>
                                <li><span className="font-mono">currency</span>: Moneda</li>
                                <li><span className="font-mono">igv_type</span>: Tipo de IGV</li>
                                <li><span className="font-mono">igv_percentage</span>: Porcentaje de IGV</li>
                                <li><span className="font-mono">has_igv</span>: Si el precio incluye IGV</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Categorías</CardTitle>
                        <CardDescription>
                            Endpoints para gestionar categorías
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                GET /api/categories
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Obtiene una lista paginada de categorías.
                            </p>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                GET /api/categories/{'{id}'}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Obtiene los detalles de una categoría específica.
                            </p>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                POST /api/categories
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Crea una nueva categoría.
                            </p>
                            <h4 className="mt-2 font-semibold">Campos requeridos:</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm">
                                <li><span className="font-mono">name</span>: Nombre de la categoría</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Validación de Documentos</CardTitle>
                        <CardDescription>
                            Endpoint para validar documentos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Code className="h-5 w-5" />
                                POST /api/validate-document
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Valida un documento (DNI o RUC).
                            </p>
                            <h4 className="mt-2 font-semibold">Campos requeridos:</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm">
                                <li><span className="font-mono">document_type</span>: Tipo de documento (01 para DNI, 06 para RUC)</li>
                                <li><span className="font-mono">document_number</span>: Número de documento</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
} 