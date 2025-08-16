"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Database, RefreshCw, ExternalLink, Settings, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout"

interface PowerBIReport {
  id: string
  name: string
  description: string
  category: "financial" | "sales" | "inventory" | "hr" | "operations"
  lastUpdated: string
  status: "active" | "inactive" | "error"
  embedUrl: string
  dataSource: string[]
  refreshFrequency: "realtime" | "hourly" | "daily" | "weekly"
}

interface PowerBIIntegrationProps {
  reports?: PowerBIReport[]
  connectionStatus?: "connected" | "disconnected" | "error"
}

export default function PowerBiSales({
  reports = [
    {
      id: "rpt-001",
      name: "Financial Dashboard",
      description: "Complete financial overview with P&L, cash flow, and budget analysis",
      category: "financial",
      lastUpdated: "2024-01-15T10:30:00Z",
      status: "active",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=financial-dashboard",
      dataSource: ["Accounting", "Banking", "Invoices"],
      refreshFrequency: "hourly",
    },
    {
      id: "rpt-002",
      name: "Sales Performance",
      description: "Sales metrics, pipeline analysis, and customer insights",
      category: "sales",
      lastUpdated: "2024-01-15T09:15:00Z",
      status: "active",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=sales-performance",
      dataSource: ["CRM", "Invoices", "Customers"],
      refreshFrequency: "realtime",
    },
    {
      id: "rpt-003",
      name: "Inventory Analytics",
      description: "Stock levels, movement analysis, and procurement insights",
      category: "inventory",
      lastUpdated: "2024-01-15T08:45:00Z",
      status: "active",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=inventory-analytics",
      dataSource: ["Inventory", "Warehouse", "Purchase Orders"],
      refreshFrequency: "daily",
    },
    {
      id: "rpt-004",
      name: "HR Analytics",
      description: "Employee metrics, performance tracking, and workforce analysis",
      category: "hr",
      lastUpdated: "2024-01-14T16:20:00Z",
      status: "active",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=hr-analytics",
      dataSource: ["Employees", "Payroll", "Performance"],
      refreshFrequency: "weekly",
    },
    {
      id: "rpt-005",
      name: "Operations Dashboard",
      description: "Operational KPIs, process efficiency, and resource utilization",
      category: "operations",
      lastUpdated: "2024-01-15T07:30:00Z",
      status: "error",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=operations-dashboard",
      dataSource: ["Manufacturing", "Quality", "Maintenance"],
      refreshFrequency: "hourly",
    },
  ],
  connectionStatus = "connected",
}: PowerBIIntegrationProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<PowerBIReport | null>(null)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "financial":
        return "bg-green-100 text-green-800"
      case "sales":
        return "bg-blue-100 text-blue-800"
      case "inventory":
        return "bg-purple-100 text-purple-800"
      case "hr":
        return "bg-orange-100 text-orange-800"
      case "operations":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800"
      case "disconnected":
        return "bg-gray-100 text-gray-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  const activeReports = reports.filter((r) => r.status === "active").length
  const errorReports = reports.filter((r) => r.status === "error").length

  const breadcrumbs = [
    { title: 'Inicio', href: '/' },
    { title: 'Power BI', href: '/bi' },
    { title: 'Ventas', href: '/bi/ventas' },
];

if (error) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="p-4 text-center text-red-500">{error}</div>
        </AppSidebarLayout>
    );
}

return (
    <AppSidebarLayout breadcrumbs={breadcrumbs}>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Power BI Integration</h1>
              <p className="text-gray-600">Business Intelligence dashboards and analytics</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Power BI Configuration</DialogTitle>
                    <DialogDescription>Configure your Power BI connection settings</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="workspace-id">Workspace ID</Label>
                      <Input id="workspace-id" placeholder="Enter Power BI Workspace ID" />
                    </div>
                    <div>
                      <Label htmlFor="client-id">Client ID</Label>
                      <Input id="client-id" placeholder="Enter Azure App Client ID" />
                    </div>
                    <div>
                      <Label htmlFor="client-secret">Client Secret</Label>
                      <Input id="client-secret" type="password" placeholder="Enter Client Secret" />
                    </div>
                    <div>
                      <Label htmlFor="tenant-id">Tenant ID</Label>
                      <Input id="tenant-id" placeholder="Enter Azure Tenant ID" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsConfigDialogOpen(false)}>Save Configuration</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateReportOpen} onOpenChange={setIsCreateReportOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Create Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Report</DialogTitle>
                    <DialogDescription>Create a new Power BI report integration</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="report-name">Report Name</Label>
                      <Input id="report-name" placeholder="Enter report name" />
                    </div>
                    <div>
                      <Label htmlFor="report-description">Description</Label>
                      <Textarea id="report-description" placeholder="Describe the report purpose" />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="inventory">Inventory</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="refresh-frequency">Refresh Frequency</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select refresh frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateReportOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsCreateReportOpen(false)}>Create Report</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className={getConnectionStatusColor(connectionStatus)}>
                  {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {connectionStatus === "connected"
                    ? "Successfully connected to Power BI Service"
                    : connectionStatus === "error"
                      ? "Connection error - check configuration"
                      : "Not connected to Power BI Service"}
                </span>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">Configured reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeReports}</div>
              <p className="text-xs text-muted-foreground">Running successfully</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Reports</CardTitle>
              <ExternalLink className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorReports}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Connected sources</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Power BI Reports</CardTitle>
            <CardDescription>Manage your integrated Power BI reports and dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Data Sources</TableHead>
                    <TableHead>Refresh</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(report.category)}>
                          {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {report.dataSource.slice(0, 2).join(", ")}
                          {report.dataSource.length > 2 && ` +${report.dataSource.length - 2} more`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.refreshFrequency.charAt(0).toUpperCase() + report.refreshFrequency.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatLastUpdated(report.lastUpdated)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => window.open(report.embedUrl, "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
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

        {/* Report Preview */}
        {selectedReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedReport.name} - Preview</span>
                <Button variant="outline" onClick={() => window.open(selectedReport.embedUrl, "_blank")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in Power BI
                </Button>
              </CardTitle>
              <CardDescription>{selectedReport.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Power BI Report Embed</p>
                  <p className="text-sm text-gray-400">This would show the embedded Power BI report in production</p>
                  <Button className="mt-4" onClick={() => window.open(selectedReport.embedUrl, "_blank")}>
                    View Full Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AppSidebarLayout>
  )
}
