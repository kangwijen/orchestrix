'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  Play,
  Square,
  RefreshCcw,
  Trash2,
  FileText,
  Box,
} from 'lucide-react';
import api from '@/lib/api';

import { AppTable } from '@/components/table/app-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { AppDialog } from '@/components/dialog/app-dialog';
import { AppLogs } from '@/components/dialog/app-logs';

type Container = {
  id: string;
  name: string;
  status: string;
  image: string;
  created: string;
  ports: any;
};

const startContainer = async (containerId: string) => {
  try {
    const response = await api.post(`/api/containers/start/${containerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const stopContainer = async (containerId: string) => {
  try {
    const response = await api.post(`/api/containers/stop/${containerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const restartContainer = async (containerId: string) => {
  try {
    const response = await api.post(`/api/containers/restart/${containerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const removeContainer = async (containerId: string, password: string) => {
  try {
    const response = await api.delete(`/api/containers/remove/${containerId}`, {
      data: { password },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default function ContainersManagePage() {
  const router = useRouter();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: 'stop' | 'restart' | 'remove';
    containerId: string | null;
  }>({
    open: false,
    type: 'stop',
    containerId: null,
  });

  const [logsDialog, setLogsDialog] = useState({
    open: false,
    containerId: null as string | null,
  });

  const openDialog = (
    type: 'stop' | 'restart' | 'remove',
    containerId: string,
  ) => {
    setDialogState({ open: true, type, containerId });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, open: false, containerId: null }));
  };

  const openLogsDialog = (containerId: string) => {
    setLogsDialog({ open: true, containerId });
  };

  const handleDialogConfirm = async (password?: string) => {
    if (!dialogState.containerId) return;

    try {
      switch (dialogState.type) {
        case 'stop':
          await handleStopContainer(dialogState.containerId);
          break;
        case 'restart':
          await handleRestartContainer(dialogState.containerId);
          break;
        case 'remove':
          await removeContainer(dialogState.containerId, password || '');
          toast.success('Container removed successfully');
          fetchContainers();
          break;
      }
      closeDialog();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${dialogState.type} container`,
      );
      closeDialog();
    }
  };

  const getDialogProps = () => {
    switch (dialogState.type) {
      case 'stop':
        return {
          title: 'Stop Container',
          description: 'Are you sure you want to stop this container?',
          variant: 'default' as const,
          confirmText: 'Stop',
        };
      case 'restart':
        return {
          title: 'Restart Container',
          description: 'Are you sure you want to restart this container?',
          variant: 'default' as const,
          confirmText: 'Restart',
        };
      case 'remove':
        return {
          title: 'Remove Container',
          description:
            'This action cannot be undone. Please confirm by entering your password.',
          variant: 'password' as const,
          confirmText: 'Remove',
        };
      default:
        return {
          title: '',
          description: '',
          variant: 'default' as const,
          confirmText: 'Confirm',
        };
    }
  };

  const fetchContainers = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get('/api/containers/list');
      setContainers(response.data);
    } catch (error) {
      console.error('Error fetching containers:', error);
      toast.error('Failed to fetch containers. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchContainers(true);
  };

  const handleStartContainer = async (containerId: string) => {
    try {
      const response = await startContainer(containerId);
      toast.success('Container started successfully');
      fetchContainers();
    } catch (error: any) {
      console.error('Error starting container:', error);
      toast.error(error.response?.data?.message || 'Failed to start container');
    }
  };

  const handleStopContainer = async (containerId: string) => {
    try {
      const response = await stopContainer(containerId);
      toast.success('Container stopped successfully');
      fetchContainers();
    } catch (error: any) {
      console.error('Error stopping container:', error);
      toast.error(error.response?.data?.message || 'Failed to stop container');
    }
  };

  const handleRestartContainer = async (containerId: string) => {
    try {
      const response = await restartContainer(containerId);
      toast.success('Container restarted successfully');
      fetchContainers();
    } catch (error: any) {
      console.error('Error restarting container:', error);
      toast.error(
        error.response?.data?.message || 'Failed to restart container',
      );
    }
  };

  const columns: ColumnDef<Container>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge
            variant={
              status === 'running'
                ? 'success'
                : status === 'exited'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'image',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Image
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">{row.getValue('image')}</div>
      ),
    },
    {
      accessorKey: 'created',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('created')}</div>,
    },
    {
      accessorKey: 'ports',
      header: 'Ports',
      cell: ({ row }) => {
        const ports = row.getValue('ports') as any;

        if (!ports || Object.keys(ports).length === 0) {
          return <div>None</div>;
        }

        const portDisplay = Object.entries(ports)
          .map(([portKey, value]) => {
            if (value === null) {
              return `${portKey.replace('/tcp', '')} (exposed)`;
            }

            const hostPorts = (value as any[])
              ?.map((p: any) => p.HostPort)
              .join(', ');

            return hostPorts
              ? `${portKey.replace('/tcp', '')} → ${hostPorts}`
              : null;
          })
          .filter(Boolean)
          .join(', ');

        return (
          <div className="max-w-[150px] truncate">{portDisplay || 'None'}</div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const container = row.original;
        const isRunning = container.status === 'running';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {!isRunning && (
                <DropdownMenuItem
                  onClick={() => handleStartContainer(container.id)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  <span>Start</span>
                </DropdownMenuItem>
              )}

              {isRunning && (
                <DropdownMenuItem
                  onClick={() => openDialog('stop', container.id)}
                >
                  <Square className="mr-2 h-4 w-4" />
                  <span>Stop</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => openDialog('restart', container.id)}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span>Restart</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => openLogsDialog(container.id)}>
                <FileText className="mr-2 h-4 w-4" />
                <span>View Logs</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => openDialog('remove', container.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Remove</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(() => fetchContainers(), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full flex-col gap-3 pb-6 sm:gap-4">
      <div className="bg-background sticky top-0 z-10 flex items-center justify-between py-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Manage Containers
        </h2>

        <div className="flex items-center gap-2">
          {refreshing ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Refreshing...</span>
            </div>
          ) : (
            <Button
              onClick={handleManualRefresh}
              variant="ghost"
              size="sm"
              className="h-9 px-2 sm:px-3"
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Refresh</span>
            </Button>
          )}
          <Button
            onClick={() => router.push('/dashboard/containers/create')}
            size="sm"
            className="h-9"
          >
            Create Container
          </Button>
        </div>
      </div>

      {loading && !containers.length ? (
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCcw className="text-muted-foreground h-8 w-8 animate-spin" />
                  <p className="text-muted-foreground text-sm">
                    Loading containers...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : containers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-3">
              <Box className="h-12 w-12 opacity-20" />
              <p>No containers found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/containers/create')}
              >
                Create your first container
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <AppTable
              columns={columns}
              data={containers}
              loading={loading && !containers.length}
              filterColumn="name"
              filterPlaceholder="Filter containers..."
              pageSize={10}
            />
          </CardContent>
        </Card>
      )}

      <AppLogs
        open={logsDialog.open}
        onOpenChange={open => setLogsDialog(prev => ({ ...prev, open }))}
        containerId={logsDialog.containerId}
      />

      <AppDialog
        open={dialogState.open}
        onOpenChange={closeDialog}
        onConfirm={handleDialogConfirm}
        {...getDialogProps()}
      />
    </div>
  );
}
