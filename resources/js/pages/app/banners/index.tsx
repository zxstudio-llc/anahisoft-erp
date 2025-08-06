import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem, PageProps } from '@/types'
import { DataTableBanner } from '@/components/app/dataTable/banner/data-table-banner'
import { bannerColumns } from '@/components/app/dataTable/banner/banner-card-columns'
import { bannerSchema } from '@/data/bannerSchema'
import { z } from 'zod'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Banners', href: '/admin/banners' }
]

export default function Index({ banners }: PageProps<{ banners: any }>) {
  const parsedBanners = z.array(bannerSchema).parse(banners.data)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Banners" />
      
      <div className="flex-1 space-y-4 p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Banners</h2>
            <p className="text-muted-foreground">
              Administra todos los banners desde aquí
            </p>
          </div>
          <a 
            href={route('admin.banners.create')}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Crear Banner
          </a>
        </div>

        <DataTableBanner 
          columns={bannerColumns()} 
          data={parsedBanners} 
          filterKey="title"
        />
      </div>
    </AppLayout>
  )
}