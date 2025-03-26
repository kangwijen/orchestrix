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
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <Tabs defaultValue="overview" className="w-full space-y-4">
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Server className="text-primary h-4 w-4" />
                  Total Containers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +2 from last week
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Network className="text-primary h-4 w-4" />
                  Networks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +1 from last week
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <HardDrive className="text-primary h-4 w-4" />
                  Volumes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Minus className="h-3 w-3 text-gray-500" />
                  No change
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="text-primary h-4 w-4" />
                  System Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24%</div>
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  -8% from average
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
            <Card className="col-span-1 transition-all duration-200 hover:shadow-md lg:col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="text-primary h-5 w-5" />
                  Resource Usage
                </CardTitle>
                <CardDescription>
                  System resource utilization over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="from-muted/5 to-muted/20 flex h-[250px] flex-col items-center justify-center rounded-b-lg border-t bg-gradient-to-r p-6">
                  <div className="flex w-full max-w-md flex-col items-center">
                    <div className="bg-muted/50 mb-2 h-2 w-full overflow-hidden rounded-full">
                      <div className="bg-primary h-full w-3/4 rounded-full"></div>
                    </div>
                    <div className="bg-muted/50 mb-2 h-2 w-full overflow-hidden rounded-full">
                      <div className="h-full w-1/2 rounded-full bg-blue-400"></div>
                    </div>
                    <div className="bg-muted/50 h-2 w-full overflow-hidden rounded-full">
                      <div className="h-full w-1/4 rounded-full bg-green-400"></div>
                    </div>
                    <p className="text-muted-foreground mt-4 text-sm">
                      Interactive chart coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 transition-all duration-200 hover:shadow-md lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest container and system events
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-muted/20 flex h-[200px] items-center justify-center">
                Activity log placeholder
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
