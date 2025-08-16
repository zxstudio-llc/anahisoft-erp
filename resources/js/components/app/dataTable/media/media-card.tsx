"use client";

import { Button } from "@/components/ui/button";

interface MediaCardProps {
  item: {
    id: number;
    name?: string;
    file_name: string;
    original_url: string;
    url?: string;
    size: number;
    created_at: string;
  };
  trashed?: boolean;
}

export default function MediaCard({ item, trashed = false }: MediaCardProps) {
  return (
    <div className="border rounded overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative group">
        <img
          src={item.original_url || item.url}
          className="w-full h-40 object-cover"
          alt={item.name || item.file_name}
        />

        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {!trashed && (
            <>
              <Button variant="ghost" size="icon">
                <i className="fas fa-edit text-white" />
              </Button>
              <Button variant="ghost" size="icon">
                <i className="fas fa-trash text-white" />
              </Button>
            </>
          )}

          {trashed && (
            <>
              <Button variant="ghost" size="icon">
                <i className="fas fa-trash-restore text-white" />
              </Button>
              <Button variant="ghost" size="icon">
                <i className="fas fa-times-circle text-white" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="p-2 text-xs break-words">
        <p className="font-medium">{item.name || item.file_name}</p>
        <p className="text-gray-500">{(item.size / 1024).toFixed(1)} KB</p>
        <p className="text-gray-400 text-xs mt-1">
          {new Date(item.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}