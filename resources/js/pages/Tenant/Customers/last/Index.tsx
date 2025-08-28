import { Head, router } from "@inertiajs/react"
import { CustomersDataTable, Customer } from "./partials/CustomersDataTable"
import AppLayout from "@/layouts/app-layout"

interface PaginatedCustomers {
    data: Customer[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
}

interface CustomersIndexProps {
    customers: PaginatedCustomers
}

export default function Index({ customers }: CustomersIndexProps) {
    const handleView = (customer: Customer) => {
        router.get(`/customers/${customer.id}`)
    }

    const handleEdit = (customer: Customer) => {
        router.get(`/customers/${customer.id}/edit`)
    }

    const handleDelete = (customer: Customer) => {
        if (confirm('¿Eliminar cliente?')) {
            router.delete(`/customers/${customer.id}`)
        }
    }

    const handleCreate = () => {
        router.get('/customers/create')
    }

    return (
        <AppLayout>
            <Head title="Clientes" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Clientes</h1>
                </div>
                <CustomersDataTable
                    data={customers.data}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={handleCreate}
                />
            </div>
        </AppLayout>
    )
}