import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DefaultConfig({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <Label htmlFor="content">Contenido Principal</Label>
      <Textarea
        id="content"
        value={data.content || ''}
        onChange={(e) => onChange({ ...data, content: e.target.value })}
        placeholder="Ingresa el contenido de la página..."
        rows={10}
      />
    </div>
  );
}