'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Server,
  Network,
  HardDrive,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Box,
  RefreshCw,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Activity {
  id: string;
  name: string;
  status: string;
  time: string;
  type: string;
}

interface ResourceDataPoint {
  time: string;
  load: number;
}

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState({
    container_change: 0,
    container_count: 0,
    network_count: 0,
    volume_count: 0,
    system_load: 0,
    network_change: 0,
    volume_change: 0,
    load_change: 0,
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceData, setResourceData] = useState<ResourceDataPoint[]>([]);

  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      }

      const stats = await dashboardApi.getStats();
      const recentActivities = await dashboardApi.getActivities();

      setDashboardStats(stats);

      const newDataPoint = {
        time: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        load: stats.system_load,
      };

      setResourceData(prevData => {
        const newData = [...prevData, newDataPoint];
        return newData.length > 20 ? newData.slice(-20) : newData;
      });

      const sortedActivities: Activity[] = recentActivities.sort(
        (a: Activity, b: Activity) =>
          new Date(b.time).getTime() - new Date(a.time).getTime(),
      );
      setActivities(sortedActivities);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(() => fetchDashboardData(), 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleManualRefresh = () => {
    fetchDashboardData(true);
  };

  function renderChangeIndicator(change: number) {
    if (change > 0) {
      return (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-green-500" />+{change}% from
          average
        </p>
      );
    } else if (change < 0) {
      return (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingDown className="h-3 w-3 text-red-500" />
          {change}% from average
        </p>
      );
    } else {
      return (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Minus className="h-3 w-3 text-gray-500" />
          No change
        </p>
      );
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-[80vh] w-full flex-col gap-6 p-2 sm:p-4 md:p-6">
        <div className="flex items-center justify-between py-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
          <Skeleton className="h-80 w-full rounded-lg lg:col-span-4" />
          <Skeleton className="h-80 w-full rounded-lg lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center p-8 text-red-500">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
            <Box className="h-12 w-12" />
          </div>
          <p className="text-lg font-medium">{error}</p>
          <Button 
            variant="outline" 
            onClick={handleManualRefresh}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-8 sm:gap-6">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background py-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h2>
        <div className="flex items-center gap-2">
          {refreshing ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Refreshing...</span>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleManualRefresh}
              className="h-9 px-2 sm:px-3"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Refresh</span>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-4 sm:space-y-6">
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {[
              {
                title: 'Containers',
                icon: <Server className="h-4 w-4 text-primary" />,
                value: dashboardStats.container_count,
                change: dashboardStats.container_change,
              },
              {
                title: 'Networks',
                icon: <Network className="h-4 w-4 text-primary" />,
                value: dashboardStats.network_count,
                change: dashboardStats.network_change,
              },
              {
                title: 'Volumes',
                icon: <HardDrive className="h-4 w-4 text-primary" />,
                value: dashboardStats.volume_count,
                change: dashboardStats.volume_change,
              },
              {
                title: 'System Load',
                icon: <Activity className="h-4 w-4 text-primary" />,
                value: `${dashboardStats.system_load}%`,
                change: dashboardStats.load_change,
              },
            ].map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    {item.icon}
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-xl font-bold sm:text-2xl">{item.value}</div>
                  {renderChangeIndicator(item.change)}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            {/* Resource Usage Card */}
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="h-5 w-5 text-primary" />
                  Resource Usage
                </CardTitle>
                <CardDescription>
                  System resource utilization over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                <div className="h-[240px] w-full sm:h-[280px]">
                  {resourceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={resourceData}
                        margin={{ 
                          top: 10, 
                          right: 10, 
                          left: 0, 
                          bottom: 30 
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="colorLoad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--primary)"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--primary)"
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tickMargin={8}
                          stroke="var(--muted-foreground)"
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 11 }}
                          stroke="var(--muted-foreground)"
                          tickCount={6}
                          label={{
                            value: 'Load (%)',
                            angle: -90,
                            position: 'insideLeft',
                            style: {
                              textAnchor: 'middle',
                              fill: 'var(--muted-foreground)',
                              fontSize: 12,
                            },
                            dy: 50,
                          }}
                        />
                        <Tooltip
                          formatter={value => [`${value}%`, 'System Load']}
                          contentStyle={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          }}
                          cursor={{
                            stroke: 'var(--muted-foreground)',
                            strokeWidth: 1,
                            strokeDasharray: '4 4',
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: '10px',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="load"
                          name="System Load"
                          stroke="var(--primary)"
                          fillOpacity={1}
                          fill="url(#colorLoad)"
                          strokeWidth={2}
                          activeDot={{ r: 6, strokeWidth: 1, stroke: 'var(--background)' }}
                          isAnimationActive={true}
                          animationDuration={500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted/10">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Loading chart data...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activities
                </CardTitle>
                <CardDescription>
                  Latest system events
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {activities.length > 0 ? (
                  <div className="max-h-[240px] divide-y overflow-y-auto sm:max-h-[280px]">
                    {activities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 sm:p-4"
                      >
                        <div className="rounded-full bg-primary/10 p-2">
                          {activity.type === 'container' ? (
                            <Server className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                          ) : activity.type === 'volume' ? (
                            <HardDrive className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                          ) : activity.type === 'network' ? (
                            <Network className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                          ) : (
                            <Box className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium sm:text-sm">
                            {activity.name || activity.id || 'Unknown'}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                            {activity.status} {activity.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 whitespace-nowrap text-[10px] text-muted-foreground sm:text-xs">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          {formatDistanceToNow(new Date(activity.time), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[240px] items-center justify-center bg-muted/10 sm:h-[280px]">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Box className="h-12 w-12 opacity-20" />
                      <p>No recent activities</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
              <CardDescription>
                Configure your dashboard preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Dashboard settings will be available soon. Stay tuned for updates!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
