"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "./data-table"
import { Badge } from "@/components/ui/badge"
import { invoiceColumns } from "./columns-invoices"
import { clientColumns } from "./columns-clients"
import { productColumns } from "./columns-products"
import { Invoice } from "@/common/interfaces/tenant/invoices.interface"
import { CustomerLight } from "@/common/interfaces/tenant/customers.interface"
import { ProductLight } from "@/common/interfaces/tenant/products.interface"

export default function RecentActivity({
  invoices,
  customers,
  products,
}: {
  invoices: Invoice[]
  customers: CustomerLight[]
  products: ProductLight[]
}) {
  return (
    <Tabs defaultValue="invoices" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="invoices">
            Facturas <Badge variant="secondary">{invoices.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="clients">
            Clientes <Badge variant="secondary">{customers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="products">
            Productos <Badge variant="secondary">{products.length}</Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="invoices" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <DataTable columns={invoiceColumns} data={invoices} />
      </TabsContent>

      <TabsContent value="clients" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <DataTable columns={clientColumns} data={customers} />
      </TabsContent>

      <TabsContent value="products" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <DataTable columns={productColumns} data={products} />
      </TabsContent>
    </Tabs>
  )
}
