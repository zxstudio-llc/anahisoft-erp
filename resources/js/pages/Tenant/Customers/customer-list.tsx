"use client"

import { useState } from "react"
import { Plus, Search, Mail, Phone, MapPin, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  totalInvoices: number
  totalAmount: number
  status: "active" | "inactive"
  avatar?: string
}

interface CustomerListProps {
  customers?: Customer[]
}

export default function CustomerList({
  customers = [
    {
      id: "1",
      name: "John Smith",
      email: "john@acme.com",
      phone: "+1 (555) 123-4567",
      company: "Acme Corp",
      address: "123 Business St, NY 10001",
      totalInvoices: 12,
      totalAmount: 15600.0,
      status: "active",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@techsolutions.com",
      phone: "+1 (555) 987-6543",
      company: "Tech Solutions",
      address: "456 Tech Ave, CA 90210",
      totalInvoices: 8,
      totalAmount: 9800.0,
      status: "active",
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike@global.com",
      phone: "+1 (555) 456-7890",
      company: "Global Industries",
      address: "789 Global Blvd, TX 75001",
      totalInvoices: 15,
      totalAmount: 22400.0,
      status: "inactive",
    },
  ],
}: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>All Customers</CardTitle>
                <CardDescription>A list of all customers in your account</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Customer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.company}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="mr-2 h-4 w-4" />
                      {customer.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      {customer.phone}
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{customer.address}</span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Invoices:</span>
                        <span className="font-medium">{customer.totalInvoices}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium">${customer.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No customers found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
