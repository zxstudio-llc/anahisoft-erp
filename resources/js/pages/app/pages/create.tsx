import AppLayout from "@/layouts/app-layout"
import { Head, Link } from "@inertiajs/react"
import { PageForm } from "./partial/form"
import { Button } from "@/components/ui/button";

export default function Create() {
  return (
    <AppLayout>
      <Head title="Crear nueva página" />

      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Crear nueva página</h2>
            <p className="text-muted-foreground">
            Selecciona un template y configura el contenido específico
            </p>
          </div>

          <Button asChild>
            <Link href={route('admin.pages.index')}>
              {/* <Plus className="mr-2 h-4 w-4" /> */}
              Volver
            </Link>
          </Button>
        </div>
        <PageForm />
      </div>
    </AppLayout>
  );
}