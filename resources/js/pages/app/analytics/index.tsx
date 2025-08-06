import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { TrendingUp, TrendingDown, Eye, Users, Clock, Globe, Search, MousePointer, ArrowUpRight, AlertCircle, Link, Layout, Smartphone, Monitor, Tablet, Zap, Gauge, FileSearch, ExternalLink } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { type AnalyticsData } from '@/types/analytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Analíticas', href: '/admin/analytics' }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'] as const;

const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }: MetricCardProps) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    orange: "text-orange-600 bg-orange-100",
    purple: "text-purple-600 bg-purple-100",
    red: "text-red-600 bg-red-100",
  }[color];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-2 leading-tight">
          {title}
        </CardTitle>
        <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${colorClasses}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-grow flex flex-col justify-end">
        <div className="text-2xl font-bold truncate">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
            {change > 0 ? <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" /> : <TrendingDown className="h-3 w-3 mr-1 flex-shrink-0" />}
            <span className="truncate">{Math.abs(change)}% vs período anterior</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const DeviceIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

export default function SEOAnalyticsDashboard() {
  const { props } = usePage();
  const {
    viewsByUrl = [],
    viewsByDay = [],
    trafficSources = [],
    topKeywords = [],
    deviceStats = [],
    bounceRate = 0,
    avgTimeOnPage = 0,
    conversionRate = 0,
    topCountriesTraffic = [],
    coreWebVitals = [],
    seoErrors = [],
    period = '7d',
    currentStats = {
      totalVisits: 0,
      uniqueVisitors: 0,
      bounceRate: 0,
      avgTimeOnPage: 0
    },
    previousStats = {
      totalVisits: 0,
      uniqueVisitors: 0,
      bounceRate: 0,
      avgTimeOnPage: 0
    }
  } = props as unknown as AnalyticsData;

  const calculateChange = (current: number, previous: number, invert = false): number => {
    if (previous === 0) return 0;
    const change = ((current - previous) / previous) * 100;
    return invert ? -change : change;
  };

  const changes = {
    totalVisits: calculateChange(currentStats.totalVisits, previousStats.totalVisits),
    uniqueVisitors: calculateChange(currentStats.uniqueVisitors, previousStats.uniqueVisitors),
    bounceRate: calculateChange(currentStats.bounceRate, previousStats.bounceRate, true),
    avgTimeOnPage: calculateChange(currentStats.avgTimeOnPage, previousStats.avgTimeOnPage)
  };

  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [activeTab, setActiveTab] = useState('overview');

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    router.visit(`/admin/analytics?period=${newPeriod}`, {
      preserveState: true,
      only: [
        'viewsByUrl', 
        'viewsByDay', 
        'trafficSources',
        'topKeywords',
        'deviceStats',
        'bounceRate',
        'avgTimeOnPage',
        'conversionRate',
        'topCountriesTraffic',
        'coreWebVitals',
        'seoErrors'
      ]
    });
  };

  const totalVisits = viewsByDay.reduce((sum: number, day: any) => sum + day.total, 0);
  const totalUniqueVisitors = viewsByDay.reduce((sum: number, day: any) => sum + day.unique_visitors, 0);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0s';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }

  const getLcpScore = (value: number) => {
    if (value <= 2.5) return { label: 'Bueno', color: 'text-green-600' };
    if (value <= 4.0) return { label: 'Necesita mejora', color: 'text-yellow-600' };
    return { label: 'Pobre', color: 'text-red-600' };
  };

  const getFidScore = (value: number) => {
    if (value <= 100) return { label: 'Bueno', color: 'text-green-600' };
    if (value <= 300) return { label: 'Necesita mejora', color: 'text-yellow-600' };
    return { label: 'Pobre', color: 'text-red-600' };
  };

  const getClsScore = (value: number) => {
    if (value <= 0.1) return { label: 'Bueno', color: 'text-green-600' };
    if (value <= 0.25) return { label: 'Necesita mejora', color: 'text-yellow-600' };
    return { label: 'Pobre', color: 'text-red-600' };
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Analíticas SEO" />

      <div className="space-y-6 p-6 min-h-screen">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analíticas SEO</h1>
            <p className="text-muted-foreground mt-1">Métricas de rendimiento y optimización web</p>
          </div>
          <div className="flex items-center gap-2">
          <Tabs 
            value={selectedPeriod} 
            onValueChange={handlePeriodChange}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="7d">7 días</TabsTrigger>
              <TabsTrigger value="30d">30 días</TabsTrigger>
              <TabsTrigger value="90d">90 días</TabsTrigger>
            </TabsList>
          </Tabs>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="traffic">Tráfico</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="errors">Errores</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Visitas Totales" 
                value={currentStats.totalVisits.toLocaleString()} 
                change={Number(changes.totalVisits.toFixed(1))} 
                icon={Eye} 
                color="blue" 
              />
              <MetricCard 
                title="Visitantes Únicos" 
                value={currentStats.uniqueVisitors.toLocaleString()} 
                change={Number(changes.uniqueVisitors.toFixed(1))} 
                icon={Users} 
                color="green" 
              />
              <MetricCard 
                title="Tasa de Rebote" 
                value={`${currentStats.bounceRate.toFixed(1)}%`} 
                change={Number(changes.bounceRate.toFixed(1))} 
                icon={MousePointer} 
                color="orange" 
              />
              <MetricCard 
                title="Tiempo Promedio" 
                value={formatTime(currentStats.avgTimeOnPage)} 
                change={Number(changes.avgTimeOnPage.toFixed(1))} 
                icon={Clock} 
                color="purple" 
              />
            </div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Visitas por Día
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {viewsByDay.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={viewsByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="unique_visitors" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                      🕒 Aún no hay analíticas disponibles...
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    Fuentes de Tráfico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trafficSources.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={trafficSources}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="visits"
                        >
                          {trafficSources.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                      🕒 Aún no hay analíticas disponibles...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Páginas más visitadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  Páginas Más Visitadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewsByUrl.length ? (
                  <div className="space-y-4">
                    {viewsByUrl.slice(0, 5).map((page: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <Layout className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{page.url}</p>
                            <p className="text-sm text-muted-foreground">
                              {page.unique_visitors} visitantes únicos
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{page.total}</p>
                          <p className="text-sm text-muted-foreground">
                            {page.bounce_rate}% rebote
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    🕒 Aún no hay analíticas disponibles...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  Páginas Más Visitadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewsByUrl.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-right">Visitas</TableHead>
                        <TableHead className="text-right">Visitantes Únicos</TableHead>
                        <TableHead className="text-right">Tasa Rebote</TableHead>
                        <TableHead className="text-right">Tiempo Prom.</TableHead>
                        <TableHead className="text-right">Conversiones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewsByUrl.map((page: any) => (
                        <TableRow key={page.url}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {page.url}
                          </TableCell>
                          <TableCell className="text-right">{page.total}</TableCell>
                          <TableCell className="text-right">{page.unique_visitors}</TableCell>
                          <TableCell className="text-right">{page.bounce_rate}%</TableCell>
                          <TableCell className="text-right">{formatTime(page.avg_time)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {page.conversions}
                              {page.conversion_rate > 0 && (
                                <span className="text-green-600 text-xs flex items-center">
                                  <ArrowUpRight className="h-3 w-3" />
                                  {page.conversion_rate}%
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    🕒 Aún no hay analíticas disponibles...
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Dispositivo</CardTitle>
                </CardHeader>
                <CardContent>
                  {deviceStats.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {deviceStats.map((device: any, idx: number) => (
                        <Card key={idx} className="text-center p-4">
                          <div className="flex justify-center mb-2">
                            <div className="bg-gray-100 p-2 rounded-full">
                              <DeviceIcon type={device.device_type} />
                            </div>
                          </div>
                          <h3 className="font-medium">{device.device_type}</h3>
                          <p className="text-3xl font-bold text-blue-600">{device.visits.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{device.percentage}% del total</p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                      🕒 Aún no hay analíticas disponibles...
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Países con más tráfico</CardTitle>
                </CardHeader>
                <CardContent>
                  {topCountriesTraffic.length ? (
                    <div className="space-y-4">
                      {topCountriesTraffic.map((country: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-sm">#{idx + 1}</span>
                            <span className="font-medium">{country.country || 'Desconocido'}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{country.visits}</p>
                            <p className="text-sm text-muted-foreground">
                              {country.unique_visitors} únicos
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                      🕒 Aún no hay analíticas disponibles...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Tasa de Rebote" 
                value={`${bounceRate.toFixed(1)}%`} 
                change={-3.2} 
                icon={MousePointer} 
                color="orange" 
              />
              <MetricCard 
                title="Tiempo Promedio" 
                value={formatTime(avgTimeOnPage)} 
                change={12.5} 
                icon={Clock} 
                color="purple" 
              />
              <MetricCard 
                title="Tasa de Conversión" 
                value={`${conversionRate.toFixed(2)}%`} 
                change={5.1} 
                icon={Zap} 
                color="green" 
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                {coreWebVitals.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Dispositivo</TableHead>
                        <TableHead className="text-right">LCP (s)</TableHead>
                        <TableHead className="text-right">FID (ms)</TableHead>
                        <TableHead className="text-right">CLS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coreWebVitals.map((vital: any, idx: number) => {
                        const lcpScore = getLcpScore(vital.avg_lcp);
                        const fidScore = getFidScore(vital.avg_fid);
                        const clsScore = getClsScore(vital.avg_cls);
                        
                        return (
                          <TableRow key={idx}>
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {vital.url}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <DeviceIcon type={vital.device_type} />
                                {vital.device_type}
                              </div>
                            </TableCell>
                            <TableCell className={`text-right ${lcpScore.color}`}>
                              {vital.avg_lcp?.toFixed(2)} <span className="text-xs">({lcpScore.label})</span>
                            </TableCell>
                            <TableCell className={`text-right ${fidScore.color}`}>
                              {vital.avg_fid?.toFixed(2)} <span className="text-xs">({fidScore.label})</span>
                            </TableCell>
                            <TableCell className={`text-right ${clsScore.color}`}>
                              {vital.avg_cls?.toFixed(4)} <span className="text-xs">({clsScore.label})</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    🕒 Aún no hay métricas de Core Web Vitals disponibles...
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de LCP</CardTitle>
              </CardHeader>
              <CardContent>
                {coreWebVitals.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="avg_lcp" name="LCP (s)" />
                      <YAxis type="number" dataKey="avg_cls" name="CLS" />
                      <ZAxis type="number" dataKey="avg_fid" name="FID (ms)" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Core Web Vitals" data={coreWebVitals} fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    🕒 Aún no hay métricas de Core Web Vitals disponibles...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-blue-600" />
                  Palabras Clave Principales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topKeywords.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Palabra Clave</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-right">Posición</TableHead>
                        <TableHead className="text-right">Clics</TableHead>
                        <TableHead className="text-right">Impresiones</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topKeywords.map((keyword: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{keyword.keyword}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{keyword.url}</TableCell>
                          <TableCell className="text-right">{keyword.avg_position?.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{keyword.total_clicks}</TableCell>
                          <TableCell className="text-right">{keyword.total_impressions?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{keyword.avg_ctr?.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    🕒 Aún no hay datos de palabras clave disponibles...
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-green-600" />
                  Enlaces Externos Más Visitados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewsByUrl.filter((page: any) => page.url.startsWith('http')).length ? (
                  <div className="space-y-4">
                    {viewsByUrl
                      .filter((page: any) => page.url.startsWith('http'))
                      .slice(0, 5)
                      .map((page: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <ExternalLink className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">{page.url}</p>
                              <p className="text-sm text-muted-foreground">
                                {page.unique_visitors} visitantes únicos
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{page.total}</p>
                            <p className="text-sm text-muted-foreground">
                              {page.bounce_rate}% rebote
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    🕒 No se han detectado enlaces externos visitados...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Errores Detectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seoErrors.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-right">Código</TableHead>
                        <TableHead className="text-right">Ocurrencias</TableHead>
                        <TableHead className="text-right">Última vez</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seoErrors.map((error: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{error.error_type}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{error.url}</TableCell>
                          <TableCell className="text-right">{error.status_code}</TableCell>
                          <TableCell className="text-right">{error.count}</TableCell>
                          <TableCell className="text-right">
                            {new Date(error.last_seen).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    🎉 ¡No se han detectado errores recientes!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}