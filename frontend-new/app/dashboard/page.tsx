'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
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
          hour12: false,
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
        <p className="text-muted-foreground flex items-center gap-1 text-[9px] sm:text-xs">
          <TrendingUp className="h-2.5 w-2.5 text-green-500" />+{change}% from
          average
        </p>
      );
    } else if (change < 0) {
      return (
        <p className="text-muted-foreground flex items-center gap-1 text-[9px] sm:text-xs">
          <TrendingDown className="h-2.5 w-2.5 text-red-500" />
          {change}% from average
        </p>
      );
    } else {
      return (
        <p className="text-muted-foreground flex items-center gap-1 text-[9px] sm:text-xs">
          <Minus className="h-2.5 w-2.5 text-gray-500" />
          No change
        </p>
      );
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-full w-full flex-col gap-3 p-2 sm:p-4 md:p-6">
        <div className="flex items-center justify-between py-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4 md:gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-lg sm:h-18" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-7">
          <Skeleton className="h-60 w-full rounded-lg lg:col-span-4" />
          <Skeleton className="h-60 w-full rounded-lg lg:col-span-3" />
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
    <div className="flex w-full flex-col gap-3 pb-6 sm:gap-4">
      <div className="bg-background sticky top-0 z-10 flex items-center justify-between py-2">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Dashboard
        </h2>
        <div className="flex items-center gap-2">
          {refreshing ? (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span className="hidden sm:inline">Refreshing...</span>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              className="h-8 px-2 sm:px-3"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="ml-1 hidden sm:inline">Refresh</span>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-3 sm:space-y-4">
        <TabsContent value="overview" className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4 md:gap-3">
            {[
              {
                title: 'Containers',
                icon: <Server className="text-primary h-3.5 w-3.5" />,
                value: dashboardStats.container_count,
                change: dashboardStats.container_change,
              },
              {
                title: 'Networks',
                icon: <Network className="text-primary h-3.5 w-3.5" />,
                value: dashboardStats.network_count,
                change: dashboardStats.network_change,
              },
              {
                title: 'Volumes',
                icon: <HardDrive className="text-primary h-3.5 w-3.5" />,
                value: dashboardStats.volume_count,
                change: dashboardStats.volume_change,
              },
              {
                title: 'System Load',
                icon: <Activity className="text-primary h-3.5 w-3.5" />,
                value: `${dashboardStats.system_load}%`,
                change: dashboardStats.load_change,
              },
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="flex flex-row items-center justify-between p-6">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-1.5 text-xs font-medium">
                      {item.icon}
                      {item.title}
                    </CardTitle>
                    <div className="text-lg font-semibold sm:text-xl">
                      {item.value}
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-full p-1.5">
                    {renderChangeIndicator(item.change)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-7">
            <Card className="col-span-1 border-0 shadow-sm lg:col-span-4">
              <CardHeader className="p-6 pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Activity className="text-primary h-4 w-4" />
                    Resource Usage
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  System resource utilization over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <div className="h-[190px] w-full sm:h-[200px]">
                  {resourceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={resourceData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: 0,
                          bottom: 30,
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
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--primary)"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                          opacity={0.4}
                        />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 9 }}
                          angle={-45}
                          textAnchor="end"
                          height={50}
                          tickMargin={8}
                          stroke="var(--muted-foreground)"
                          tickSize={3}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 9 }}
                          stroke="var(--muted-foreground)"
                          tickCount={5}
                          axisLine={false}
                          tickSize={3}
                          label={{
                            value: 'Load (%)',
                            angle: -90,
                            position: 'insideLeft',
                            style: {
                              textAnchor: 'middle',
                              fill: 'var(--muted-foreground)',
                              fontSize: 10,
                            },
                            dy: 30,
                          }}
                        />
                        <Tooltip
                          formatter={value => [`${value}%`, 'System Load']}
                          contentStyle={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            padding: '6px 8px',
                            fontSize: '11px',
                          }}
                          cursor={{
                            stroke: 'var(--muted-foreground)',
                            strokeWidth: 1,
                            strokeDasharray: '4 4',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="load"
                          name="System Load"
                          stroke="var(--primary)"
                          fillOpacity={1}
                          fill="url(#colorLoad)"
                          strokeWidth={1.5}
                          activeDot={{
                            r: 4,
                            strokeWidth: 1,
                            stroke: 'var(--background)',
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="bg-muted/5 flex h-full w-full items-center justify-center rounded-lg">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="text-muted-foreground h-6 w-6" />
                        <p className="text-muted-foreground text-xs">
                          Loading chart data...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 border-0 shadow-sm lg:col-span-3">
              <CardHeader className="p-6 pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Clock className="text-primary h-4 w-4" />
                    Recent Activities
                  </CardTitle>
                  <span className="text-muted-foreground text-xs font-normal">
                    {activities.length} events
                  </span>
                </div>
                <CardDescription className="text-xs">
                  Latest system events
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {activities.length > 0 ? (
                  <div className="max-h-[190px] overflow-y-auto sm:max-h-[200px]">
                    {activities.map((activity, index) => (
                      <div
                        key={index}
                        className="hover:bg-muted/5 flex items-center gap-2 border-b p-2.5 last:border-0"
                      >
                        <div className="bg-primary/5 text-primary rounded-full p-1.5">
                          {activity.type === 'container' ? (
                            <Server className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          ) : activity.type === 'volume' ? (
                            <HardDrive className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          ) : activity.type === 'network' ? (
                            <Network className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          ) : (
                            <Box className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium sm:text-xs">
                            {activity.name || activity.id || 'Unknown'}
                          </p>
                          <p className="text-muted-foreground truncate text-xs sm:text-xs">
                            {activity.status} {activity.type}
                          </p>
                        </div>
                        <div className="text-muted-foreground sm:text-s flex items-center gap-1 text-xs whitespace-nowrap">
                          <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                          {formatDistanceToNow(new Date(activity.time), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/5 flex h-[190px] items-center justify-center sm:h-[200px]">
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                      <Box className="h-10 w-10 opacity-20" />
                      <p className="text-xs">No recent activities</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm sm:text-base">
                Dashboard Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Configure your dashboard preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <p className="text-muted-foreground text-xs">
                Dashboard settings will be available soon. Stay tuned for
                updates!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
