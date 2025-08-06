import React from 'react';
import { TemplateComponentProps } from "@/types/templates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutConfig({ data, onChange, errors }: TemplateComponentProps) {
  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Corporativa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_image">Imagen de la Empresa</Label>
            <Input
              id="company_image"
              value={data.company_image || ''}
              onChange={(e) => updateField('company_image', e.target.value)}
              placeholder="URL de la imagen de la empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">Misión</Label>
            <Textarea
              id="mission"
              value={data.mission || ''}
              onChange={(e) => updateField('mission', e.target.value)}
              placeholder="Nuestra misión es..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision">Visión</Label>
            <Textarea
              id="vision"
              value={data.vision || ''}
              onChange={(e) => updateField('vision', e.target.value)}
              placeholder="Nuestra visión es..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="values">Valores</Label>
            <Textarea
              id="values"
              value={data.values || ''}
              onChange={(e) => updateField('values', e.target.value)}
              placeholder="Nuestros valores son..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}