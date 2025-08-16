export interface AnalyticsData {
  viewsByUrl: Array<{
    url: string;
    total: number;
    unique_visitors: number;
    bounce_rate: number;
    avg_time: number;
    conversions: number;
    conversion_rate: number;
  }>;
  
  viewsByDay: Array<{
    day: string;
    total: number;
    unique_visitors: number;
    bounce_rate: number;
    avg_time_on_page: number;
  }>;
  
  trafficSources: Array<{
    source: string;
    visits: number;
    unique_visitors: number;
    percentage: number;
  }>;
  
  topKeywords: Array<{
    keyword: string;
    url: string;
    avg_position: number;
    total_clicks: number;
    total_impressions: number;
    avg_ctr: number;
  }>;
  
  deviceStats: Array<{
    device_type: string;
    visits: number;
    unique_visitors: number;
    percentage: number;
  }>;
  
  bounceRate: number;
  avgTimeOnPage: number;
  conversionRate: number;
  topCountriesTraffic: Array<{
    country: string;
    visits: number;
    unique_visitors: number;
  }>;
  
  coreWebVitals: Array<{
    url: string;
    device_type: string;
    avg_lcp: number;
    avg_fid: number;
    avg_cls: number;
    avg_fcp: number;
    avg_ttfb: number;
  }>;
  
  seoErrors: Array<{
    url: string;
    status_code: number;
    error_type: string;
    count: number;
    last_seen: string;
  }>;
  
  period: string;
  currentStats: {
    totalVisits: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgTimeOnPage: number;
  };
  
  previousStats: {
    totalVisits: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgTimeOnPage: number;
  };
}