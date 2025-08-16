import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Service {
  title: string;
  description: string;
  image?: string;
  icon?: string;
}

export default function ServicesConfig({ page, seo }: PageProps<{ page: any, seo: any }>) {
  const templateData = page.template_data || {};
  const services: Service[] = templateData.services_list || [];
  
  return (
    <AppLayout>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.image && <meta property="og:image" content={seo.image} />}
      </Head>
      
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">{page.title}</h1>
        
        {/* Contenido introductorio */}
        {(templateData.content || page.content) && (
          <div className="max-w-4xl mx-auto mb-12">
            <div 
              className="prose prose-lg max-w-none text-center" 
              dangerouslySetInnerHTML={{ 
                __html: templateData.content || page.content 
              }} 
            />
          </div>
        )}
        
        {/* Grid de servicios */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                {service.image && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl text-center">
                    {service.icon && (
                      <span className="text-2xl mr-2">{service.icon}</span>
                    )}
                    {service.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none text-center" 
                    dangerouslySetInnerHTML={{ __html: service.description }} 
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No hay servicios configurados. Agrega servicios en la configuración del template.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}