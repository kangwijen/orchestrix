'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  RefreshCcw,
  Trash2,
  Network,
  Link as LinkIcon,
  Link2Off,
  Check,
  ChevronsUpDown,
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
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { AppDialog } from '@/components/dialog/app-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type Network = {
  id: string;
  name: string;
  driver: string;
  scope: string;
  created: string;
  containers: number;
};

const removeNetwork = async (networkId: string, password: string) => {
  try {
    const response = await api.delete(`/api/networks/remove/${networkId}`, {
      data: { password },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default function NetworksManagePage() {
  const router = useRouter();
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    networkId: string | null;
  }>({
    open: false,
    networkId: null,
  });

  const [containers, setContainers] = useState<
    { id: string; name: string; status: string }[]
  >([]);
  const [connectDialog, setConnectDialog] = useState({
    open: false,
    networkId: null as string | null,
    networkName: null as string | null,
    actionType: 'connect' as 'connect' | 'disconnect',
  });
  const [selectedContainerIds, setSelectedContainerIds] = useState<string[]>(
    [],
  );
  const [selectedContainerId, setSelectedContainerId] = useState<string>('');
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const openDialog = (networkId: string) => {
    setDialogState({ open: true, networkId });
  };

  const closeDialog = () => {
    setDialogState({ open: false, networkId: null });
  };

  const handleDialogConfirm = async (password?: string) => {
    if (!dialogState.networkId) return;

    try {
      await removeNetwork(dialogState.networkId, password || '');
      toast.success('Network removed successfully');
      fetchNetworks();
      closeDialog();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove network');
      closeDialog();
    }
  };

  const getDialogProps = () => {
    return {
      title: 'Remove Network',
      description:
        'This action cannot be undone. Please confirm by entering your password.',
      variant: 'password' as const,
      confirmText: 'Remove',
    };
  };

  const fetchNetworks = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get('/api/networks/list');
      setNetworks(response.data);
    } catch (error) {
      console.error('Error fetching networks:', error);
      toast.error('Failed to fetch networks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchNetworks(true);
  };

  const openConnectDialog = (
    networkId: string,
    networkName: string,
    actionType: 'connect' | 'disconnect',
  ) => {
    setConnectDialog({
      open: true,
      networkId,
      networkName,
      actionType,
    });
    setSelectedContainerIds([]);
    fetchAvailableContainers(networkId, actionType);
  };

  const closeConnectDialog = () => {
    setConnectDialog(prev => ({ ...prev, open: false }));
  };

  const fetchAvailableContainers = async (
    networkId: string,
    actionType: 'connect' | 'disconnect',
  ) => {
    try {
      const response = await api.get('/api/containers/list');
      if (actionType === 'connect') {
        setContainers(response.data.filter((c: any) => c.status === 'running'));
      } else {
        const networkInfo = networks.find(n => n.id === networkId);
        if (networkInfo && networkInfo.containers > 0) {
          const connectedResponse = await api.get(
            `/api/networks/containers/${networkId}`,
          );
          setContainers(connectedResponse.data);
        } else {
          setContainers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching containers:', error);
      toast.error('Failed to fetch containers');
    }
  };

  const handleContainerNetworkAction = async () => {
    if (!connectDialog.networkId || selectedContainerIds.length === 0) return;

    setIsProcessing(true);

    try {
      for (const containerId of selectedContainerIds) {
        if (connectDialog.actionType === 'connect') {
          await api.post('/api/networks/connect', {
            networkId: connectDialog.networkId,
            containerId,
          });
        } else {
          await api.post('/api/networks/disconnect', {
            networkId: connectDialog.networkId,
            containerId,
          });
        }
      }

      const action =
        connectDialog.actionType === 'connect'
          ? 'connected to'
          : 'disconnected from';
      toast.success(
        `Containers ${action} ${connectDialog.networkName} network`,
      );
      fetchNetworks();
      closeConnectDialog();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${connectDialog.actionType} containers`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getContainerNameById = (id: string) => {
    const container = containers.find(c => c.id === id);
    return container ? container.name : id;
  };

  const columns: ColumnDef<Network>[] = [
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
      cell: ({ row }) => {
        const scope = row.getValue('scope') as string;
        return <div>{scope}</div>;
      },
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
      accessorKey: 'containers',
      header: 'Connected Containers',
      cell: ({ row }) => {
        const containerCount = row.getValue('containers') as number;
        return <div>{containerCount}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const network = row.original;
        const isSystemNetwork =
          network.name === 'bridge' ||
          network.name === 'host' ||
          network.name === 'none';

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

              <DropdownMenuItem
                onClick={() =>
                  openConnectDialog(network.id, network.name, 'connect')
                }
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                <span>Connect Container</span>
              </DropdownMenuItem>

              {network.containers > 0 && (
                <DropdownMenuItem
                  onClick={() =>
                    openConnectDialog(network.id, network.name, 'disconnect')
                  }
                >
                  <Link2Off className="mr-2 h-4 w-4" />
                  <span>Disconnect Container</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {!isSystemNetwork && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => openDialog(network.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Remove</span>
                </DropdownMenuItem>
              )}

              {isSystemNetwork && (
                <DropdownMenuItem disabled>
                  <span className="text-muted-foreground">
                    System network (cannot modify)
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    fetchNetworks();
    const interval = setInterval(() => fetchNetworks(), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full flex-col gap-3 pb-6 sm:gap-4">
      <div className="bg-background sticky top-0 z-10 flex items-center justify-between py-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Manage Networks
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
            onClick={() => router.push('/dashboard/networks/create')}
            size="sm"
            className="h-9"
          >
            Create Network
          </Button>
        </div>
      </div>

      {loading && !networks.length ? (
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCcw className="text-muted-foreground h-8 w-8 animate-spin" />
                  <p className="text-muted-foreground text-sm">
                    Loading networks...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : networks.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-3">
              <Network className="h-12 w-12 opacity-20" />
              <p>No networks found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/networks/create')}
              >
                Create your first network
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <AppTable
              columns={columns}
              data={networks}
              loading={loading && !networks.length}
              filterColumn="name"
              filterPlaceholder="Filter networks..."
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

      <Dialog
        open={connectDialog.open}
        onOpenChange={open =>
          !isProcessing && setConnectDialog(prev => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {connectDialog.actionType === 'connect'
                ? 'Connect'
                : 'Disconnect'}{' '}
              Containers
            </DialogTitle>
            <DialogDescription>
              {connectDialog.actionType === 'connect'
                ? `Select containers to connect to the ${connectDialog.networkName} network.`
                : `Select containers to disconnect from the ${connectDialog.networkName} network.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {containers.length === 0 ? (
              <div className="text-muted-foreground text-center">
                {connectDialog.actionType === 'connect'
                  ? 'No available containers to connect'
                  : 'No connected containers to disconnect'}
              </div>
            ) : (
              <div className="space-y-4">
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between"
                    >
                      {selectedContainerIds.length === 0
                        ? 'Select containers...'
                        : `${selectedContainerIds.length} container${
                            selectedContainerIds.length > 1 ? 's' : ''
                          } selected`}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search containers..."
                        className="h-9"
                      />
                      <CommandEmpty>No containers found.</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-60">
                          {containers.map(container => (
                            <CommandItem
                              key={container.id}
                              value={container.id}
                              onSelect={() => {
                                setSelectedContainerIds(prev => {
                                  const isSelected = prev.includes(
                                    container.id,
                                  );
                                  if (isSelected) {
                                    return prev.filter(
                                      id => id !== container.id,
                                    );
                                  } else {
                                    return [...prev, container.id];
                                  }
                                });
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedContainerIds.includes(container.id)
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              <div className="flex items-center">
                                <span>{container.name}</span>
                                <Badge
                                  className="ml-2"
                                  variant={
                                    container.status === 'running'
                                      ? 'success'
                                      : 'outline'
                                  }
                                >
                                  {container.status}
                                </Badge>
                              </div>
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedContainerIds.length > 0 && (
                  <div className="rounded-md border p-2">
                    <h4 className="mb-2 text-sm font-medium">
                      Selected containers:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedContainerIds.map(id => (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {getContainerNameById(id)}
                          <button
                            onClick={() => {
                              setSelectedContainerIds(prev =>
                                prev.filter(prevId => prevId !== id),
                              );
                            }}
                            className="hover:bg-muted ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-xs"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeConnectDialog}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContainerNetworkAction}
              disabled={isProcessing || selectedContainerIds.length === 0}
            >
              {isProcessing
                ? connectDialog.actionType === 'connect'
                  ? 'Connecting...'
                  : 'Disconnecting...'
                : connectDialog.actionType === 'connect'
                  ? 'Connect'
                  : 'Disconnect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
