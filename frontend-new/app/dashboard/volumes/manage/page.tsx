'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  RefreshCcw,
  Trash2,
  HardDrive,
  Info,
  List,
} from 'lucide-react';
import { AppTable } from '@/components/table/app-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { AppDialog } from '@/components/dialog/app-dialog';
import { AppInspect } from '@/components/dialog/app-inspect';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { volumeApi } from '@/lib/api';

type Volume = {
  name: string;
  driver: string;
  scope?: string;
  mountpoint?: string;
  created: string;
  size?: number;
  containers: number;
};

type VolumeContainer = {
  id: string;
  name: string;
  status: string;
  mountpoint?: string;
};

const formatBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null || bytes < 0) {
    return 'Unknown';
  }
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export default function VolumesManagePage() {
  const router = useRouter();
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    volumeName: string | null;
  }>({
    open: false,
    volumeName: null,
  });
  const [inspectDialog, setInspectDialog] = useState({
    open: false,
    volumeName: null as string | null,
    data: null as any,
  });
  const [containersDialog, setContainersDialog] = useState({
    open: false,
    volumeName: null as string | null,
    containers: [] as VolumeContainer[],
  });

  const fetchVolumes = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await volumeApi.listVolumes();
      setVolumes(response);
    } catch (error) {
      console.error('Error fetching volumes:', error);
      toast.error('Failed to fetch volumes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVolumes();
    const interval = setInterval(() => fetchVolumes(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    fetchVolumes(true);
  };

  const openDialog = (volumeName: string) => {
    setDialogState({ open: true, volumeName });
  };

  const closeDialog = () => {
    setDialogState({ open: false, volumeName: null });
  };

  const handleDialogConfirm = async (password?: string) => {
    if (!dialogState.volumeName) return;

    try {
      await volumeApi.removeVolume(dialogState.volumeName, {
        password: password || '',
      });
      toast.success('Volume removed successfully');
      fetchVolumes();
      closeDialog();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to remove volume. Please ensure it is not in use.',
      );
      closeDialog();
    }
  };

  const getDialogProps = () => {
    return {
      title: 'Remove Volume',
      description:
        'This action cannot be undone. Please confirm by entering your password.',
      variant: 'password' as const,
      confirmText: 'Remove',
    };
  };

  const openInspectDialog = async (volumeName: string) => {
    try {
      const response = await volumeApi.inspectVolume(volumeName);
      setInspectDialog({
        open: true,
        volumeName,
        data: response,
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to inspect volume',
      );
    }
  };

  const openContainersDialog = async (volumeName: string) => {
    try {
      const response = await volumeApi.getVolumeContainers(volumeName);
      setContainersDialog({
        open: true,
        volumeName,
        containers: response,
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to fetch attached containers',
      );
    }
  };

  const closeContainersDialog = () => {
    setContainersDialog(prev => ({ ...prev, open: false }));
  };

  const columns: ColumnDef<Volume>[] = [
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
      accessorKey: 'driver',
      header: 'Driver',
      cell: ({ row }) => {
        const driver = row.getValue('driver') as string;
        return <Badge variant="outline">{driver}</Badge>;
      },
    },
    {
      accessorKey: 'scope',
      header: 'Scope',
      cell: ({ row }) => <div>{row.getValue('scope') || 'local'}</div>,
    },
    {
      accessorKey: 'mountpoint',
      header: 'Mountpoint',
      cell: ({ row }) => (
        <div className="max-w-[220px] truncate">
          {row.getValue('mountpoint') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => <div>{formatBytes(row.getValue('size') as number)}</div>,
    },
    {
      accessorKey: 'containers',
      header: 'Attached Containers',
      cell: ({ row }) => <div>{row.getValue('containers')}</div>,
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
      id: 'actions',
      cell: ({ row }) => {
        const volume = row.original;

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

              <DropdownMenuItem onClick={() => openInspectDialog(volume.name)}>
                <Info className="mr-2 h-4 w-4" />
                <span>Inspect Volume</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={volume.containers === 0}
                onClick={() => openContainersDialog(volume.name)}
              >
                <List className="mr-2 h-4 w-4" />
                <span>View Containers</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => openDialog(volume.name)}
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

  return (
    <div className="flex w-full flex-col gap-3 pb-6 sm:gap-4">
      <div className="bg-background sticky top-0 z-10 flex items-center justify-between py-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Manage Volumes
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
            onClick={() => router.push('/dashboard/volumes/create')}
            size="sm"
            className="h-9"
          >
            Create Volume
          </Button>
        </div>
      </div>

      {loading && !volumes.length ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3">
              <RefreshCcw className="text-muted-foreground h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading volumes...</p>
            </div>
          </CardContent>
        </Card>
      ) : volumes.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-3">
              <HardDrive className="h-12 w-12 opacity-20" />
              <p>No volumes found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/volumes/create')}
              >
                Create your first volume
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <AppTable
              columns={columns}
              data={volumes}
              loading={loading && !volumes.length}
              filterColumn="name"
              filterPlaceholder="Filter volumes..."
              pageSize={10}
            />
          </CardContent>
        </Card>
      )}

      <AppDialog
        open={dialogState.open}
        onOpenChange={closeDialog}
        onConfirm={handleDialogConfirm}
        {...getDialogProps()}
      />

      <AppInspect
        open={inspectDialog.open}
        onOpenChange={open =>
          setInspectDialog(prev => ({ ...prev, open, data: null }))
        }
        resourceId={inspectDialog.volumeName}
        data={inspectDialog.data}
        title="Volume Inspection"
        description={
          inspectDialog.volumeName
            ? `Detailed information for volume: ${inspectDialog.volumeName}`
            : 'Detailed volume information'
        }
      />

      <Dialog open={containersDialog.open} onOpenChange={closeContainersDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Attached Containers</DialogTitle>
            <DialogDescription>
              Containers currently using volume: {containersDialog.volumeName}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-72">
            {containersDialog.containers.length > 0 ? (
              <div className="space-y-3">
                {containersDialog.containers.map(container => (
                  <div
                    key={container.id}
                    className="rounded-md border p-3 text-sm"
                  >
                    <p className="font-medium">{container.name}</p>
                    <p className="text-muted-foreground">
                      Status: {container.status}
                    </p>
                    {container.mountpoint && (
                      <p className="text-muted-foreground">
                        Mountpoint: {container.mountpoint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No containers are currently using this volume.
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}


