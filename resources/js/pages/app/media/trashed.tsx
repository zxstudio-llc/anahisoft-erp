import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MediaCard from "@/components/app/dataTable/media/media-card";
import { Link } from "@inertiajs/react";

interface TrashedMediaProps {
  trashedMedia: {
    data: Array<{
      id: number;
      name: string;
      original_url: string;
      url?: string;
      size: number;
      created_at: string;
    }>;
  };
  filters: {
    search?: string;
  };
}

export default function TrashedMedia({ trashedMedia, filters }: TrashedMediaProps) {
  return (
    <AppLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="mb-6 flex justify-between items-center">
                <Link
                  href="/admin/media"
                  className="btn btn-secondary"
                >
                  Back to Media Library
                </Link>

                <div className="flex gap-2">
                  <Input
                    defaultValue={filters.search}
                    type="text"
                    placeholder="Search..."
                    className="px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {trashedMedia.data.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    trashed
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}