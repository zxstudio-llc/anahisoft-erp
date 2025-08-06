"use client"

import { useState } from "react"
import { Users, DollarSign, TrendingUp, Calendar, Phone, Mail, Plus, Eye, Edit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head } from "@inertiajs/react"

interface Lead {
  id: string
  company: string
  contact: string
  email: string
  phone: string
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
  value: number
  probability: number
  source: string
  assignedTo: string
  lastActivity: string
  nextActivity: string
  createdDate: string
  expectedCloseDate: string
}

interface SalesPipelineProps {
  leads?: Lead[]
}

export default function SalesPipeline({
  leads = [
    {
      id: "LEAD-001",
      company: "Acme Corporation",
      contact: "John Smith",
      email: "john@acme.com",
      phone: "+1-555-0123",
      stage: "negotiation",
      value: 50000,
      probability: 75,
      source: "Website",
      assignedTo: "Sarah Johnson",
      lastActivity: "2024-01-15",
      nextActivity: "2024-01-18",
      createdDate: "2024-01-01",
      expectedCloseDate: "2024-01-25",
    },
    {
      id: "LEAD-002",
      company: "Tech Solutions Inc",
      contact: "Emily Davis",
      email: "emily@techsolutions.com",
      phone: "+1-555-0124",
      stage: "proposal",
      value: 35000,
      probability: 60,
      source: "Referral",
      assignedTo: "Mike Wilson",
      lastActivity: "2024-01-14",
      nextActivity: "2024-01-17",
      createdDate: "2024-01-05",
      expectedCloseDate: "2024-01-30",
    },
    {
      id: "LEAD-003",
      company: "Global Industries",
      contact: "Robert Brown",
      email: "robert@global.com",
      phone: "+1-555-0125",
      stage: "qualified",
      value: 75000,
      probability: 40,
      source: "Cold Call",
      assignedTo: "Lisa Chen",
      lastActivity: "2024-01-13",
      nextActivity: "2024-01-16",
      createdDate: "2024-01-08",
      expectedCloseDate: "2024-02-15",
    },
    {
      id: "LEAD-004",
      company: "StartupXYZ",
      contact: "Anna Wilson",
      email: "anna@startupxyz.com",
      phone: "+1-555-0126",
      stage: "closed-won",
      value: 25000,
      probability: 100,
      source: "LinkedIn",
      assignedTo: "David Kim",
      lastActivity: "2024-01-12",
      nextActivity: "",
      createdDate: "2024-01-02",
      expectedCloseDate: "2024-01-15",
    },
    {
      id: "LEAD-005",
      company: "Enterprise Corp",
      contact: "Michael Johnson",
      email: "michael@enterprise.com",
      phone: "+1-555-0127",
      stage: "lead",
      value: 100000,
      probability: 20,
      source: "Trade Show",
      assignedTo: "Sarah Johnson",
      lastActivity: "2024-01-11",
      nextActivity: "2024-01-19",
      createdDate: "2024-01-10",
      expectedCloseDate: "2024-03-01",
    },
  ],
}: SalesPipelineProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStage, setSelectedStage] = useState("all")
  const [selectedAssignee, setSelectedAssignee] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "lead":
        return "bg-gray-100 text-gray-800"
      case "qualified":
        return "bg-blue-100 text-blue-800"
      case "proposal":
        return "bg-yellow-100 text-yellow-800"
      case "negotiation":
        return "bg-orange-100 text-orange-800"
      case "closed-won":
        return "bg-green-100 text-green-800"
      case "closed-lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStage = selectedStage === "all" || lead.stage === selectedStage
    const matchesAssignee = selectedAssignee === "all" || lead.assignedTo === selectedAssignee

    return matchesSearch && matchesStage && matchesAssignee
  })

  const stageCounts = {
    lead: leads.filter((l) => l.stage === "lead").length,
    qualified: leads.filter((l) => l.stage === "qualified").length,
    proposal: leads.filter((l) => l.stage === "proposal").length,
    negotiation: leads.filter((l) => l.stage === "negotiation").length,
    closedWon: leads.filter((l) => l.stage === "closed-won").length,
  }

  const totalValue = filteredLeads.reduce((sum, lead) => sum + lead.value, 0)
  const weightedValue = filteredLeads.reduce((sum, lead) => sum + (lead.value * lead.probability) / 100, 0)

  const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Canal de ventas',
        href: '/crm/sales-pipeline',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Canal de ventas" />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Pipeline</h1>
              <p className="text-gray-600">Track leads and manage your sales opportunities</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                  <DialogDescription>Create a new sales lead in your pipeline</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input placeholder="Company name" />
                    </div>
                    <div>
                      <Label htmlFor="contact">Contact Person</Label>
                      <Input placeholder="Contact name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input type="email" placeholder="contact@company.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input placeholder="+1-555-0123" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="value">Deal Value</Label>
                      <Input type="number" placeholder="50000" />
                    </div>
                    <div>
                      <Label htmlFor="source">Lead Source</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="cold-call">Cold Call</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="trade-show">Trade Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea placeholder="Lead notes and details..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>Add Lead</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Pipeline Summary */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
              <p className="text-xs text-muted-foreground">Active opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stageCounts.qualified}</div>
              <p className="text-xs text-muted-foreground">Ready for proposal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Negotiation</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stageCounts.negotiation}</div>
              <p className="text-xs text-muted-foreground">Close to winning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stageCounts.closedWon}</div>
              <p className="text-xs text-muted-foreground">Successfully closed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total opportunity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(weightedValue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Expected revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search leads, companies, or contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Pipeline Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                  <SelectItem value="closed-lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Assigned To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="Mike Wilson">Mike Wilson</SelectItem>
                  <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                  <SelectItem value="David Kim">David Kim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
            <CardDescription>Manage your sales opportunities and track progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Next Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.company}</div>
                          <div className="text-sm text-gray-500">{lead.source}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.contact}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStageColor(lead.stage)}>
                          {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1).replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">${lead.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{lead.probability}%</span>
                          </div>
                          <Progress value={lead.probability} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{lead.assignedTo}</TableCell>
                      <TableCell>
                        {lead.nextActivity ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(lead.nextActivity).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">No activity</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppLayout>
  )
}
