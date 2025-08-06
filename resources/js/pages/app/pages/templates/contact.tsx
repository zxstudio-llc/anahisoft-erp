import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

export default function ContactConfig({ page, seo }: PageProps<{ page: any, seo: any }>) {
  const templateData = page.template_data || {};
  
  return (
    <AppLayout>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.image && <meta property="og:image" content={seo.image} />}
      </Head>
      
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">{page.title}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Información de Contacto</h2>
            
            <div className="space-y-4">
              {templateData.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Dirección</h3>
                    <p className="text-gray-600">{templateData.address}</p>
                  </div>
                </div>
              )}
              
              {templateData.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Teléfono</h3>
                    <a href={`tel:${templateData.phone}`} className="text-primary hover:underline">
                      {templateData.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {templateData.email && (
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <a href={`mailto:${templateData.email}`} className="text-primary hover:underline">
                      {templateData.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Contenido adicional */}
            {(templateData.content || page.content) && (
              <div className="mt-8">
                <div 
                  className="prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ 
                    __html: templateData.content || page.content 
                  }} 
                />
              </div>
            )}
          </div>
          
          {/* Mapa */}
          <div>
            {templateData.map_embed ? (
              <div className="h-96 rounded-lg overflow-hidden">
                <div 
                  dangerouslySetInnerHTML={{ __html: templateData.map_embed }}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent>
                  <p className="text-gray-500 text-center">
                    Agrega un código de mapa en la configuración del template
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}