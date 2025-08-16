import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { DataTableNews } from '@/components/app/dataTable/news/data-table-news'
import { newsColumns } from '@/components/app/dataTable/news/news-card-columns'
import { newsSchema } from '@/data/newsSchema'
import { z } from 'zod'
import { BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Noticias', href: '/admin/news' }
]

export default function Index({ news }: { news: any }) {
  // Parsear los datos con el schema
  const parsedNews = z.array(newsSchema).parse(news.data)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Noticias" />
      
      <div className="flex-1 space-y-4 p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Noticias</h2>
            <p className="text-muted-foreground">
              Administra todas las noticias desde aquí
            </p>
          </div>
          <Link 
            href="/admin/news/create"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Crear Noticia
          </Link>
        </div>

        <DataTableNews 
          columns={newsColumns()} 
          data={parsedNews} 
          filterKey="title"
        />
      </div>
    </AppLayout>
  )
}