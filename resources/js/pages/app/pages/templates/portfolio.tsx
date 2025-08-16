import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Project {
  title: string;
  description: string;
  image?: string;
  url?: string;
  technologies?: string[];
}

export default function PortfolioConfig({ page, seo }: PageProps<{ page: any, seo: any }>) {
  const templateData = page.template_data || {};
  const projects: Project[] = templateData.projects || [];
  
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
        
        {/* Grid de proyectos */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden">
                {project.image && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div 
                    className="prose prose-sm max-w-none" 
                    dangerouslySetInnerHTML={{ __html: project.description }} 
                  />
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span 
                          key={techIndex}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {project.url && (
                    <div className="pt-2">
                      <Button asChild size="sm" className="w-full">
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          Ver Proyecto
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No hay proyectos configurados. Agrega proyectos en la configuración del template.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}