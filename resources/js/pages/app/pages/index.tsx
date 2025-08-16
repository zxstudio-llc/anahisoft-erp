import { DataTablePage } from "@/components/app/dataTable/pages/data-table-pages";
import { pagesColumns } from "@/components/app/dataTable/pages/pages-columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Paginas', href: '/admin/pages' }
]

export default function Index({ pages, templates }: PageProps<{ pages: any, templates: any }>) {
  return (
    <AppLayout>
      <Head title="Gestión de páginas" />

      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Todos las pagina</h2>
            <p className="text-muted-foreground">
              Lista completa de paginas
            </p>
          </div>

          <Button asChild>
            <Link href={route('admin.pages.create')}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva página
            </Link>
          </Button>
        </div>

        <DataTablePage
          columns={pagesColumns}
          data={pages.data}
          total={pages.total}
          searchKey="title"
        />
      </div>
    </AppLayout>
  );
}