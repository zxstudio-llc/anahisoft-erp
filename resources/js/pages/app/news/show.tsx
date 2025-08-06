import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, News } from '@/types';

const breadcrumbs = (title: string): BreadcrumbItem[] => [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Noticias', href: '/admin/news' },
  { title, href: '#' },
];

export default function Show({ news }: { news: News }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs(news.title)}>
      <Head title={`Noticia: ${news.title}`} />

      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">{news.title}</h1>
        <p className="text-sm text-muted-foreground">Publicado el {new Date(news.published_at).toLocaleString()}</p>

        {news.image_url && (
          <img
            src={news.image_url}
            alt={news.title}
            className="rounded-xl w-full max-w-3xl object-cover"
          />
        )}

        <div className="prose dark:prose-invert max-w-3xl">
          <div dangerouslySetInnerHTML={{ __html: news.content }} />
        </div>
      </div>
    </AppLayout>
  );
}
