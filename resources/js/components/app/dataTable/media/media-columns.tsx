import { ColumnDef } from "@tanstack/react-table";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Media } from "@/data/mediaSchema";
import { formatFileSize, formatDateSmart } from "@/lib/utils";

export const mediaColumns: ColumnDef<Media>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.mime_type.startsWith('image/') && (
          <img 
            src={row.original.url} 
            alt={row.original.name}
            className="h-10 w-10 object-cover rounded"
          />
        )}
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "mime_type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.mime_type}
      </Badge>
    ),
  },
  {
    accessorKey: "size",
    header: "Tamaño",
    cell: ({ row }) => {
      const sizeInMB = (row.original.size / (1024 * 1024)).toFixed(2);
      return `${sizeInMB} MB`;
    },
  },
  {
    accessorKey: "created_at",
    header: "Subido",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/media/${row.original.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (confirm('¿Estás seguro de eliminar este medio?')) {
              router.delete(`/admin/media/${row.original.id}`);
            }
          }}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
  },
];