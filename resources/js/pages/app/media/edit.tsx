import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@inertiajs/react";

interface MediaEditProps {
  media: {
    id: number;
    name: string;
    original_url: string;
    url?: string;
    custom_properties: Record<string, unknown>;
  };
}

export default function MediaEdit({ media }: MediaEditProps) {
  return (
    <AppLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2">
                  <img
                    src={media.original_url || media.url}
                    className="w-full h-auto rounded shadow"
                    alt={media.name}
                  />
                </div>

                <div className="w-full md:w-1/2">
                  <form>
                    <div className="mb-4">
                      <Label className="block text-gray-700 mb-2">Name</Label>
                      <Input
                        defaultValue={media.name}
                        type="text"
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>

                    <div className="mb-4">
                      <Label className="block text-gray-700 mb-2">
                        Description
                      </Label>
                      <Textarea
                        defaultValue={
                          media.custom_properties.description
                            ? String(media.custom_properties.description)
                            : ""
                        }
                        className="w-full px-3 py-2 border rounded"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Link
                        href="/admin/media"
                        className="btn btn-secondary"
                      >
                        Cancel
                      </Link>
                      <Button type="submit" className="btn btn-primary">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}