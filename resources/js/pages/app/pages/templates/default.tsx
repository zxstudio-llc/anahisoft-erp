import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";

export default function DefaultConfig({ page, seo }: PageProps<{ page: any, seo: any }>) {
  return (
    <AppLayout>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.image && <meta property="og:image" content={seo.image} />}
      </Head>
      
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
        <div 
          className="prose max-w-none" 
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>
    </AppLayout>
  );
}