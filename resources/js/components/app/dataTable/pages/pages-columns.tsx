import { ColumnDef } from "@tanstack/react-table";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const pagesColumns: ColumnDef<any>[] = [
  {
    accessorKey: "title",
    header: "Título",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "template",
    header: "Plantilla",
    cell: ({ row }) => {
      const templates = {
        default: "Por defecto",
        landing: "Landing",
        about: "Acerca de Nosotros",
        contact: "Contáctanos",
        services: "Servicios",
        portfolio: "Portafolio",
      };
      
      return templates[row.original.template as keyof typeof templates] || row.original.template;
    }
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Activa" : "Inactiva"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/pages/${row.original.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (confirm('¿Estás seguro de eliminar esta página?')) {
              router.delete(`/admin/pages/${row.original.id}`);
            }
          }}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
  },
];