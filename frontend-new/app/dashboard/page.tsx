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
  Minus
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
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  Total Containers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-muted-foreground text-xs flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +2 from last week
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" />
                  Networks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-muted-foreground text-xs flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +1 from last week
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-primary" />
                  Volumes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-muted-foreground text-xs flex items-center gap-1">
                  <Minus className="h-3 w-3 text-gray-500" />
                  No change
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  System Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24%</div>
                <p className="text-muted-foreground text-xs flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  -8% from average
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4 transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Resource Usage
                </CardTitle>
                <CardDescription>
                  System resource utilization over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-muted/5 to-muted/20 p-6 h-[250px] flex flex-col items-center justify-center rounded-b-lg border-t">
                  <div className="w-full max-w-md flex flex-col items-center">
                    <div className="w-full h-2 bg-muted/50 rounded-full mb-2 overflow-hidden">
                      <div className="h-full w-3/4 bg-primary rounded-full"></div>
                    </div>
                    <div className="w-full h-2 bg-muted/50 rounded-full mb-2 overflow-hidden">
                      <div className="h-full w-1/2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-green-400 rounded-full"></div>
                    </div>
                    <p className="text-muted-foreground text-sm mt-4">Interactive chart coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3 transition-all duration-200 hover:shadow-md">
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
