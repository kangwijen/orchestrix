import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AppStatsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  containerId: string | null;
  data: any;
}

export function AppStats({
  open,
  onOpenChange,
  containerId,
  data,
}: AppStatsProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const calculateCpuPercent = (stats: any) => {
    if (!stats.cpu_stats || !stats.precpu_stats) return 0;

    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta =
      stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || 1;

    if (systemDelta > 0 && cpuDelta > 0) {
      return ((cpuDelta / systemDelta) * cpuCount * 100).toFixed(2);
    }
    return 0;
  };

  const calculateMemoryPercent = (stats: any) => {
    if (!stats.memory_stats || !stats.memory_stats.usage) return 0;
    const usage = stats.memory_stats.usage;
    const limit = stats.memory_stats.limit;
    return ((usage / limit) * 100).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[95vw] max-w-[1800px] flex-col p-2 sm:w-[90vw] sm:p-4 md:w-[85vw] md:p-6 lg:w-[80vw] xl:w-[75vw]">
        <DialogHeader className="mb-2">
          <DialogTitle>Container Stats</DialogTitle>
          <DialogDescription className="truncate">
            Real-time statistics for container: {containerId}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {data ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    CPU Usage
                  </h3>
                  <p className="mt-2 text-2xl font-bold">
                    {calculateCpuPercent(data)}%
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Memory Usage
                  </h3>
                  <p className="mt-2 text-2xl font-bold">
                    {calculateMemoryPercent(data)}%
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {formatBytes(data.memory_stats?.usage || 0)} /{' '}
                    {formatBytes(data.memory_stats?.limit || 0)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Network I/O
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">RX (Received)</p>
                    <p className="text-lg font-semibold">
                      {formatBytes(
                        data.networks?.eth0?.rx_bytes ||
                          (Object.values(data.networks || {})[0] as any)?.rx_bytes ||
                          0,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">TX (Transmitted)</p>
                    <p className="text-lg font-semibold">
                      {formatBytes(
                        data.networks?.eth0?.tx_bytes ||
                          (Object.values(data.networks || {})[0] as any)?.tx_bytes ||
                          0,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Block I/O
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Read</p>
                    <p className="text-lg font-semibold">
                      {formatBytes(
                        data.blkio_stats?.io_service_bytes_recursive?.find(
                          (item: any) => item.op === 'read',
                        )?.value || 0,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Write</p>
                    <p className="text-lg font-semibold">
                      {formatBytes(
                        data.blkio_stats?.io_service_bytes_recursive?.find(
                          (item: any) => item.op === 'write',
                        )?.value || 0,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <details className="rounded-lg border bg-card">
                <summary className="cursor-pointer p-4 font-medium">
                  View Raw Stats JSON
                </summary>
                <pre className="overflow-y-auto rounded-md bg-slate-950 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No stats available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

