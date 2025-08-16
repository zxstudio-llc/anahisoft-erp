import AppLayout from "@/layouts/app-layout"
import { Head, Link } from "@inertiajs/react"
import { PageForm } from "./partial/form"
import { PageProps } from "@/types"
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'json';
  required: boolean;
  description: string;
}

interface TemplateConfig {
  fields: TemplateField[];
}

export default function Edit({
  page,
  templates,
  templateConfigs
}: {
  page: any;
  templates?: Record<string, string>;
  templateConfigs?: Record<string, TemplateConfig>;
}) {
  return (
    <AppLayout>
      <Head title={`Editar página: ${page.title}`} />
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Editar pagina</h2>
            <p className="text-gray-600 mt-1">{page.title}</p>
          </div>

          <div className="flex flex-col">
          <Button asChild>
              <Link href={route('admin.pages.index')}>
                <Plus className="mr-2 h-4 w-4" />
                Cancelar
              </Link>
            </Button>
            {templates && (
              <div className="text-sm text-gray-500 text-wrap">
                Template: <span className="font-medium">{templates[page.template] || page.template}</span>
              </div>
            )}
          </div>
        </div>
        <PageForm
          page={page}
          templates={templates}
          templateConfigs={templateConfigs}
        />
      </div>
    </AppLayout>
  );
}